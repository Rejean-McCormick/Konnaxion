import pytest
from django.contrib.auth import get_user_model

from konnaxion.ethikos.demo_import.importer import (
    import_ethikos_demo_scenario,
    reset_ethikos_demo_scenario,
)
from konnaxion.ethikos.demo_import.schema import (
    DEMO_TOPIC_TITLE_PREFIX,
    TRACK_OBJECT_TYPES,
)
from konnaxion.ethikos.models import (
    EthikosArgument,
    EthikosCategory,
    EthikosStance,
    EthikosTopic,
)
from konnaxion.ethikos.models_demo import DemoScenarioImport


pytestmark = pytest.mark.django_db

User = get_user_model()


def build_demo_payload(
    *,
    scenario_key: str = "public_square_demo",
    actor_username: str = "demo_maya",
    topic_key: str = "public_square",
    topic_title: str | None = None,
) -> dict:
    title = topic_title or f"{DEMO_TOPIC_TITLE_PREFIX} Public Square Redevelopment"

    return {
        "schema_version": "ethikos-demo-scenario/v1",
        "scenario_key": scenario_key,
        "scenario_title": "Public Square Redevelopment Demo",
        "mode": "replace_scenario",
        "metadata": {
            "description": "Demo data for ethiKos importer tests.",
            "language": "en",
        },
        "actors": [
            {
                "key": "maya",
                "username": actor_username,
                "display_name": "Maya",
                "email": f"{actor_username}@example.test",
                "role": "citizen",
                "is_ethikos_elite": False,
            }
        ],
        "categories": [
            {
                "key": "urbanism",
                "name": "Urbanism",
                "description": "Urban planning and public-space issues.",
            }
        ],
        "topics": [
            {
                "key": topic_key,
                "title": title,
                "description": "A public debate about greening, mobility, parking, and accessibility.",
                "status": "open",
                "category": "urbanism",
                "start_date": "2026-05-01",
                "end_date": "2026-05-30",
            }
        ],
        "stances": [
            {
                "topic": topic_key,
                "actor": "maya",
                "value": 2,
            }
        ],
        "arguments": [
            {
                "key": "maya_argument_1",
                "topic": topic_key,
                "actor": "maya",
                "side": "pro",
                "content": "The square should become greener while preserving accessibility.",
            }
        ],
        "consultations": [],
        "consultation_votes": [],
        "impact_items": [],
    }


def create_importing_user(username: str = "import_admin"):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.test",
        password="test-password",
    )


def test_import_creates_demo_actors_categories_topics_stances_and_arguments():
    imported_by = create_importing_user()
    payload = build_demo_payload()

    result = import_ethikos_demo_scenario(
        payload,
        imported_by=imported_by,
        dry_run=False,
    )

    assert result["ok"] is True
    assert result["dry_run"] is False
    assert result["scenario_key"] == "public_square_demo"

    actor = User.objects.get(username="demo_maya")
    category = EthikosCategory.objects.get(name="Urbanism")
    topic = EthikosTopic.objects.get(title="[DEMO] Public Square Redevelopment")
    stance = EthikosStance.objects.get(topic=topic, user=actor)
    argument = EthikosArgument.objects.get(topic=topic, author=actor)

    assert actor.email == "demo_maya@example.test"
    assert category.description == "Urban planning and public-space issues."
    assert topic.status == "open"
    assert topic.category == category
    assert stance.value == 2
    assert argument.side == "pro"
    assert argument.content == "The square should become greener while preserving accessibility."

    assert result["summary"] == {
        "actors": 1,
        "categories": 1,
        "topics": 1,
        "stances": 1,
        "arguments": 1,
        "consultations": 0,
        "consultation_votes": 0,
        "impact_items": 0,
    }


