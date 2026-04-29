# backend/konnaxion/ethikos/tests/test_demo_import_schema.py

import pytest

from konnaxion.ethikos.demo_import.schema import (
    SCHEMA_VERSION,
    STANCE_MAX,
    STANCE_MIN,
    validate_demo_scenario,
)


def make_valid_demo_scenario(overrides=None):
    scenario = {
        "schema_version": SCHEMA_VERSION,
        "scenario_key": "public_square_demo",
        "scenario_title": "Public Square Redevelopment Demo",
        "mode": "replace_scenario",
        "metadata": {
            "description": "Demo scenario for ethiKos importer tests.",
            "language": "en",
        },
        "actors": [
            {
                "key": "maya",
                "username": "demo_maya",
                "display_name": "Maya",
                "email": "demo_maya@example.test",
                "role": "citizen",
                "is_ethikos_elite": False,
            },
            {
                "key": "samuel",
                "username": "demo_samuel",
                "display_name": "Samuel",
                "email": "demo_samuel@example.test",
                "role": "urban_planning_expert",
                "is_ethikos_elite": True,
            },
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
                "key": "public_square",
                "title": "[DEMO] How should we redesign Place des Rivières?",
                "description": "A public debate about greening, mobility, parking, and accessibility.",
                "status": "open",
                "category": "urbanism",
                "start_date": "2026-05-01",
                "end_date": "2026-05-30",
            }
        ],
        "stances": [
            {
                "topic": "public_square",
                "actor": "maya",
                "value": 2,
            },
            {
                "topic": "public_square",
                "actor": "samuel",
                "value": 3,
            },
        ],
        "arguments": [
            {
                "key": "maya_argument_1",
                "topic": "public_square",
                "actor": "maya",
                "side": "pro",
                "content": "The square should become greener while keeping access for people with reduced mobility.",
            },
            {
                "key": "samuel_argument_1",
                "topic": "public_square",
                "actor": "samuel",
                "side": "pro",
                "parent": "maya_argument_1",
                "content": "This can work if accessibility and emergency access are preserved.",
            },
        ],
        "consultations": [
            {
                "key": "public_square_vote",
                "title": "[DEMO] Preferred redevelopment scenario",
                "status": "open",
                "open_date": "2026-05-01",
                "close_date": "2026-05-30",
                "options": [
                    {
                        "key": "green_square",
                        "label": "Mostly green public square",
                    },
                    {
                        "key": "mixed_square",
                        "label": "Mixed public square with limited parking",
                    },
                ],
            }
        ],
        "consultation_votes": [
            {
                "consultation": "public_square_vote",
                "actor": "maya",
                "option": "mixed_square",
                "raw_value": 1,
                "weighted_value": 1.0,
            },
            {
                "consultation": "public_square_vote",
                "actor": "samuel",
                "option": "mixed_square",
                "raw_value": 1,
                "weighted_value": 1.35,
            },
        ],
        "impact_items": [
            {
                "consultation": "public_square_vote",
                "action": "Publish preliminary design proposal",
                "status": "planned",
                "date": "2026-06-10",
            }
        ],
    }

    if overrides:
        scenario.update(overrides)

    return scenario


def error_messages(errors):
    return [error["message"] for error in errors]


def error_paths(errors):
    return [error["path"] for error in errors]


def test_valid_demo_scenario_passes_validation():
    scenario = make_valid_demo_scenario()

    errors = validate_demo_scenario(scenario)

    assert errors == []


def test_invalid_schema_version_fails_validation():
    scenario = make_valid_demo_scenario(
        {
            "schema_version": "wrong-schema-version",
        }
    )

    errors = validate_demo_scenario(scenario)

    assert errors
    assert "schema_version" in error_paths(errors)
    assert any("Expected" in message for message in error_messages(errors))


def test_unknown_actor_reference_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["stances"][0]["actor"] = "unknown_actor"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Unknown actor reference" in message for message in error_messages(errors))


def test_unknown_topic_reference_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["stances"][0]["topic"] = "unknown_topic"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Unknown topic reference" in message for message in error_messages(errors))


@pytest.mark.parametrize(
    "invalid_value",
    [
        STANCE_MIN - 1,
        STANCE_MAX + 1,
        "strongly_support",
        None,
        1.5,
    ],
)
def test_stance_outside_allowed_range_fails_validation(invalid_value):
    scenario = make_valid_demo_scenario()
    scenario["stances"][0]["value"] = invalid_value

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Stance value must be an integer from -3 to +3" in message
        for message in error_messages(errors)
    )


def test_unknown_consultation_reference_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["consultation_votes"][0]["consultation"] = "unknown_consultation"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Unknown consultation reference" in message
        for message in error_messages(errors)
    )


def test_unknown_category_reference_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["topics"][0]["category"] = "unknown_category"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Unknown category reference" in message
        for message in error_messages(errors)
    )


def test_invalid_topic_status_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["topics"][0]["status"] = "published"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Invalid topic status" in message for message in error_messages(errors))


def test_invalid_argument_side_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["arguments"][0]["side"] = "support"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Invalid argument side" in message for message in error_messages(errors))


def test_unknown_argument_parent_reference_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["arguments"][1]["parent"] = "unknown_argument"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Unknown argument parent reference" in message
        for message in error_messages(errors)
    )


def test_missing_scenario_key_fails_validation():
    scenario = make_valid_demo_scenario()
    scenario["scenario_key"] = ""

    errors = validate_demo_scenario(scenario)

    assert errors
    assert "scenario_key" in error_paths(errors)
    assert any("scenario_key is required" in message for message in error_messages(errors))


def test_duplicate_actor_keys_fail_validation():
    scenario = make_valid_demo_scenario()
    scenario["actors"].append(
        {
            "key": "maya",
            "username": "demo_maya_2",
            "display_name": "Maya Duplicate",
        }
    )

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Duplicate actor key" in message for message in error_messages(errors))


def test_duplicate_topic_keys_fail_validation():
    scenario = make_valid_demo_scenario()
    scenario["topics"].append(
        {
            "key": "public_square",
            "title": "[DEMO] Duplicate topic",
            "description": "Duplicate topic.",
            "status": "open",
            "category": "urbanism",
        }
    )

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any("Duplicate topic key" in message for message in error_messages(errors))


def test_demo_actor_username_must_use_demo_prefix():
    scenario = make_valid_demo_scenario()
    scenario["actors"][0]["username"] = "maya"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Demo actor username must start with demo_" in message
        for message in error_messages(errors)
    )


def test_demo_topic_title_must_use_demo_prefix():
    scenario = make_valid_demo_scenario()
    scenario["topics"][0]["title"] = "How should we redesign Place des Rivières?"

    errors = validate_demo_scenario(scenario)

    assert errors
    assert any(
        "Demo topic title must start with [DEMO]" in message
        for message in error_messages(errors)
    )