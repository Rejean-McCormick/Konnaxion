import os

base_dir = r"C:\MyCode\Konnaxionv14\frontend"
output_file = os.path.join(base_dir, "concat_output.txt")

# Liste des chemins relatifs à concaténer
files = [
    "app/ethikos/decide/elite/page.tsx",
    "app/ethikos/deliberate/[topic]/page.tsx",
    "app/ethikos/deliberate/elite/page.tsx",
    "app/konnected/learning-library/search-filters/page.tsx",
    "app/konnected/teams-collaboration/activity-planner/page.tsx",
    "app/kreative/collaborative-spaces/my-spaces/page.tsx",
    "app/kreative/community-showcases/featured-projects/page.tsx",
    "components/dashboard-components/CommentCard.tsx",
    "components/dashboard-components/LikeCard.tsx",
    "components/dashboard-components/style.tsx",
    "components/dashboard-components/UserCard.tsx",
    "components/dashboard-components/UserPieChart.tsx",
    "components/layout-components/Header.tsx",
    "components/layout-components/Main.tsx",
    "components/map-components/Map.tsx",
    "components/map-components/StaticMap.tsx",
    "components/sculpture-maker-components/CreateForm/CreateFormTextFields.tsx",
    "components/sculpture-maker-components/CreateForm/index.tsx",
    "components/sculpture-maker-components/CreateForm/MakerCreate.tsx",
    "components/sculpture-maker-components/CreateForm/SculptureCreate.tsx",
    "components/sculpture-maker-components/EditForm/EditFormTextFields.tsx",
    "components/sculpture-maker-components/EditForm/EditImage.tsx",
    "components/sculpture-maker-components/EditForm/index.tsx",
    "components/sculpture-maker-components/EditForm/SculptureEdit.tsx",
    "components/sculpture-maker-components/MakerList.tsx",
    "components/sculpture-maker-components/SculptureDetail/index.tsx",
    "components/sculpture-maker-components/SculptureDetail/SculptureComment.tsx",
    "components/sculpture-maker-components/SculptureDetail/SculptureTrend.tsx",
    "components/sculpture-maker-components/SculptureGrid.tsx",
    "components/sculpture-maker-components/style.tsx",
    "components/user-components/index.tsx",
    "components/user-components/style.tsx",
    "components/user-components/UserLikes.tsx",
    "components/user-components/UserProfile.tsx",
    "components/user-components/UserVisit.tsx",
    "modules/ethikos/admin/audit/page.tsx",
    "modules/ethikos/admin/roles/page.tsx",
    "modules/ethikos/decide/elite/page.tsx",
    "modules/ethikos/decide/public/page.tsx",
    "modules/ethikos/decide/results/page.tsx",
    "modules/ethikos/deliberate/[topic]/page.tsx",
    "modules/ethikos/deliberate/elite/page.tsx",
    "modules/ethikos/impact/tracker/page.tsx",
    "modules/insights/hooks/index.ts",
    "modules/konsensus/components/index.ts"
]

with open(output_file, "w", encoding="utf-8") as outfile:
    for rel_path in files:
        full_path = os.path.join(base_dir, rel_path)
        if os.path.isfile(full_path):
            outfile.write(f"\n# ==== {rel_path} ====\n")
            with open(full_path, "r", encoding="utf-8") as infile:
                outfile.write(infile.read())
        else:
            outfile.write(f"\n# [Fichier introuvable] {rel_path}\n")

print(f"Concaténation terminée. Fichier généré : {output_file}")
