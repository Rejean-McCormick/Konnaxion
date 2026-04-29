"""
Schema contract and validation for ethiKos demo scenario imports.

This file is intentionally Django-free.
It defines the JSON contract shared by:

- backend/konnaxion/ethikos/demo_import/importer.py
- backend/konnaxion/ethikos/demo_import/serializers.py
- backend/konnaxion/ethikos/demo_import/views.py
- frontend/features/ethikos/demo-importer/types.ts
- docs/demo-scenarios/ethikos/*.json
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------
# Shared constants
# ---------------------------------------------------------------------

SCHEMA_VERSION = "ethikos-demo-scenario/v1"

DEFAULT_IMPORT_MODE = "replace_scenario"

ALLOWED_IMPORT_MODES = {
    "replace_scenario",
    "append_scenario",
}

FEATURE_FLAG_NAME = "ETHIKOS_DEMO_IMPORTER_ENABLED"

API_NAMESPACE = "ethikos-demo-scenarios"

API_PREVIEW_PATH = "demo-scenarios/preview/"
API_IMPORT_PATH = "demo-scenarios/import/"
API_RESET_PATH = "demo-scenarios/reset/"

DEMO_USERNAME_PREFIX = "demo_"
DEMO_TOPIC_TITLE_PREFIX = "[DEMO]"
DEMO_EMAIL_DOMAIN = "example.test"

TRACK_OBJECT_TYPES = {
    "user": "user",
    "category": "category",
    "topic": "topic",
    "stance": "stance",
    "argument": "argument",
    "consultation": "consultation",
    "consultation_vote": "consultation_vote",
    "consultation_result": "consultation_result",
    "impact_item": "impact_item",
}

ALLOWED_TOPIC_STATUSES = {
    "open",
    "closed",
    "archived",
}

ALLOWED_CONSULTATION_STATUSES = {
    "open",
    "closed",
    "archived",
}

ALLOWED_ARGUMENT_SIDES = {
    "pro",
    "con",
    "neutral",
    None,
}

STANCE_MIN = -3
STANCE_MAX = 3

JSON_ROOT_KEYS = {
    "schema_version",
    "scenario_key",
    "scenario_title",
    "mode",
    "metadata",
    "actors",
    "categories",
    "topics",
    "stances",
    "arguments",
    "consultations",
    "consultation_votes",
    "impact_items",
}

LIST_ROOT_KEYS = {
    "actors",
    "categories",
    "topics",
    "stances",
    "arguments",
    "consultations",
    "consultation_votes",
    "impact_items",
}

# NOTE:
# "mode" is intentionally optional.
# If omitted, normalize_demo_scenario() defaults it to DEFAULT_IMPORT_MODE.
REQUIRED_ROOT_FIELDS = {
    "schema_version",
    "scenario_key",
    "scenario_title",
}

REQUIRED_ACTOR_FIELDS = {
    "key",
    "username",
    "display_name",
}

REQUIRED_CATEGORY_FIELDS = {
    "key",
    "name",
}

REQUIRED_TOPIC_FIELDS = {
    "key",
    "title",
    "status",
    "category",
}

REQUIRED_STANCE_FIELDS = {
    "topic",
    "actor",
    "value",
}

REQUIRED_ARGUMENT_FIELDS = {
    "key",
    "topic",
    "actor",
    "content",
}

REQUIRED_CONSULTATION_FIELDS = {
    "key",
    "title",
    "status",
    "open_date",
    "close_date",
}

REQUIRED_CONSULTATION_OPTION_FIELDS = {
    "key",
    "label",
}

REQUIRED_CONSULTATION_VOTE_FIELDS = {
    "consultation",
    "actor",
    "raw_value",
    "weighted_value",
}

REQUIRED_IMPACT_ITEM_FIELDS = {
    "consultation",
    "action",
    "status",
    "date",
}


# ---------------------------------------------------------------------
# Public validation API
# ---------------------------------------------------------------------

def validate_demo_scenario(data: dict[str, Any]) -> list[dict[str, str]]:
    """
    Validate an ethiKos demo scenario payload.

    Returns:
        A list of errors. Empty list means the payload is valid enough
        for importer.py to process.
    """
    errors: list[dict[str, str]] = []

    if not isinstance(data, dict):
        return [
            {
                "path": "$",
                "message": "Scenario payload must be a JSON object.",
            }
        ]

    _validate_root(data, errors)

    if errors:
        return errors

    normalized = normalize_demo_scenario(data)

    actors = normalized["actors"]
    categories = normalized["categories"]
    topics = normalized["topics"]
    stances = normalized["stances"]
    arguments = normalized["arguments"]
    consultations = normalized["consultations"]
    consultation_votes = normalized["consultation_votes"]
    impact_items = normalized["impact_items"]

    actor_keys = _collect_unique_keys(actors, "actors", errors)
    category_keys = _collect_unique_keys(categories, "categories", errors)
    topic_keys = _collect_unique_keys(topics, "topics", errors)
    argument_keys = _collect_unique_keys(arguments, "arguments", errors)
    consultation_keys = _collect_unique_keys(
        consultations,
        "consultations",
        errors,
    )

    consultation_option_keys = _collect_consultation_option_keys(
        consultations,
        errors,
    )

    _validate_actors(actors, errors)
    _validate_categories(categories, errors)
    _validate_topics(topics, category_keys, errors)
    _validate_stances(stances, actor_keys, topic_keys, errors)
    _validate_arguments(arguments, actor_keys, topic_keys, argument_keys, errors)
    _validate_consultations(consultations, errors)
    _validate_consultation_votes(
        consultation_votes,
        actor_keys,
        consultation_keys,
        consultation_option_keys,
        errors,
    )
    _validate_impact_items(impact_items, consultation_keys, errors)

    return errors


def normalize_demo_scenario(data: dict[str, Any]) -> dict[str, Any]:
    """
    Normalize optional root fields before import.

    This does not validate deeply. Call validate_demo_scenario first.
    """
    normalized = dict(data)

    normalized.setdefault("mode", DEFAULT_IMPORT_MODE)
    normalized.setdefault("metadata", {})

    for key in LIST_ROOT_KEYS:
        normalized.setdefault(key, [])

    return normalized


def summarize_scenario_payload(data: dict[str, Any]) -> dict[str, int]:
    """
    Return the summary shape expected by preview/import responses.
    """
    normalized = normalize_demo_scenario(data)

    return {
        "actors": len(normalized.get("actors", [])),
        "categories": len(normalized.get("categories", [])),
        "topics": len(normalized.get("topics", [])),
        "stances": len(normalized.get("stances", [])),
        "arguments": len(normalized.get("arguments", [])),
        "consultations": len(normalized.get("consultations", [])),
        "consultation_votes": len(normalized.get("consultation_votes", [])),
        "impact_items": len(normalized.get("impact_items", [])),
    }


# ---------------------------------------------------------------------
# Root validation
# ---------------------------------------------------------------------

def _validate_root(data: dict[str, Any], errors: list[dict[str, str]]) -> None:
    _require_fields("$", data, REQUIRED_ROOT_FIELDS, errors)

    schema_version = data.get("schema_version")
    if schema_version != SCHEMA_VERSION:
        _add_error(
            errors,
            "schema_version",
            f"Expected schema_version to be {SCHEMA_VERSION}.",
        )

    mode = data.get("mode", DEFAULT_IMPORT_MODE)
    if mode not in ALLOWED_IMPORT_MODES:
        _add_error(
            errors,
            "mode",
            f"Import mode must be one of: {sorted(ALLOWED_IMPORT_MODES)}.",
        )

    scenario_key = data.get("scenario_key")
    if scenario_key is not None and not _is_non_empty_string(scenario_key):
        _add_error(
            errors,
            "scenario_key",
            "scenario_key must be a non-empty string.",
        )

    scenario_title = data.get("scenario_title")
    if scenario_title is not None and not _is_non_empty_string(scenario_title):
        _add_error(
            errors,
            "scenario_title",
            "scenario_title must be a non-empty string.",
        )

    metadata = data.get("metadata", {})
    if metadata is not None and not isinstance(metadata, dict):
        _add_error(
            errors,
            "metadata",
            "metadata must be an object.",
        )

    for key in LIST_ROOT_KEYS:
        value = data.get(key, [])
        if not isinstance(value, list):
            _add_error(
                errors,
                key,
                f"{key} must be a list.",
            )


# ---------------------------------------------------------------------
# Object validation
# ---------------------------------------------------------------------

def _validate_actors(
    actors: list[dict[str, Any]],
    errors: list[dict[str, str]],
) -> None:
    for index, actor in enumerate(actors):
        path = f"actors[{index}]"

        if not _is_object(path, actor, errors):
            continue

        _require_fields(path, actor, REQUIRED_ACTOR_FIELDS, errors)

        key = actor.get("key")
        if key is not None and not _is_non_empty_string(key):
            _add_error(errors, f"{path}.key", "key must be a non-empty string.")

        username = actor.get("username")
        if username is not None and not _is_non_empty_string(username):
            _add_error(
                errors,
                f"{path}.username",
                "username must be a non-empty string.",
            )

        if username and not str(username).startswith(DEMO_USERNAME_PREFIX):
            _add_error(
                errors,
                f"{path}.username",
                f"Demo actor username must start with {DEMO_USERNAME_PREFIX}.",
            )

        display_name = actor.get("display_name")
        if display_name is not None and not _is_non_empty_string(display_name):
            _add_error(
                errors,
                f"{path}.display_name",
                "display_name must be a non-empty string.",
            )

        email = actor.get("email")
        if email is not None and not _is_non_empty_string(email):
            _add_error(
                errors,
                f"{path}.email",
                "email must be a non-empty string when provided.",
            )

        role = actor.get("role")
        if role is not None and not _is_non_empty_string(role):
            _add_error(
                errors,
                f"{path}.role",
                "role must be a non-empty string when provided.",
            )

        is_ethikos_elite = actor.get("is_ethikos_elite")
        if is_ethikos_elite is not None and not isinstance(is_ethikos_elite, bool):
            _add_error(
                errors,
                f"{path}.is_ethikos_elite",
                "is_ethikos_elite must be a boolean when provided.",
            )


def _validate_categories(
    categories: list[dict[str, Any]],
    errors: list[dict[str, str]],
) -> None:
    for index, category in enumerate(categories):
        path = f"categories[{index}]"

        if not _is_object(path, category, errors):
            continue

        _require_fields(path, category, REQUIRED_CATEGORY_FIELDS, errors)

        key = category.get("key")
        if key is not None and not _is_non_empty_string(key):
            _add_error(errors, f"{path}.key", "key must be a non-empty string.")

        name = category.get("name")
        if name is not None and not _is_non_empty_string(name):
            _add_error(errors, f"{path}.name", "name must be a non-empty string.")

        description = category.get("description")
        if description is not None and not isinstance(description, str):
            _add_error(
                errors,
                f"{path}.description",
                "description must be a string when provided.",
            )


def _validate_topics(
    topics: list[dict[str, Any]],
    category_keys: set[str],
    errors: list[dict[str, str]],
) -> None:
    for index, topic in enumerate(topics):
        path = f"topics[{index}]"

        if not _is_object(path, topic, errors):
            continue

        _require_fields(path, topic, REQUIRED_TOPIC_FIELDS, errors)

        key = topic.get("key")
        if key is not None and not _is_non_empty_string(key):
            _add_error(errors, f"{path}.key", "key must be a non-empty string.")

        title = topic.get("title")
        if title is not None and not _is_non_empty_string(title):
            _add_error(errors, f"{path}.title", "title must be a non-empty string.")

        if title and not str(title).startswith(DEMO_TOPIC_TITLE_PREFIX):
            _add_error(
                errors,
                f"{path}.title",
                f"Demo topic title must start with {DEMO_TOPIC_TITLE_PREFIX}.",
            )

        description = topic.get("description")
        if description is not None and not isinstance(description, str):
            _add_error(
                errors,
                f"{path}.description",
                "description must be a string when provided.",
            )

        status = topic.get("status")
        if status is not None and status not in ALLOWED_TOPIC_STATUSES:
            _add_error(
                errors,
                f"{path}.status",
                f"Topic status must be one of: {sorted(ALLOWED_TOPIC_STATUSES)}.",
            )

        category = topic.get("category")
        if category is not None:
            if not _is_non_empty_string(category):
                _add_error(
                    errors,
                    f"{path}.category",
                    "category must be a non-empty string.",
                )
            elif category not in category_keys:
                _add_error(
                    errors,
                    f"{path}.category",
                    f"Unknown category reference: {category}.",
                )

        _validate_optional_date_string(topic, "start_date", path, errors)
        _validate_optional_date_string(topic, "end_date", path, errors)


def _validate_stances(
    stances: list[dict[str, Any]],
    actor_keys: set[str],
    topic_keys: set[str],
    errors: list[dict[str, str]],
) -> None:
    for index, stance in enumerate(stances):
        path = f"stances[{index}]"

        if not _is_object(path, stance, errors):
            continue

        _require_fields(path, stance, REQUIRED_STANCE_FIELDS, errors)

        actor = stance.get("actor")
        if actor is not None:
            if not _is_non_empty_string(actor):
                _add_error(errors, f"{path}.actor", "actor must be a non-empty string.")
            elif actor not in actor_keys:
                _add_error(
                    errors,
                    f"{path}.actor",
                    f"Unknown actor reference: {actor}.",
                )

        topic = stance.get("topic")
        if topic is not None:
            if not _is_non_empty_string(topic):
                _add_error(errors, f"{path}.topic", "topic must be a non-empty string.")
            elif topic not in topic_keys:
                _add_error(
                    errors,
                    f"{path}.topic",
                    f"Unknown topic reference: {topic}.",
                )

        value = stance.get("value")
        if not isinstance(value, int) or isinstance(value, bool):
            _add_error(
                errors,
                f"{path}.value",
                f"Stance value must be an integer from {STANCE_MIN} to {STANCE_MAX}.",
            )
        elif value < STANCE_MIN or value > STANCE_MAX:
            _add_error(
                errors,
                f"{path}.value",
                f"Stance value must be an integer from {STANCE_MIN} to {STANCE_MAX}.",
            )


def _validate_arguments(
    arguments: list[dict[str, Any]],
    actor_keys: set[str],
    topic_keys: set[str],
    argument_keys: set[str],
    errors: list[dict[str, str]],
) -> None:
    for index, argument in enumerate(arguments):
        path = f"arguments[{index}]"

        if not _is_object(path, argument, errors):
            continue

        _require_fields(path, argument, REQUIRED_ARGUMENT_FIELDS, errors)

        key = argument.get("key")
        if key is not None and not _is_non_empty_string(key):
            _add_error(errors, f"{path}.key", "key must be a non-empty string.")

        actor = argument.get("actor")
        if actor is not None:
            if not _is_non_empty_string(actor):
                _add_error(errors, f"{path}.actor", "actor must be a non-empty string.")
            elif actor not in actor_keys:
                _add_error(
                    errors,
                    f"{path}.actor",
                    f"Unknown actor reference: {actor}.",
                )

        topic = argument.get("topic")
        if topic is not None:
            if not _is_non_empty_string(topic):
                _add_error(errors, f"{path}.topic", "topic must be a non-empty string.")
            elif topic not in topic_keys:
                _add_error(
                    errors,
                    f"{path}.topic",
                    f"Unknown topic reference: {topic}.",
                )

        content = argument.get("content")
        if content is not None and not _is_non_empty_string(content):
            _add_error(
                errors,
                f"{path}.content",
                "content must be a non-empty string.",
            )

        side = argument.get("side")
        if side not in ALLOWED_ARGUMENT_SIDES:
            _add_error(
                errors,
                f"{path}.side",
                "side must be one of: pro, con, neutral, or null.",
            )

        parent = argument.get("parent")
        if parent is not None:
            if not _is_non_empty_string(parent):
                _add_error(
                    errors,
                    f"{path}.parent",
                    "parent must be a non-empty string when provided.",
                )
            elif parent not in argument_keys:
                _add_error(
                    errors,
                    f"{path}.parent",
                    f"Unknown parent argument reference: {parent}.",
                )


def _validate_consultations(
    consultations: list[dict[str, Any]],
    errors: list[dict[str, str]],
) -> None:
    for index, consultation in enumerate(consultations):
        path = f"consultations[{index}]"

        if not _is_object(path, consultation, errors):
            continue

        _require_fields(path, consultation, REQUIRED_CONSULTATION_FIELDS, errors)

        key = consultation.get("key")
        if key is not None and not _is_non_empty_string(key):
            _add_error(errors, f"{path}.key", "key must be a non-empty string.")

        title = consultation.get("title")
        if title is not None and not _is_non_empty_string(title):
            _add_error(errors, f"{path}.title", "title must be a non-empty string.")

        if title and not str(title).startswith(DEMO_TOPIC_TITLE_PREFIX):
            _add_error(
                errors,
                f"{path}.title",
                f"Demo consultation title must start with {DEMO_TOPIC_TITLE_PREFIX}.",
            )

        status = consultation.get("status")
        if status is not None and status not in ALLOWED_CONSULTATION_STATUSES:
            _add_error(
                errors,
                f"{path}.status",
                "Consultation status must be one of: "
                f"{sorted(ALLOWED_CONSULTATION_STATUSES)}.",
            )

        _validate_optional_date_string(consultation, "open_date", path, errors)
        _validate_optional_date_string(consultation, "close_date", path, errors)

        options = consultation.get("options", [])
        if options is not None and not isinstance(options, list):
            _add_error(
                errors,
                f"{path}.options",
                "options must be a list when provided.",
            )
            continue

        for option_index, option in enumerate(options or []):
            option_path = f"{path}.options[{option_index}]"

            if not _is_object(option_path, option, errors):
                continue

            _require_fields(
                option_path,
                option,
                REQUIRED_CONSULTATION_OPTION_FIELDS,
                errors,
            )

            option_key = option.get("key")
            if option_key is not None and not _is_non_empty_string(option_key):
                _add_error(
                    errors,
                    f"{option_path}.key",
                    "key must be a non-empty string.",
                )

            label = option.get("label")
            if label is not None and not _is_non_empty_string(label):
                _add_error(
                    errors,
                    f"{option_path}.label",
                    "label must be a non-empty string.",
                )


def _validate_consultation_votes(
    consultation_votes: list[dict[str, Any]],
    actor_keys: set[str],
    consultation_keys: set[str],
    consultation_option_keys: dict[str, set[str]],
    errors: list[dict[str, str]],
) -> None:
    for index, vote in enumerate(consultation_votes):
        path = f"consultation_votes[{index}]"

        if not _is_object(path, vote, errors):
            continue

        _require_fields(path, vote, REQUIRED_CONSULTATION_VOTE_FIELDS, errors)

        actor = vote.get("actor")
        if actor is not None:
            if not _is_non_empty_string(actor):
                _add_error(errors, f"{path}.actor", "actor must be a non-empty string.")
            elif actor not in actor_keys:
                _add_error(
                    errors,
                    f"{path}.actor",
                    f"Unknown actor reference: {actor}.",
                )

        consultation = vote.get("consultation")
        if consultation is not None:
            if not _is_non_empty_string(consultation):
                _add_error(
                    errors,
                    f"{path}.consultation",
                    "consultation must be a non-empty string.",
                )
            elif consultation not in consultation_keys:
                _add_error(
                    errors,
                    f"{path}.consultation",
                    f"Unknown consultation reference: {consultation}.",
                )

        option = vote.get("option")
        if option is not None:
            if not _is_non_empty_string(option):
                _add_error(
                    errors,
                    f"{path}.option",
                    "option must be a non-empty string when provided.",
                )
            elif consultation in consultation_option_keys:
                known_options = consultation_option_keys.get(str(consultation), set())
                if known_options and option not in known_options:
                    _add_error(
                        errors,
                        f"{path}.option",
                        f"Unknown option reference for consultation {consultation}: {option}.",
                    )

        _validate_number(vote, "raw_value", path, errors)
        _validate_number(vote, "weighted_value", path, errors)


def _validate_impact_items(
    impact_items: list[dict[str, Any]],
    consultation_keys: set[str],
    errors: list[dict[str, str]],
) -> None:
    for index, item in enumerate(impact_items):
        path = f"impact_items[{index}]"

        if not _is_object(path, item, errors):
            continue

        _require_fields(path, item, REQUIRED_IMPACT_ITEM_FIELDS, errors)

        consultation = item.get("consultation")
        if consultation is not None:
            if not _is_non_empty_string(consultation):
                _add_error(
                    errors,
                    f"{path}.consultation",
                    "consultation must be a non-empty string.",
                )
            elif consultation not in consultation_keys:
                _add_error(
                    errors,
                    f"{path}.consultation",
                    f"Unknown consultation reference: {consultation}.",
                )

        action = item.get("action")
        if action is not None and not _is_non_empty_string(action):
            _add_error(
                errors,
                f"{path}.action",
                "action must be a non-empty string.",
            )

        status = item.get("status")
        if status is not None and not _is_non_empty_string(status):
            _add_error(
                errors,
                f"{path}.status",
                "status must be a non-empty string.",
            )

        _validate_optional_date_string(item, "date", path, errors)


# ---------------------------------------------------------------------
# Collection helpers
# ---------------------------------------------------------------------

def _collect_unique_keys(
    items: list[Any],
    collection_path: str,
    errors: list[dict[str, str]],
) -> set[str]:
    keys: set[str] = set()
    seen: set[str] = set()

    for index, item in enumerate(items):
        path = f"{collection_path}[{index}]"

        if not isinstance(item, dict):
            continue

        key = item.get("key")

        if key is None:
            continue

        if not _is_non_empty_string(key):
            _add_error(
                errors,
                f"{path}.key",
                "key must be a non-empty string.",
            )
            continue

        key_string = str(key)

        if key_string in seen:
            _add_error(
                errors,
                f"{path}.key",
                f"Duplicate key: {key_string}.",
            )
            continue

        seen.add(key_string)
        keys.add(key_string)

    return keys


def _collect_consultation_option_keys(
    consultations: list[Any],
    errors: list[dict[str, str]],
) -> dict[str, set[str]]:
    option_keys_by_consultation: dict[str, set[str]] = {}

    for consultation_index, consultation in enumerate(consultations):
        consultation_path = f"consultations[{consultation_index}]"

        if not isinstance(consultation, dict):
            continue

        consultation_key = consultation.get("key")
        if not _is_non_empty_string(consultation_key):
            continue

        options = consultation.get("options", [])
        if options is None:
            continue

        if not isinstance(options, list):
            continue

        seen_options: set[str] = set()
        consultation_options: set[str] = set()

        for option_index, option in enumerate(options):
            option_path = f"{consultation_path}.options[{option_index}]"

            if not isinstance(option, dict):
                continue

            option_key = option.get("key")

            if option_key is None:
                continue

            if not _is_non_empty_string(option_key):
                _add_error(
                    errors,
                    f"{option_path}.key",
                    "key must be a non-empty string.",
                )
                continue

            option_key_string = str(option_key)

            if option_key_string in seen_options:
                _add_error(
                    errors,
                    f"{option_path}.key",
                    f"Duplicate option key: {option_key_string}.",
                )
                continue

            seen_options.add(option_key_string)
            consultation_options.add(option_key_string)

        option_keys_by_consultation[str(consultation_key)] = consultation_options

    return option_keys_by_consultation


# ---------------------------------------------------------------------
# Generic validation helpers
# ---------------------------------------------------------------------

def _require_fields(
    path: str,
    obj: dict[str, Any],
    required_fields: set[str],
    errors: list[dict[str, str]],
) -> None:
    for field in sorted(required_fields):
        if field not in obj:
            _add_error(
                errors,
                f"{path}.{field}" if path != "$" else field,
                f"{field} is required.",
            )
            continue

        value = obj.get(field)
        if value is None:
            _add_error(
                errors,
                f"{path}.{field}" if path != "$" else field,
                f"{field} is required.",
            )


def _is_object(
    path: str,
    value: Any,
    errors: list[dict[str, str]],
) -> bool:
    if isinstance(value, dict):
        return True

    _add_error(
        errors,
        path,
        "Item must be an object.",
    )
    return False


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _validate_optional_date_string(
    obj: dict[str, Any],
    field: str,
    path: str,
    errors: list[dict[str, str]],
) -> None:
    value = obj.get(field)

    if value is None:
        return

    if not _is_non_empty_string(value):
        _add_error(
            errors,
            f"{path}.{field}",
            f"{field} must be a non-empty ISO date string when provided.",
        )


def _validate_number(
    obj: dict[str, Any],
    field: str,
    path: str,
    errors: list[dict[str, str]],
) -> None:
    value = obj.get(field)

    if not isinstance(value, (int, float)) or isinstance(value, bool):
        _add_error(
            errors,
            f"{path}.{field}",
            f"{field} must be a number.",
        )


def _add_error(
    errors: list[dict[str, str]],
    path: str,
    message: str,
) -> None:
    errors.append(
        {
            "path": path,
            "message": message,
        }
    )