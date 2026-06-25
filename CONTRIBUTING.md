# Contributing

This is a personal tool, shared in case it's useful. Issues and pull requests are
welcome but reviewed on a best-effort basis — no SLA.

## Filing an issue

Please include:

- Your agent host and version (e.g. GitHub Copilot CLI, Claude Code) and OS.
- `node --version`.
- The exact prompt you gave the agent, and what it did vs. what you expected.
- For render problems: which script failed (`smoke.mjs` / `capture.mjs` / `encode.mjs`),
  the full console output, and whether captured frames were black (see
  [`references/gotchas.md`](references/gotchas.md)).

## Pull requests

- Keep changes focused; one concern per PR.
- The capture/encode plumbing is deliberately low-freedom — prefer changes to the
  `references/` guidance and scene patterns over the scripts unless you're fixing a bug.
- Don't pin dependency versions inside the skill; the skill looks up current versions
  per project on first use.
- Test a real render end-to-end (`smoke.mjs` → `capture.mjs` → `encode.mjs`) before
  submitting changes that touch the pipeline.

By contributing, you agree your contributions are licensed under the repository's
[MIT License](LICENSE).
