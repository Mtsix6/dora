@AGENTS.md

## Deployment Workflow

Follow these rules **every time** you complete a task:

### For code fixes / logic changes / bug fixes:
After completing the fix, automatically:
1. `git add -A`
2. `git commit -m "fix: <short description>"`
3. `git push` → Vercel auto-deploys via GitHub integration

Do this without asking the user. Just do it and confirm when done.

### For design / UI / visual changes:
After completing the design change:
1. Tell the user: "Design change ready — reviewing locally at http://localhost:3000. Reply **deploy** when you're happy and I'll push to GitHub + Vercel."
2. Start `npm run dev` in the background so they can preview
3. **Wait** for the user to say "deploy" (or "yes", "looks good", "publish", "push")
4. Once confirmed: `git add -A` → `git commit -m "design: <description>"` → `git push`
5. Vercel auto-deploys via the GitHub integration (no extra step needed)

### Commit message format:
- Bug fix: `fix: description`
- Feature: `feat: description`
- Design/UI: `design: description`
- Refactor: `refactor: description`

### Never:
- Push before user confirmation on design changes
- Skip the git push after code fixes
- Use `--force` push
