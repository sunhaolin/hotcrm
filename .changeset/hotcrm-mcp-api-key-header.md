---
---

The repo-level `.mcp.json` now sends an `x-api-key` header, filled from the
`HOTCRM_API_KEY` environment variable, when Claude Code connects to the HotCRM
MCP server at `http://localhost:4001/api/v1/mcp`. The OAuth sign-in Claude Code
attempts otherwise cannot complete: `@better-auth/oauth-provider` 1.7.2 (via
`@objectstack/plugin-auth` 17.4.0) treats a dynamic client registration that
omits `application_type` as a web client and rejects the loopback redirect URI
Claude Code registers. Mint a key under 设置 → 集成 → 连接智能体 and put it in
the `env` block of `~/.claude/settings.json`; the file itself carries no
secret. Developer tooling only, nothing ships to users.
