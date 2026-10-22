# UX Research Summary

**Project:** Mental Load Assistant (PoC) — working name "Our Life"
**Date:** 2026-10-22
**Prepared by:** Requirements Elicitation Skill (CPUX)

---

## User Profiles

**William and Sam** — a married couple managing shared life admin together. In the PoC they are
represented as two pre-set mock identities, each operated from a separate browser window to
simulate two people on their own devices at the same time. Their shared context (household, kids,
pets, vehicles, etc.) is established via a short onboarding sequence.

Underlying real-world persona this PoC is designed to validate: a partner who carries ongoing,
low-visibility mental responsibility for noticing and coordinating shared commitments — childcare,
appointments, renewals, family obligations — and a partner who may be willing to help with
individual actions but doesn't currently see or share that ongoing monitoring burden. The product
is designed so either partner could be either persona interchangeably — it does not assume one
person is "the organiser."

**Demo audience** — a small, technical hackathon audience evaluating the concept hands-on. They
need to grasp the core value proposition (vague worry → visible, agreed plan, without blame) within
a short, live, two-window demonstration.

---

## Key Insights

- **Visibility and assignment must be visually and functionally distinct.** Sharing an entry
  (making it visible) must never be conflated with assigning it (making someone responsible). The
  interface need to make clear at every point that a shared item still requires negotiation.
- **The capturer should not be defaulted as the owner.** This is a deliberate design choice that
  must hold in both the UI defaults and the AI's suggested-ownership logic, otherwise the product
  reinforces exactly the imbalance it is trying to solve.
- **AI output must read as tentative, not authoritative.** Users (and in the AI-structuring
  feature's case, couples) are sensitive to anything that feels like the system — or implicitly,
  their partner — telling them what to do. Suggestion framing and editability are not polish, they
  are core to the product's safety.
- **Resolution should feel like mutual acknowledgement, not task completion.** A "Resolved" state
  should read as a small shared win ("Childcare sorted — William contacted the nursery and Sam
  confirmed the dates"), not a checkbox tick, to avoid making the product feel like a chore
  tracker.
- **Private capture is a safety valve, not a formality.** A user needs confidence that typing an
  unfinished or sensitive thought won't immediately expose it to their partner. This is why
  private/share must be an explicit choice at every capture, never a default-to-shared behaviour.

---

## Mental Models & Domain Language

The product deliberately avoids conventional task-management vocabulary. The interface should use:

| Avoid                     | Use instead                          |
| -------------------------- | ------------------------------------- |
| "Assign to"                | "Suggested owner" / "Agree together"  |
| "Task" / "To-do"           | "Something on your mind" / "Concern"  |
| "Complete" / "Done"        | "Resolved"                            |
| "Deadline"                 | "Suggested date"                      |
| "Owner" (as a hard field)  | "Ownership: Me / You / Together / Not agreed" |

Users think of shared life admin in terms of worries and open loops, not structured tasks — the
product's job is to translate a worry into structure, not demand that the user arrive with
structure already formed. The AI-generated outcome/next-step/date/owner should always be
presented using "suggested" language (e.g. "Suggested next step," not "Next step").

---

## Task Analysis

| Task                               | Frequency | Stakes | Key friction                                                                 | Design implication |
| ----------------------------------- | --------- | ------ | ------------------------------------------------------------------------------ | -------------------- |
| Capturing a concern                 | High      | Low    | Any required fields before saving kill the habit of capturing in the moment    | Single text field, immediate save, zero mandatory metadata |
| Deciding private vs. share          | High      | Medium | Users may hesitate if the choice feels irreversible or ambiguous               | Explicit, unambiguous toggle at capture; no silent sharing |
| Reviewing an AI-structured suggestion | High    | Medium | A suggestion that feels like a command rather than a proposal undermines trust | Clear "suggestion" labelling; all fields editable before confirming |
| Responding to a shared item (ownership negotiation) | Medium | High | A blunt "assign" action can feel like being told what to do by one's partner | Four relationship-aware response options instead of a single "assign" action |
| Weekly check-in review              | Low (weekly) | Medium | Reviewing everything at once can feel overwhelming or like a performance review | Step-through, one-item-at-a-time guided flow rather than a dense dashboard |

---

## Design Risks

- **The demo mechanic (two browser windows) could expose sync lag.** If polling is too slow or
  inconsistent, the audience may see stale state in one window after an action in the other,
  undermining the "shared, real-time" feel the product depends on. Keep the polling interval short
  and visually indicate when data refreshes.
- **AI fallback must not look broken.** If the real AI call fails live in front of an audience, the
  canned fallback needs to appear seamless (same visual treatment as a real response) rather than
  as an obvious error state, or the illusion of a working AI feature collapses.
- **Onboarding questions could feel like a chore if not kept short.** Given the tight build and
  demo window, even 4-5 questions risk feeling like friction before the "real" product is seen —
  make each skippable and keep the sequence fast to click through.
- **Ownership-response language could still read as task assignment if poorly worded in the UI.**
  Button copy ("I'll take this" etc.) needs to stay close to natural conversational phrasing, not
  be rebranded internally as "Assign to me" in a way that leaks into the visible UI.
- **Resolution text needs a real acknowledgement, not just a status change,** or the "Resolved"
  state will feel identical to ticking off a task — undermining the product's core differentiation
  from conventional to-do apps.

---

## Usability Test Plan

Given this is a same-day hackathon PoC, formal usability testing is out of scope. For future
iterations beyond today:

- **What to test:** The full capture → AI structure → share → negotiate → inbox loop, and the
  weekly check-in flow.
- **With whom:** Real couples managing shared household responsibilities (not single users),
  ideally with asymmetric mental-load distribution, to validate whether the product actually
  surfaces and redistributes invisible responsibility rather than just adding another task list.
- **Pass/fail framing:**
  - Pass: both partners can independently and correctly describe what an item's current state and
    ownership means without explanation.
  - Pass: neither partner describes the ownership-negotiation flow as feeling like "being assigned
    a task" by the other.
  - Fail: a partner expresses surprise that an entry they thought was private became visible, or
    vice versa.
  - Fail: either partner reports the check-in flow feeling like a performance review of who did
    more.
