#!/bin/sh
set -e
BRANCH="chore/ui-ux-improvements"
git fetch origin
git checkout -b "$BRANCH"
git add src/styles src/components scripts
git commit -m "chore(ui): add Nexus theme tokens, global styles and base UI components (Button, Header, AI Button)"
git push --set-upstream origin "$BRANCH"
echo "Branch pushed: $BRANCH"
echo "Create PR with:"
echo "gh pr create --base master --head $BRANCH --title 'chore(ui): improve UX baseline & theme' --body 'Adds Nexus theme tokens, global styles and base components (Button, Header, AI Button). Review and integrate progressively.' --draft"
