---
'hotcrm': patch
---

Four measured MCP usage-example slides in the IT-team briefing deck under
`docs/demo/it-platform/`: connecting a client (OAuth or a revocable API key
minted at `POST /api/v1/keys`), a read-only session traced through
`describe_object` → `query_records` → `aggregate_records`, the same question
answered under two identities to show row-level security, and writes through
`list_actions` / `run_action` including a paused screen flow and a hook
refusal. The MCP overview slide now names the eleven tools and six prompts the
endpoint actually serves.
