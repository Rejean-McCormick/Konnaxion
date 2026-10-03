import json
from collections import Counter
from pathlib import Path


FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "isced_f_2013.json"
EXPECTED_COUNTS = {0: 10, 1: 26, 2: 77}


def _entries():
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_isced_f_expertise_profile_is_complete_and_unique():
    entries = _entries()
    counts = Counter(entry["depth"] for entry in entries)
    codes = [entry["code"] for entry in entries]

    assert dict(counts) == EXPECTED_COUNTS
    assert len(entries) == 113
    assert len(codes) == len(set(codes))
    assert all(not code.startswith("00") for code in codes)


def test_isced_f_expertise_profile_has_valid_hierarchy():
    entries = _entries()
    by_code = {entry["code"]: entry for entry in entries}
    expected_length = {0: 2, 1: 3, 2: 4}

    for entry in entries:
        code = entry["code"]
        depth = entry["depth"]
        parent_code = entry["parent_code"]

        assert code.isdigit()
        assert len(code) == expected_length[depth]

        if depth == 0:
            assert parent_code is None
            continue

        assert parent_code in by_code
        assert by_code[parent_code]["depth"] == depth - 1


def test_isced_f_expertise_profile_contains_reference_branches():
    by_code = {entry["code"]: entry["name"] for entry in _entries()}

    assert by_code["0211"] == "Audio-visual techniques and media production"
    assert by_code["0611"] == "Computer use"
    assert by_code["0714"] == "Electronics and automation"
    assert by_code["0912"] == "Medicine"
    assert by_code["1041"] == "Transport services"