def test_import_replace_scenario_resets_previous_tracked_objects():
    imported_by = create_importing_user()

    first_payload = build_demo_payload(
        scenario_key="public_square_demo",
        actor_username="demo_maya",
        topic_key="public_square",
        topic_title="[DEMO] Old Public Square Topic",
    )

    second_payload = build_demo_payload(
        scenario_key="public_square_demo",
        actor_username="demo_nadia",
        topic_key="public_square_v2",
        topic_title="[DEMO] New Public Square Topic",
    )

    first_result = import_ethikos_demo_scenario(
        first_payload,
        imported_by=imported_by,
        dry_run=False,
    )

    assert first_result["ok"] is True
    assert EthikosTopic.objects.filter(title="[DEMO] Old Public Square Topic").exists()

    second_result = import_ethikos_demo_scenario(
        second_payload,
        imported_by=imported_by,
        dry_run=False,
    )

    assert second_result["ok"] is True
    assert not EthikosTopic.objects.filter(title="[DEMO] Old Public Square Topic").exists()
    assert EthikosTopic.objects.filter(title="[DEMO] New Public Square Topic").exists()

    assert not User.objects.filter(username="demo_maya").exists()
    assert User.objects.filter(username="demo_nadia").exists()


def test_import_tracks_created_objects():
    imported_by = create_importing_user()
    payload = build_demo_payload()

    result = import_ethikos_demo_scenario(
        payload,
        imported_by=imported_by,
        dry_run=False,
    )

    assert result["ok"] is True

    tracked_types = set(
        DemoScenarioImport.objects.filter(
            scenario_key="public_square_demo",
        ).values_list("object_type", flat=True)
    )

    assert TRACK_OBJECT_TYPES["user"] in tracked_types
    assert TRACK_OBJECT_TYPES["category"] in tracked_types
    assert TRACK_OBJECT_TYPES["topic"] in tracked_types
    assert TRACK_OBJECT_TYPES["stance"] in tracked_types
    assert TRACK_OBJECT_TYPES["argument"] in tracked_types

    topic = EthikosTopic.objects.get(title="[DEMO] Public Square Redevelopment")

    assert DemoScenarioImport.objects.filter(
        scenario_key="public_square_demo",
        object_type=TRACK_OBJECT_TYPES["topic"],
        object_id=topic.id,
        object_label="[DEMO] Public Square Redevelopment",
        imported_by=imported_by,
    ).exists()


def test_reset_deletes_only_tracked_scenario_objects():
    imported_by = create_importing_user()

    category = EthikosCategory.objects.create(
        name="Tracked Category",
        description="Should be deleted by reset.",
    )

    tracked_topic = EthikosTopic.objects.create(
        title="[DEMO] Tracked Topic",
        description="Should be deleted by reset.",
        status="open",
        category=category,
    )

    untracked_category = EthikosCategory.objects.create(
        name="Untracked Category",
        description="Should survive reset.",
    )

    untracked_topic = EthikosTopic.objects.create(
        title="[DEMO] Untracked Topic",
        description="Should survive reset because it is not tracked.",
        status="open",
        category=untracked_category,
    )

    DemoScenarioImport.objects.create(
        scenario_key="public_square_demo",
        object_type=TRACK_OBJECT_TYPES["topic"],
        object_id=tracked_topic.id,
        object_label=tracked_topic.title,
        imported_by=imported_by,
    )

    result = reset_ethikos_demo_scenario(
        "public_square_demo",
        reset_by=imported_by,
    )

    assert result["ok"] is True
    assert result["scenario_key"] == "public_square_demo"

    assert not EthikosTopic.objects.filter(id=tracked_topic.id).exists()
    assert EthikosTopic.objects.filter(id=untracked_topic.id).exists()

    assert not DemoScenarioImport.objects.filter(
        scenario_key="public_square_demo",
    ).exists()


def test_dry_run_does_not_create_objects():
    imported_by = create_importing_user()
    payload = build_demo_payload()

    result = import_ethikos_demo_scenario(
        payload,
        imported_by=imported_by,
        dry_run=True,
    )

    assert result["ok"] is True
    assert result["dry_run"] is True
    assert result["scenario_key"] == "public_square_demo"

    assert not User.objects.filter(username="demo_maya").exists()
    assert not EthikosCategory.objects.filter(name="Urbanism").exists()
    assert not EthikosTopic.objects.filter(title="[DEMO] Public Square Redevelopment").exists()
    assert EthikosStance.objects.count() == 0
    assert EthikosArgument.objects.count() == 0
    assert DemoScenarioImport.objects.count() == 0