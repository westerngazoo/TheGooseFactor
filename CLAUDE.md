# CLAUDE.md — environment notes for Claude Code

## User's local path
The user's local checkout of this repo on their machine (WSL) lives at:

```
/home/goose/projects/TheGooseFactor
```

Use this exact path in all `cd` commands when giving the user shell instructions.
Do NOT guess `~/TheGooseFactor` or any other path.

## Default development branch
Active feature branch: `claude/review-goose-writing-style-JxWAh`. Push to it; do not switch unless asked.

## Dev server
- The user runs `npm run start` from `/home/goose/projects/TheGooseFactor` in WSL.
- Use `--host 0.0.0.0` so Windows browsers can hit `localhost:3000`.
- Hot reload does NOT pick up new `@docusaurus/plugin-content-docs` instances — adding a book to the `books` array in `docusaurus.config.ts` requires a full server restart.

## Sandbox vs user
The sandbox here cannot keep a long-running dev server alive between Bash invocations.
The user's environment can. Don't try to demo `npm run start` in the sandbox; just instruct them.
