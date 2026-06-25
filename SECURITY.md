# Security Policy

This is a local, offline tooling skill: it renders a self-contained HTML file to
video on your machine and makes no network calls of its own (beyond the one-time
`npm`/`npx` dependency installs you run). There is no server, no auth, and no data
collected.

## Reporting a vulnerability

If you find a security issue (for example, a way the capture/encode scripts could be
abused via a crafted path or filename), please **do not open a public issue**.

Instead, use GitHub's private vulnerability reporting:
**Security → Report a vulnerability** on this repository
(`https://github.com/<owner>/sizzle-reel/security/advisories/new`).

I'll acknowledge reports on a best-effort basis.
