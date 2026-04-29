# backend/konnaxion/ethikos/demo_import/importer.py

from __future__ import annotations

from collections import defaultdict
from typing import Any

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import FieldDoesNotExist
from django.db import transaction
from django.utils.dateparse import parse_date

from konnaxion.ethikos.models_demo import DemoScenarioImport

from .schema import (
    DEFAULT_IMPORT_MODE,
    DEMO_EMAIL_DOMAIN,
    DEMO_TOPIC_TITLE_PREFIX,
    DEMO_USERNAME_PREFIX,
    TRACK_OBJECT_TYPES,
    normalize_demo_scenario,
    summarize_scenario_payload,
    validate_demo_scenario,
)


User = get_user_model()

ETHIKOS_APP_LABEL = "ethikos"


# ---------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------


def validate_and_preview_ethikos_demo_scenario(data: dict) -> dict:
    """
    Validate a demo scenario JSON payload without writing anything.

    Used by:
    - POST /api/ethikos/demo-scenarios/preview/
    - importer dry_run=True
    """
    if not isinstance(data, dict):
        errors = validate_demo_scenario(data)
        return {
            "ok": False,
            "dry_run": True,
            "scenario_key": None,
            "summary": summarize_scenario({}),
            "errors": errors,
            "warnings": [],
        }

    payload = normalize_demo_scenario(data)
    errors = validate_demo_scenario(payload)
    scenario_key = payload.get("scenario_key")

    if errors:
        return {
            "ok": False,
            "dry_run": True,
            "scenario_key": scenario_key,
            "summary": summarize_scenario(payload),
            "errors": errors,
            "warnings": [],
        }

    warnings = _collect_non_blocking_warnings(payload)

    return {
        "ok": True,
        "dry_run": True,
        "scenario_key": scenario_key,
        "summary": summarize_scenario(payload),
        "created": [],
        "updated": [],
        "deleted": [],
        "warnings": warnings,
    }


def import_ethikos_demo_scenario(
    data: dict,
    *,
    imported_by=None,
    dry_run: bool = False,
) -> dict:
    """
    Import one ethiKos demo scenario from JSON.

    Contract:
    - JSON is the demo source of truth.
    - Import writes demo source facts into ethiKos/Korum and Konsultations tables.
    - Smart Vote readings should be recomputed elsewhere from the source facts.
    - replace_scenario deletes only objects tracked under the same scenario_key.
    """
    preview = validate_and_preview_ethikos_demo_scenario(data)

    if dry_run or not preview["ok"]:
        return preview

    payload = normalize_demo_scenario(data)

    scenario_key = payload["scenario_key"]
    mode = payload.get("mode") or DEFAULT_IMPORT_MODE

    result = {
        "ok": True,
        "dry_run": False,
        "scenario_key": scenario_key,
        "summary": summarize_scenario(payload),
        "created": [],
        "updated": [],
        "deleted": [],
        "warnings": list(preview.get("warnings", [])),
    }

    try:
        with transaction.atomic():
            if mode == "replace_scenario":
                reset_result = reset_ethikos_demo_scenario(
                    scenario_key,
                    reset_by=imported_by,
                )
                result["deleted"] = reset_result.get("deleted", [])
                result["warnings"].extend(reset_result.get("warnings", []))

            context = _ImportContext(
                scenario_key=scenario_key,
                imported_by=imported_by,
                result=result,
            )

            actors = _import_actors(payload, context)
            categories = _import_categories(payload, context)
            topics = _import_topics(payload, context, categories, actors)
            _import_stances(payload, context, actors, topics)
            _import_arguments(payload, context, actors, topics)

            consultations = _import_consultations(payload, context)
            _import_consultation_votes(payload, context, actors, consultations)
            _import_consultation_results(payload, context, consultations)
            _import_impact_items(payload, context, consultations)

    except Exception as exc:
        return {
            "ok": False,
            "dry_run": False,
            "scenario_key": scenario_key,
            "summary": summarize_scenario(payload),
            "errors": [
                {
                    "path": "import",
                    "message": str(exc),
                }
            ],
            "warnings": result.get("warnings", []),
            "created": result.get("created", []),
            "updated": result.get("updated", []),
            "deleted": result.get("deleted", []),
        }

    return result


