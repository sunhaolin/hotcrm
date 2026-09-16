---
name: restarting-the-dev-server
description: Use when asked to restart, start, stop or re-launch the HotCRM service or dev server (「重启服务」/「启动服务」), when localhost:4001 stops responding, or when the hotcrm MCP server reports ConnectionRefused.
---

# Restarting the HotCRM dev server

One ObjectStack dev server on **port 4001**, launched from `.claude/launch.json`
(`crm-app` → `pnpm dev`). Drive it through the **preview tools**, ⛔ never
`pnpm dev &` in Bash — a backgrounded shell process escapes `preview_stop` and
takes its logs with it.

## Before restarting: is a restart even wanted?

- **A `src/` edit does not need one.** The dev server watches
  `objectstack.config.ts` and `src/` and rebuilds + restarts itself.
- **A restart replays the seed data**, overwriting record state back to seed
  values — records submitted during a demo return to draft; approval requests
  are not replayed (`docs/demo/psa-presales/RUNBOOK.md`). If the server is
  healthy and a demo is in progress, ask before restarting.
- A restart *is* the fix for: a dead or unreachable 4001, a `better-sqlite3` ABI
  flood, and re-running the sharing-rule boot backfill.

## Step 1 — probe, and gate on the composition

Use `preview_list` for one thing only — the serverId of the entry on port 4001.
⛔ Do not trust its state fields: `status` has been seen reading `starting` for
a server that had been answering for minutes, and `neverBecameReady: true` gets
stamped on servers that were demonstrably healthy before you stopped them. The
health endpoint is the only honest probe. Run from the repo root:

```bash
lsof -nP -iTCP:4001 -sTCP:LISTEN; curl -s --max-time 5 http://localhost:4001/api/v1/health; echo
grep -c 'Acme Corporation' dist/objectstack.json   # composition gate, see below
```

Healthy = `{"success":true,"data":{"status":"ok",…,"uptime":<seconds>}}`; that
`uptime` is also how you tell a freshly started server from one you never
restarted. **Note the PID `lsof` prints** — a different PID at the end is the
hardest proof you actually restarted something. Nothing listening ⇒ nothing to
stop; go to step 3 — but **run the composition gate either way.**

**🚦 Composition gate.** `.claude/launch.json` only knows the **default**
composition (bare `pnpm dev`, ~653 seed rows). The Chinese demo is
`pnpm dev:zh` (`HOTCRM_COMPOSITION=zh-demo`, ~240 rows) and **has no
launch.json entry**: restarting it with `preview_start crm-app` rebuilds under
the default composition and mixes English demo accounts into the customer list.

| Reading | Composition | Restart with |
|---|---|---|
| `grep -c 'Acme Corporation' dist/objectstack.json` > 0 | default | `preview_start {name: "crm-app"}` |
| that grep = 0, or `$HOTCRM_COMPOSITION` = `zh-demo` | zh demo | `pnpm dev:zh` **in the user's terminal**, ⛔ not `crm-app` |

The boot log's `Seeds: app.objectstack.hotcrm <N> rows` confirms it too, but
only when a server is up — the grep works on a dead one, which is the case you
usually face.

## Step 2 — stop it

`preview_stop {serverId}`.

> ⚠️ `preview_start` on a live server returns `reused: true` and **starts no new
> process**. Calling it alone is not a restart. Stop first.

Confirm the port frees (~1 s):

```bash
sleep 2; lsof -nP -iTCP:4001 -sTCP:LISTEN || echo "4001 released"
```

Still held? `lsof -ti tcp:4001 -sTCP:LISTEN` names the PID. ⛔ Keep the
`-sTCP:LISTEN` — without it `lsof` also matches **client** sockets, and the
Claude app's own network process shows up there because the preview tab is
connected to 4001. Kill the PID only if it is this repo's own orphaned
`objectstack`/`pnpm dev` child (`ps -p <pid> -o command=` to check); if it is
anything else, ⛔ report the PID to the user and let them decide — do not
accept port 4002 instead, `.mcp.json` hard-codes 4001.

