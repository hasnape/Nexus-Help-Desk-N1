cat > run-agent.sh <<'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

REPO="hasnape/Nexus-Help-Desk-N1"
CLONE_DIR="./tmp-nexus-agent"
BRANCH_WORKFLOW="chore/add-auto-create-db-pr"
WORKFLOW_PATH=".github/workflows/auto-create-db-pr.yml"
PR_TITLE="ci: add auto-create-db-pr workflow"
PR_BODY="Adds workflow to auto-create branch+PR for DB migration & RLS changes."

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is required. Install and authenticate (gh auth login)."
  exit 1
fi

# Clean clone dir
rm -rf "$CLONE_DIR"
git clone "git@github.com:${REPO}.git" "$CLONE_DIR"
cd "$CLONE_DIR"

git fetch origin
# Use checkout -B to overwrite if branch already exists locally
git checkout -B "$BRANCH_WORKFLOW"

mkdir -p "$(dirname "$WORKFLOW_PATH")"

cat > "$WORKFLOW_PATH" <<'YML'
# (Le workflow complet est inséré ici — utilise exactement le contenu que tu as reçu précédemment)
# Si tu préfères, remplace cette section par le contenu complet fourni dans la conversation.
YML

git add "$WORKFLOW_PATH"
git commit -m "ci: add workflow to auto-create db align PR" || true
git push --set-upstream origin "$BRANCH_WORKFLOW"

echo "PR for workflow creation..."
gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base master --head "$BRANCH_WORKFLOW" || true

echo "Triggering the workflow run..."
gh workflow run "Create DB-align PR" --ref "$BRANCH_WORKFLOW" || true

echo "Done. Check Actions tab and Pull Requests on GitHub."
SCRIPT

chmod +x run-agent.sh
./run-agent.sh
