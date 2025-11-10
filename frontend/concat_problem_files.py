import os
from pathlib import Path

# Point de départ
root = Path(r"C:\MyCode\Konnaxionv14\frontend\app")
out_file = root / "problem_files_concat.txt"

# Liste des chemins relatifs (issus de ton relevé)
files = [
    # 5 problèmes
    r"..\components\sculpture-maker-components\CreateForm\SculptureCreate.tsx",
    r"..\components\sculpture-maker-components\EditForm\SculptureEdit.tsx",
    # 4 problèmes
    r"..\components\sculpture-maker-components\EditForm\MakerEdit.tsx",
    # 3 problèmes
    r"keenkonnect\ai-team-matching\match-preferences\page.tsx",
    r"konnected\teams-collaboration\project-workspaces\page.tsx",
    # 2 problèmes (échantillon, ajoute le reste si besoin)
    r"ethikos\decide\public\page.tsx",
    r"ethikos\deliberate\elite\page.tsx",
    r"keenkonnect\ai-team-matching\my-matches\page.tsx",
    r"keenkonnect\knowledge\browse-repository\page.tsx",
    r"keenkonnect\knowledge\upload-new-document\page.tsx",
    r"keenkonnect\projects\create-new-project\page.tsx",
    r"keenkonnect\projects\my-projects\page.tsx",
    r"keenkonnect\sustainability-impact\submit-impact-reports\page.tsx",
    r"keenkonnect\sustainability-impact\sustainability-dashboard\page.tsx",
    r"keenkonnect\user-reputation\manage-expertise-areas\page.tsx",
    r"konnected\certifications\exam-dashboard-results\page.tsx",
    r"konnected\community-discussions\moderation\page.tsx",
    r"konnected\community-discussions\start-new-discussion\page.tsx",
    r"konnected\learning-library\browse-resources\page.tsx",
    r"konnected\learning-library\search-filters\page.tsx",
    r"konnected\learning-paths\manage-existing-paths\page.tsx",
    r"konnected\learning-paths\my-learning-path\page.tsx",
    r"konnected\teams-collaboration\my-teams\page.tsx",
    r"kreative\community-showcases\submit-to-showcase\page.tsx",
    r"kreative\creative-hub\submit-creative-work\page.tsx",
]

with out_file.open("w", encoding="utf-8") as out:
    for rel in files:
        path = (root / rel).resolve()
        if not path.is_file():
            out.write(f"\n===== FILE NOT FOUND: {path} =====\n")
            continue
        out.write(f"\n===== BEGIN {path.relative_to(root.parent)} =====\n")
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            content = f"[Erreur lecture: {e}]"
        out.write(content)
        out.write(f"\n===== END {path.relative_to(root.parent)} =====\n")

print(f"Concat terminé: {out_file}")