## Step 3 — start it

`preview_start {name: "crm-app"}`. Check two fields in the result:
`reused: false` (proof a new process started) and `port: 4001` (`autoPort: true`
would silently move it). `lsof -ti tcp:4001 -sTCP:LISTEN` should now report a
**different PID** than the one you noted in step 1 — again with the
`-sTCP:LISTEN`, or you get the listener plus whoever is connected to it.

## Step 4 — verify, with both gates

Health answers ~8–12 s after start on a warm DB; a first boot after
`demo:reset` is slower (RUNBOOK measures 30–40 s for the zh demo). Poll **with
a bound** — an unbounded `until` loop on a server that never comes up just
spins until the harness kills it, with nothing to show for the wait:

```bash
for i in $(seq 1 60); do
  curl -sf --max-time 2 http://localhost:4001/api/v1/health && { echo; exit 0; }
  sleep 1
done
echo "NO health response after 60s"; exit 1
```

Report the server's **own** `uptime` from that body — ⛔ not your loop counter,
which only times how long you waited. No answer after 60 s? `preview_logs
{serverId, level: "error"}` has the reason; check it against the boot-noise
table below before calling it a failure.

Then confirm **both** gates — `preview_logs` takes a `search` filter, so each is
one line rather than a 60-line dump (`{serverId, search: "ready"}`, then
`{serverId, search: "Seeds:"}`):

- `✓ Server is ready`
- `Seeds: app.objectstack.hotcrm <N> rows` — **653** under the default
  composition, **~240** under zh-demo. N must match the composition you gated on
  in step 1. A `200` alone does not prove you rebuilt the right data.

## Step 5 — the MCP server

`hotcrm` in `.mcp.json` points at `http://localhost:4001/api/v1/mcp` and drops
on every restart. Prove the **server side** is fine yourself:

```bash
curl -s -o /dev/null -w "mcp=%{http_code}\n" -X POST http://localhost:4001/api/v1/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -H "x-api-key: $HOTCRM_API_KEY" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

`200` ⇒ endpoint and key are good and only the client needs re-dialling.
`401` ⇒ `HOTCRM_API_KEY` is unset or stale — `pnpm demo:reset` wipes the key's
row. Pass the key as `$HOTCRM_API_KEY` as written above; ⛔ never `echo` it or
print the environment, which spills a live credential into the transcript.

⛔ `mcp__ccd_connectors__reconnect_session_connector` **does not work here**: it
re-dials only `kind: "connector"`, and `hotcrm` is `kind: "project"` (it comes
from `.mcp.json`). It answers *"hotcrm is not a connector…"*. Do not be talked
out of this by `session_connectors_status`, whose reply carries a blanket note
that reconnect *"can re-dial a failed server"* — it cannot re-dial this one.
**Tell the user to reconnect it from the `/mcp` dialog** — that is the only
path.

## Boot noise that is not a problem

| Log line | Meaning |
|---|---|
| `WARN [SettingsService] Pre-bind READ of namespace 'auth'` | Platform startup-ordering warning, logged every boot. Upstream's to fix — ⛔ do not work around it here (AGENTS.md §2). |
| `WARN The "pnpm" field in package.json is no longer read` | pnpm 10 notice. Harmless. |
| `NODE_MODULE_VERSION … requires …` flood | `better-sqlite3` built for another Node ABI → `pnpm rebuild better-sqlite3`, then restart. Environment issue, ⛔ never an app change. |

If the PID on 4001 changes between two of your own probes, another session is
restarting the same server — say so rather than racing it. `preview_list`'s
recently-ended entries are weaker evidence: several `crm-app` rows stopped
minutes apart are normal after a few restarts in one session, so judge by the
live PID, not by that list.

Console `http://localhost:4001/_console/` · dev admin `admin@objectos.ai` /
`admin123` (seeded on an empty DB, dev only).
