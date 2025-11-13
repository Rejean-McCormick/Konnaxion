import os

# List of paths exactly as you gave them
file_paths = [
    "tests/app/ekoh/achievements-badges/earned-badges-display/page.test.tsx",
    "tests/app/ekoh/dashboard/page.test.tsx",
    "tests/app/ekoh/expertise-areas/view-current-expertise/page.test.tsx",
    "tests/app/ekoh/overview-analytics/current-ekoh-score/page.test.tsx",
    "tests/app/ekoh/voting-influence/current-voting-weight/page.test.tsx",
    "tests/app/keenkonnect/ai-team-matching/find-teams/page.test.tsx",
    "tests/app/keenkonnect/ai-team-matching/match-preferences/page.test.tsx",
    "tests/app/keenkonnect/ai-team-matching/my-matches/page.test.tsx",
    "tests/app/keenkonnect/dashboard/page.test.tsx",
    "tests/app/keenkonnect/knowledge/browse-repository/page.test.tsx",
    "tests/app/keenkonnect/knowledge/document-management/page.test.tsx",
    "tests/app/keenkonnect/knowledge/search-filter-documents/page.test.tsx",
    "tests/app/keenkonnect/knowledge/upload-new-document/page.test.tsx",
    "tests/app/keenkonnect/projects/browse-projects/page.test.tsx",
    "tests/app/keenkonnect/projects/create-new-project/page.test.tsx",
    "tests/app/keenkonnect/projects/my-projects/page.test.tsx",
    "tests/app/keenkonnect/projects/project-workspace/page.test.tsx",
    "tests/app/keenkonnect/sustainability-impact/submit-impact-reports/page.test.tsx",
    "tests/app/keenkonnect/sustainability-impact/sustainability-dashboard/page.test.tsx",
    "tests/app/keenkonnect/sustainability-impact/track-project-impact/page.test.tsx",
    "tests/app/keenkonnect/user-reputation/account-preferences/page.test.tsx",
    "tests/app/keenkonnect/user-reputation/manage-expertise-areas/page.test.tsx",
    "tests/app/keenkonnect/user-reputation/view-reputation-ekoh/page.test.tsx",
    "tests/app/keenkonnect/workspaces/browse-available-workspaces/page.test.tsx",
    "tests/app/keenkonnect/workspaces/launch-new-workspace/page.test.tsx",
    "tests/app/keenkonnect/workspaces/my-workspaces/page.test.tsx",
    "tests/app/konnected/certifications/certification-programs/page.test.tsx",
    "tests/app/konnected/certifications/exam-dashboard-results/page.test.tsx",
    "tests/app/konnected/certifications/exam-preparation/page.test.tsx",
    "tests/app/konnected/certifications/exam-registration/page.test.tsx",
    "tests/app/konnected/community-discussions/active-threads/page.test.tsx",
    "tests/app/konnected/community-discussions/moderation/page.test.tsx",
    "tests/app/konnected/community-discussions/start-new-discussion/page.test.tsx",
    "tests/app/konnected/dashboard/page.test.tsx",
    "tests/app/konnected/learning-library/browse-resources/page.test.tsx",
    "tests/app/konnected/learning-library/offline-content/page.test.tsx",
    "tests/app/konnected/learning-library/recommended-resources/page.test.tsx",
    "tests/app/konnected/learning-library/search-filters/page.test.tsx",
    "tests/app/konnected/learning-paths/create-learning-path/page.test.tsx",
    "tests/app/konnected/learning-paths/manage-existing-paths/page.test.tsx",
    "tests/app/konnected/learning-paths/my-learning-path/page.test.tsx",
    "tests/app/konnected/teams-collaboration/activity-planner/page.test.tsx",
    "tests/app/konnected/teams-collaboration/my-teams/page.test.tsx",
    "tests/app/konnected/teams-collaboration/project-workspaces/page.test.tsx",
    "tests/app/konnected/teams-collaboration/team-builder/page.test.tsx",
    "tests/app/kreative/collaborative-spaces/find-spaces/page.test.tsx",
    "tests/app/kreative/collaborative-spaces/my-spaces/page.test.tsx",
    "tests/app/kreative/collaborative-spaces/start-new-space/page.test.tsx",
    "tests/app/kreative/community-showcases/featured-projects/page.test.tsx",
    "tests/app/kreative/community-showcases/submit-to-showcase/page.test.tsx",
    "tests/app/kreative/community-showcases/top-creators/page.test.tsx",
    "tests/app/kreative/creative-hub/explore-ideas/page.test.tsx",
    "tests/app/kreative/creative-hub/inspiration-gallery/page.test.tsx",
    "tests/app/kreative/creative-hub/submit-creative-work/page.test.tsx",
    "tests/app/kreative/dashboard/page.test.tsx",
    "tests/app/kreative/idea-incubator/collaborate-on-ideas/page.test.tsx",
    "tests/app/kreative/idea-incubator/create-new-idea/page.test.tsx",
    "tests/app/kreative/idea-incubator/my-ideas/page.test.tsx",
    "tests/routes-tests.spec.ts",
    "tests/routes.spec.ts"
]

output_file = "combined_output.txt"

with open(output_file, "w", encoding="utf-8") as outfile:
    for path in file_paths:
        if os.path.exists(path):
            outfile.write(f"===== {path} =====\n")
            with open(path, "r", encoding="utf-8") as infile:
                outfile.write(infile.read())
            outfile.write("\n\n")
        else:
            outfile.write(f"===== {path} NOT FOUND =====\n\n")

print(f"Done. Combined file written to {output_file}")