def reset_ethikos_demo_scenario(
    scenario_key: str,
    *,
    reset_by=None,
) -> dict:
    """
    Delete all objects previously tracked for one demo scenario.

    This avoids broad deletes like:
    - User.objects.filter(username__startswith="demo_").delete()
    - EthikosTopic.objects.filter(title__startswith="[DEMO]").delete()

    Those are useful fallbacks during development, but the tracking model is safer.
    """
    if not scenario_key:
        return {
            "ok": False,
            "scenario_key": scenario_key,
            "deleted": [],
            "warnings": [
                {
                    "path": "scenario_key",
                    "message": "scenario_key is required.",
                }
            ],
        }

    deleted = delete_tracked_scenario_objects(scenario_key)

    return {
        "ok": True,
        "scenario_key": scenario_key,
        "deleted": deleted,
        "warnings": [],
    }


def summarize_scenario(data: dict) -> dict:
    """
    Return stable counts used by preview/import responses and tests.
    """
    if not isinstance(data, dict):
        return {
            "actors": 0,
            "categories": 0,
            "topics": 0,
            "stances": 0,
            "arguments": 0,
            "consultations": 0,
            "consultation_votes": 0,
            "impact_items": 0,
        }

    return summarize_scenario_payload(data)


def track_imported_object(
    *,
    scenario_key: str,
    object_type: str,
    obj,
    imported_by=None,
    object_label: str = "",
    source_key: str = "",
) -> None:
    """
    Track one imported object so reset can safely delete only this scenario's data.
    """
    if obj is None:
        return

    defaults = {
        "object_label": object_label or _object_label(obj),
        "imported_by": imported_by,
    }

    if _model_has_field(DemoScenarioImport, "source_key"):
        defaults["source_key"] = source_key or ""

    DemoScenarioImport.objects.update_or_create(
        scenario_key=scenario_key,
        object_type=object_type,
        object_id=obj.pk,
        defaults=defaults,
    )


def delete_tracked_scenario_objects(
    scenario_key: str,
) -> list[dict]:
    """
    Delete tracked objects in dependency-safe order.

    Safety rules:
    - Skip optional missing models when no records exist.
    - Delete stale tracking rows for missing optional models.
    - Never delete non-demo users.
    - Do not delete demo users still tracked by another scenario.
    - Do not delete any tracked object that is still tracked by another scenario.
    """
    deleted: list[dict] = []

    delete_order = [
        TRACK_OBJECT_TYPES.get("impact_item", "impact_item"),
        TRACK_OBJECT_TYPES.get("consultation_result", "consultation_result"),
        TRACK_OBJECT_TYPES.get("consultation_vote", "consultation_vote"),
        TRACK_OBJECT_TYPES.get("argument", "argument"),
        TRACK_OBJECT_TYPES.get("stance", "stance"),
        TRACK_OBJECT_TYPES.get("topic", "topic"),
        TRACK_OBJECT_TYPES.get("consultation", "consultation"),
        TRACK_OBJECT_TYPES.get("category", "category"),
        TRACK_OBJECT_TYPES.get("user", "user"),
    ]

    for object_type in delete_order:
        records = list(
            DemoScenarioImport.objects.filter(
                scenario_key=scenario_key,
                object_type=object_type,
            ).order_by("-id")
        )

        if not records:
            continue

        try:
            model = _model_for_object_type(object_type)
        except LookupError:
            for record in records:
                record.delete()
            continue

        for record in records:
            obj = model.objects.filter(pk=record.object_id).first()

            if obj is None:
                record.delete()
                continue

            if not _can_delete_tracked_object(
                scenario_key=scenario_key,
                object_type=object_type,
                obj=obj,
                record=record,
            ):
                record.delete()
                continue

            deleted.append(
                {
                    "object_type": record.object_type,
                    "object_id": record.object_id,
                    "object_label": record.object_label or _object_label(obj),
                }
            )

            obj.delete()
            record.delete()

    # Clean up any stale tracking rows for unknown object types.
    DemoScenarioImport.objects.filter(scenario_key=scenario_key).delete()

    return deleted


