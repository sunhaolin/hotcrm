---
"hotcrm": patch
---

Say the refusal in Chinese on the channel the user actually reads.

Every red message a rep hits when a guard blocks a save was English, in an otherwise Chinese
console — `Cannot edit converted lead 韩雪 - 北方重工集团有限公司 (attempted: status). Make changes
on the converted records instead.` The sentence was correct and unreadable to the person it was
written for.

`refuse()` already had the seam: argument 1 is `message`, the English diagnostic that goes to a log
and that this repo's tests assert on, and argument 4 is `userMessage`, which the console renders
verbatim whenever it is a non-empty string. Four guards used it (the account-classification and EAR
gates, the timesheet budget gate, the travel-cost trip gate); the other eighteen let it default to
the English `message`. All twenty-two now pass a Chinese sentence, so the two channels carry two
languages instead of one:

- **线索 / 客户 / 商机 / 报价 / 合同** freezes — a converted lead, a closed deal, an accepted quote,
  an activated contract — now name the record and the fields the write touched, and point at where
  the change belongs instead.
- **Duplicate and delete refusals** — a taken email, a contact or product or account that other
  records still reference — name who holds the address, what still points at the record, and the
  way out (retire rather than delete, close or reassign first).
- **Field and lifecycle checks** — website scheme, negative revenue, campaign dates, contract term
  against its date range, a reminder after its due date, list price under cost.
- **「禁止致电」 guards** on tasks and events name the object in its own pack label (线索 / 联系人).

Nothing about the wire envelope changes: same `code`, same HTTP status, same field lists, and the
English `message` is untouched, so logs and tests read exactly as before.

A new assertion in `test/refusal-envelope.test.ts` reads the LOWERED hook bodies and fails when any
`refuse(...)` omits its Chinese sentence, so the next guard added without one is a red build rather
than a screenshot from a demo. There is no per-locale table anywhere: the sandbox marshals only
`code` / `status` / `fields` / `userMessage`, so a hook cannot hand the platform a message key to
render, and inlining a locale table into twenty-two lowered bodies is platform work that belongs
upstream. `src/objects/_refusal.ts` records that measurement beside the decision.