# ---------------------------------------------------------------------
# Import steps
# ---------------------------------------------------------------------


class _ImportContext:
    def __init__(
        self,
        *,
        scenario_key: str,
        imported_by,
        result: dict,
    ) -> None:
        self.scenario_key = scenario_key
        self.imported_by = imported_by
        self.result = result

    def record_created(self, object_type: str, obj, label: str = "") -> None:
        self.result["created"].append(
            {
                "object_type": object_type,
                "object_id": obj.pk,
                "object_label": label or _object_label(obj),
            }
        )

    def record_updated(self, object_type: str, obj, label: str = "") -> None:
        self.result["updated"].append(
            {
                "object_type": object_type,
                "object_id": obj.pk,
                "object_label": label or _object_label(obj),
            }
        )

    def warn(self, path: str, message: str) -> None:
        self.result["warnings"].append(
            {
                "path": path,
                "message": message,
            }
        )

    def track(
        self,
        object_type: str,
        obj,
        label: str = "",
        source_key: str = "",
    ) -> None:
        track_imported_object(
            scenario_key=self.scenario_key,
            object_type=object_type,
            obj=obj,
            imported_by=self.imported_by,
            object_label=label,
            source_key=source_key,
        )


def _import_actors(data: dict, context: _ImportContext) -> dict[str, Any]:
    actors: dict[str, Any] = {}

    for actor_data in data.get("actors", []):
        actor_key = actor_data["key"]
        username = actor_data["username"]

        defaults = {
            "email": actor_data.get("email") or f"{username}@{DEMO_EMAIL_DOMAIN}",
            "first_name": actor_data.get("display_name", username),
            "is_active": True,
            "is_ethikos_elite": actor_data.get("is_ethikos_elite", False),
        }

        defaults = _clean_model_defaults(User, defaults)

        user, created = User.objects.update_or_create(
            username=username,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["user"]
        label = username

        context.track(object_type, user, label, source_key=actor_key)

        if created:
            context.record_created(object_type, user, label)
        else:
            context.record_updated(object_type, user, label)

        actors[actor_key] = user

    return actors


def _import_categories(data: dict, context: _ImportContext) -> dict[str, Any]:
    EthikosCategory = _get_ethikos_model("EthikosCategory")
    categories: dict[str, Any] = {}

    for category_data in data.get("categories", []):
        category_key = category_data["key"]
        name = category_data["name"]

        defaults = _clean_model_defaults(
            EthikosCategory,
            {
                "description": category_data.get("description", ""),
            },
        )

        category, created = EthikosCategory.objects.update_or_create(
            name=name,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["category"]
        label = name

        context.track(object_type, category, label, source_key=category_key)

        if created:
            context.record_created(object_type, category, label)
        else:
            context.record_updated(object_type, category, label)

        categories[category_key] = category

    return categories


def _import_topics(
    data: dict,
    context: _ImportContext,
    categories: dict[str, Any],
    actors: dict[str, Any],
) -> dict[str, Any]:
    EthikosTopic = _get_ethikos_model("EthikosTopic")
    topics: dict[str, Any] = {}

    topic_owner = _get_demo_import_owner(
        imported_by=context.imported_by,
        actors=actors,
    )

    if _model_has_field(EthikosTopic, "created_by") and topic_owner is None:
        raise ValueError(
            "EthikosTopic requires created_by, but no importing user or demo actor was available."
        )

    for topic_data in data.get("topics", []):
        topic_key = topic_data["key"]
        title = topic_data["title"]

        if not title.startswith(DEMO_TOPIC_TITLE_PREFIX):
            context.warn(
                f"topics.{topic_key}.title",
                f'Demo topic title should usually start with "{DEMO_TOPIC_TITLE_PREFIX}".',
            )

        defaults = {
            "description": topic_data.get("description", ""),
            "status": topic_data.get("status", "open"),
            "category": categories.get(topic_data.get("category")),
            "start_date": _parse_date_value(topic_data.get("start_date")),
            "end_date": _parse_date_value(topic_data.get("end_date")),
            "created_by": topic_owner,
        }

        defaults = _clean_model_defaults(EthikosTopic, defaults)

        topic, created = EthikosTopic.objects.update_or_create(
            title=title,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["topic"]
        label = title

        context.track(object_type, topic, label, source_key=topic_key)

        if created:
            context.record_created(object_type, topic, label)
        else:
            context.record_updated(object_type, topic, label)

        topics[topic_key] = topic

    return topics


def _import_stances(
    data: dict,
    context: _ImportContext,
    actors: dict[str, Any],
    topics: dict[str, Any],
) -> None:
    EthikosStance = _get_ethikos_model("EthikosStance")

    for stance_data in data.get("stances", []):
        topic = topics[stance_data["topic"]]
        user = actors[stance_data["actor"]]

        defaults = _clean_model_defaults(
            EthikosStance,
            {
                "value": stance_data["value"],
            },
        )

        stance, created = EthikosStance.objects.update_or_create(
            topic=topic,
            user=user,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["stance"]
        label = f"{user.username} → {topic.title}: {stance_data['value']}"
        source_key = f"{stance_data['actor']}:{stance_data['topic']}"

        context.track(object_type, stance, label, source_key=source_key)

        if created:
            context.record_created(object_type, stance, label)
        else:
            context.record_updated(object_type, stance, label)


def _import_arguments(
    data: dict,
    context: _ImportContext,
    actors: dict[str, Any],
    topics: dict[str, Any],
) -> None:
    EthikosArgument = _get_ethikos_model("EthikosArgument")

    argument_refs: dict[str, Any] = {}
    user_field = _get_argument_user_field(EthikosArgument)

    for argument_data in data.get("arguments", []):
        argument_key = argument_data["key"]
        topic = topics[argument_data["topic"]]
        user = actors[argument_data["actor"]]

        parent = None
        parent_key = argument_data.get("parent")

        if parent_key:
            parent = argument_refs.get(parent_key)
            if parent is None:
                context.warn(
                    f"arguments.{argument_key}.parent",
                    f'Parent argument "{parent_key}" was not found. Importing as top-level argument.',
                )

        create_kwargs = {
            "topic": topic,
            "content": argument_data["content"],
            "parent": parent,
            "side": _normalize_argument_side(
                EthikosArgument,
                argument_data.get("side"),
            ),
            user_field: user,
        }

        create_kwargs = _clean_model_defaults(EthikosArgument, create_kwargs)

        argument = EthikosArgument.objects.create(**create_kwargs)

        object_type = TRACK_OBJECT_TYPES["argument"]
        label = f"{user.username}: {argument_data['content'][:80]}"

        context.track(object_type, argument, label, source_key=argument_key)
        context.record_created(object_type, argument, label)

        argument_refs[argument_key] = argument


def _import_consultations(
    data: dict,
    context: _ImportContext,
) -> dict[str, Any]:
    Consultation = _get_optional_ethikos_model("Consultation")
    consultations: dict[str, Any] = {}

    if Consultation is None:
        if data.get("consultations"):
            context.warn(
                "consultations",
                "Consultation model was not found. Skipping consultations.",
            )
        return consultations

    for consultation_data in data.get("consultations", []):
        consultation_key = consultation_data["key"]
        title = consultation_data["title"]

        defaults = {
            "status": consultation_data.get("status", "open"),
            "open_date": _parse_date_value(consultation_data.get("open_date")),
            "close_date": _parse_date_value(consultation_data.get("close_date")),
        }

        defaults = _clean_model_defaults(Consultation, defaults)

        consultation, created = Consultation.objects.update_or_create(
            title=title,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["consultation"]
        label = title

        context.track(object_type, consultation, label, source_key=consultation_key)

        if created:
            context.record_created(object_type, consultation, label)
        else:
            context.record_updated(object_type, consultation, label)

        consultations[consultation_key] = consultation

    return consultations


def _import_consultation_votes(
    data: dict,
    context: _ImportContext,
    actors: dict[str, Any],
    consultations: dict[str, Any],
) -> None:
    ConsultationVote = _get_optional_ethikos_model("ConsultationVote")

    if ConsultationVote is None:
        if data.get("consultation_votes"):
            context.warn(
                "consultation_votes",
                "ConsultationVote model was not found. Skipping consultation votes.",
            )
        return

    for vote_data in data.get("consultation_votes", []):
        consultation_key = vote_data["consultation"]

        if consultation_key not in consultations:
            context.warn(
                f"consultation_votes.{consultation_key}",
                "Consultation was not imported. Skipping vote.",
            )
            continue

        user = actors[vote_data["actor"]]
        consultation = consultations[consultation_key]

        defaults = {
            "raw_value": vote_data["raw_value"],
            "weighted_value": vote_data["weighted_value"],
            "option": vote_data.get("option"),
        }

        defaults = _clean_model_defaults(ConsultationVote, defaults)

        vote, created = ConsultationVote.objects.update_or_create(
            user=user,
            consultation=consultation,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["consultation_vote"]
        label = f"{user.username} → {consultation.title}"
        source_key = (
            f"{vote_data['actor']}:"
            f"{vote_data['consultation']}:"
            f"{vote_data.get('option', '')}"
        )

        context.track(object_type, vote, label, source_key=source_key)

        if created:
            context.record_created(object_type, vote, label)
        else:
            context.record_updated(object_type, vote, label)


def _import_consultation_results(
    data: dict,
    context: _ImportContext,
    consultations: dict[str, Any],
) -> None:
    ConsultationResult = _get_optional_ethikos_model("ConsultationResult")

    if ConsultationResult is None:
        if data.get("consultations"):
            context.warn(
                "consultation_results",
                "ConsultationResult model was not found. Skipping result snapshots.",
            )
        return

    votes_by_consultation = defaultdict(list)

    for vote_data in data.get("consultation_votes", []):
        votes_by_consultation[vote_data["consultation"]].append(vote_data)

    consultations_by_key = {
        consultation_data["key"]: consultation_data
        for consultation_data in data.get("consultations", [])
    }

    for consultation_key, consultation in consultations.items():
        consultation_data = consultations_by_key.get(consultation_key, {})
        result_data = _build_consultation_results_data(
            consultation_data=consultation_data,
            votes=votes_by_consultation.get(consultation_key, []),
        )

        defaults = _clean_model_defaults(
            ConsultationResult,
            {
                "results_data": result_data,
            },
        )

        consultation_result, created = ConsultationResult.objects.update_or_create(
            consultation=consultation,
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["consultation_result"]
        label = f"Results: {consultation.title}"

        context.track(
            object_type,
            consultation_result,
            label,
            source_key=consultation_key,
        )

        if created:
            context.record_created(object_type, consultation_result, label)
        else:
            context.record_updated(object_type, consultation_result, label)


def _import_impact_items(
    data: dict,
    context: _ImportContext,
    consultations: dict[str, Any],
) -> None:
    ImpactTrack = _get_optional_ethikos_model("ImpactTrack")

    if ImpactTrack is None:
        if data.get("impact_items"):
            context.warn(
                "impact_items",
                "ImpactTrack model was not found. Skipping impact items.",
            )
        return

    for index, impact_data in enumerate(data.get("impact_items", [])):
        consultation_key = impact_data["consultation"]

        if consultation_key not in consultations:
            context.warn(
                f"impact_items[{index}].consultation",
                "Consultation was not imported. Skipping impact item.",
            )
            continue

        consultation = consultations[consultation_key]

        defaults = {
            "status": impact_data["status"],
            "date": _parse_date_value(impact_data.get("date")),
        }

        defaults = _clean_model_defaults(ImpactTrack, defaults)

        impact_item, created = ImpactTrack.objects.update_or_create(
            consultation=consultation,
            action=impact_data["action"],
            defaults=defaults,
        )

        object_type = TRACK_OBJECT_TYPES["impact_item"]
        label = impact_data["action"]
        source_key = f"{consultation_key}:{impact_data['action'][:80]}"

        context.track(object_type, impact_item, label, source_key=source_key)

        if created:
            context.record_created(object_type, impact_item, label)
        else:
            context.record_updated(object_type, impact_item, label)


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------


def _get_ethikos_model(model_name: str):
    return apps.get_model(ETHIKOS_APP_LABEL, model_name)


def _get_optional_ethikos_model(model_name: str):
    try:
        return _get_ethikos_model(model_name)
    except LookupError:
        return None


def _model_for_object_type(object_type: str):
    if object_type == TRACK_OBJECT_TYPES["user"]:
        return User

    model_map = {
        TRACK_OBJECT_TYPES["category"]: "EthikosCategory",
        TRACK_OBJECT_TYPES["topic"]: "EthikosTopic",
        TRACK_OBJECT_TYPES["stance"]: "EthikosStance",
        TRACK_OBJECT_TYPES["argument"]: "EthikosArgument",
        TRACK_OBJECT_TYPES["consultation"]: "Consultation",
        TRACK_OBJECT_TYPES["consultation_vote"]: "ConsultationVote",
        TRACK_OBJECT_TYPES["consultation_result"]: "ConsultationResult",
        TRACK_OBJECT_TYPES["impact_item"]: "ImpactTrack",
    }

    model_name = model_map.get(object_type)

    if not model_name:
        raise LookupError(f"Unknown demo import object_type: {object_type}")

    model = _get_optional_ethikos_model(model_name)

    if model is None:
        raise LookupError(f"Model not found for demo import object_type: {object_type}")

    return model


def _model_has_field(model, field_name: str) -> bool:
    try:
        model._meta.get_field(field_name)
        return True
    except FieldDoesNotExist:
        return False


def _clean_model_defaults(model, values: dict[str, Any]) -> dict[str, Any]:
    """
    Drop fields that do not exist on the installed model.

    This makes the importer tolerant of small schema differences, for example:
    - EthikosTopic may or may not have description/category.
    - ConsultationVote may or may not have option.
    - User may or may not have is_ethikos_elite.
    """
    cleaned: dict[str, Any] = {}

    for key, value in values.items():
        if _model_has_field(model, key):
            cleaned[key] = value

    return cleaned


def _get_demo_import_owner(
    *,
    imported_by=None,
    actors: dict[str, Any] | None = None,
):
    """
    Pick the owner for imported objects that require a non-null user.

    Priority:
    1. Authenticated importing admin.
    2. First imported demo actor.
    3. None.
    """
    if imported_by is not None and getattr(imported_by, "is_authenticated", False):
        return imported_by

    if actors:
        return next(iter(actors.values()), None)

    return None


def _get_argument_user_field(EthikosArgument) -> str:
    """
    Return the installed EthikosArgument user relation field.

    Some drafts used "author"; the current database constraint shows the model
    requires "user".
    """
    if _model_has_field(EthikosArgument, "user"):
        return "user"

    if _model_has_field(EthikosArgument, "author"):
        return "author"

    raise ValueError("EthikosArgument requires either a user or author field.")


def _normalize_argument_side(EthikosArgument, side):
    """
    Normalize demo JSON argument side values to the installed model.

    Current EthikosArgument.side is varchar(3), so values like "neutral"
    cannot be stored directly. Neutral/no-side arguments are stored as None
    unless the installed model explicitly supports them.
    """
    if not _model_has_field(EthikosArgument, "side"):
        return None

    if side in ("", None):
        return None

    normalized = str(side).strip().lower()

    if normalized in {"pro", "con"}:
        return normalized

    if normalized in {"neutral", "neu", "none", "null"}:
        return None

    side_field = EthikosArgument._meta.get_field("side")
    max_length = getattr(side_field, "max_length", None)

    if max_length and len(normalized) > max_length:
        return None

    return normalized


def _parse_date_value(value):
    if not value:
        return None

    if hasattr(value, "year") and hasattr(value, "month") and hasattr(value, "day"):
        return value

    parsed = parse_date(str(value))

    if parsed is None:
        raise ValueError(f"Invalid date value: {value}")

    return parsed


def _object_label(obj) -> str:
    for attr in ("title", "name", "username", "action", "content"):
        value = getattr(obj, attr, None)
        if value:
            return str(value)[:255]

    return str(obj)[:255]


def _can_delete_tracked_object(
    *,
    scenario_key: str,
    object_type: str,
    obj,
    record: DemoScenarioImport,
) -> bool:
    """
    Return whether reset is allowed to delete this tracked object.
    """
    if object_type == TRACK_OBJECT_TYPES["user"]:
        # Do not delete demo users during reset.
        # User deletion can cascade into unrelated app tables, including legacy
        # or optional vote tables that may not exist in the current local DB.
        # The reset loop will still delete the DemoScenarioImport tracking row.
        return False

    if _is_tracked_by_other_scenario(
        scenario_key=scenario_key,
        object_type=object_type,
        object_id=record.object_id,
    ):
        return False

    return True


def _is_tracked_by_other_scenario(
    *,
    scenario_key: str,
    object_type: str,
    object_id: int,
) -> bool:
    return (
        DemoScenarioImport.objects.filter(
            object_type=object_type,
            object_id=object_id,
        )
        .exclude(scenario_key=scenario_key)
        .exists()
    )


def _collect_non_blocking_warnings(data: dict) -> list[dict]:
    warnings: list[dict] = []

    for actor in data.get("actors", []):
        username = actor.get("username", "")

        if username and not username.startswith(DEMO_USERNAME_PREFIX):
            warnings.append(
                {
                    "path": f"actors.{actor.get('key')}.username",
                    "message": f'Demo usernames should usually start with "{DEMO_USERNAME_PREFIX}".',
                }
            )

    for topic in data.get("topics", []):
        title = topic.get("title", "")

        if title and not title.startswith(DEMO_TOPIC_TITLE_PREFIX):
            warnings.append(
                {
                    "path": f"topics.{topic.get('key')}.title",
                    "message": f'Demo topic titles should usually start with "{DEMO_TOPIC_TITLE_PREFIX}".',
                }
            )

    return warnings


def _build_consultation_results_data(
    *,
    consultation_data: dict,
    votes: list[dict],
) -> dict:
    """
    Build a simple deterministic result snapshot.

    This is not a Smart Vote reading. It is a demo snapshot over source vote facts.
    """
    option_totals: dict[str, dict[str, Any]] = {}

    for option in consultation_data.get("options", []):
        option_key = option["key"]
        option_totals[option_key] = {
            "key": option_key,
            "label": option.get("label", option_key),
            "raw_total": 0,
            "weighted_total": 0.0,
            "vote_count": 0,
        }

    unassigned_key = "__unassigned__"

    for vote in votes:
        option_key = vote.get("option") or unassigned_key

        if option_key not in option_totals:
            option_totals[option_key] = {
                "key": option_key,
                "label": option_key,
                "raw_total": 0,
                "weighted_total": 0.0,
                "vote_count": 0,
            }

        option_totals[option_key]["raw_total"] += vote.get("raw_value", 0)
        option_totals[option_key]["weighted_total"] += float(
            vote.get("weighted_value", 0)
        )
        option_totals[option_key]["vote_count"] += 1

    total_votes = len(votes)
    total_raw = sum(vote.get("raw_value", 0) for vote in votes)
    total_weighted = sum(float(vote.get("weighted_value", 0)) for vote in votes)

    return {
        "kind": "demo_consultation_result_snapshot",
        "consultation_key": consultation_data.get("key"),
        "total_votes": total_votes,
        "total_raw": total_raw,
        "total_weighted": total_weighted,
        "options": list(option_totals.values()),
    }