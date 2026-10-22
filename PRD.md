# Product Requirements Document

**Project:** Mental Load Assistant (PoC) — working name "Our Life"
**Version:** 1.0
**Date:** 2026-10-22
**Prepared by:** Requirements Elicitation Skill
**Status:** Draft - Awaiting stakeholder sign-off

---

## 1. Overview

### 1.1 Purpose

A shared mental-load assistant for two people who manage a life together. Either person can
capture anything occupying their mind in a single line of text; the app uses AI to turn that
into a clear, considerate, editable plan — a suggested outcome, next step, and ownership — which
the pair then agree on together. The product promise: "Get it out of your head. Make it visible.
Work it out together." This PRD scopes a proof-of-concept (PoC) built for a hackathon demo to a
small tech audience on 2026-10-22, not a production release.

### 1.2 Success Criteria

For today's demo, success means: two presenters, each in a separate browser window as "William"
and "Sam," can live-demonstrate the full loop — capture a concern, see it AI-structured, choose
to share it, have the other person respond with an ownership choice, see it move through the
shared inbox, and walk through a weekly check-in review — without the demo visibly breaking, even
if the underlying AI call fails or is slow.

Beyond today, the product hypothesis being tested is: *if either person can capture a concern in
seconds, and the app helps the pair agree a next step and ownership without blame, both people
will feel more confident that shared commitments are visible and under control.*

### 1.3 Background

The real problem this product addresses is not task-tracking but invisible mental load — one
partner silently carrying the responsibility of noticing, remembering, and coordinating shared
life admin. Existing to-do and task-sharing apps either ignore this (plain lists) or make it worse
by turning shared life into a scoreboard (assigned tasks, completion counts). This PoC is the
first test of a different approach: effortless capture, explicit privacy control, AI-assisted
structuring that remains advisory rather than authoritative, and negotiated — not assigned —
ownership.

---

## 2. Users

| User type        | Description                                                                 | Primary goal                                                              | Key frustration today                                                   |
| ----------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Partner (either)  | One half of a married couple managing shared life admin and responsibilities | Get a nagging thought out of their head and either resolve it or share it fairly | Carrying mental responsibility alone, or having things dumped on them as tasks |
| Demo audience     | Small tech audience at a hackathon                                            | Understand the product concept quickly by trying it hands-on               | N/A — external evaluators, not end users                                   |

### User Personas

**William and Sam** are a married couple who share a home, finances, and day-to-day
responsibilities. In the demo, each is represented by a pre-selected mock identity (no real
account creation) operating in their own browser window, simulating two people on their own
devices. Their shared context (household, pets, vehicles, etc.) is established through a short
onboarding step before the demo begins.

**The demo audience** is a technical audience evaluating the concept live. They need to be able to
watch or participate in the two-window flow and immediately grasp the core value: a vague worry
becomes a structured, agreed, visible plan — without one person feeling policed or nagged.

---

## 3. Scope

### 3.1 In Scope

- Two pre-named mock identities ("William" and "Sam") selectable without authentication.
- Short, skippable household-context onboarding (4–5 fixed questions: working patterns, kids,
  pets, home, vehicles) before entering the app.
- Single-field capture ("What's on your mind?") with immediate save, no mandatory metadata.
- Private / Share toggle at the point of capture.
- AI-assisted structuring of each entry via an Anthropic-compatible LLM endpoint, returning:
  Outcome, Next step, Suggested date, and an Ownership suggestion. All AI output is labelled as an
  editable suggestion, not a fact.
- Fallback to a pre-written canned structured response if the AI call fails or times out, so the
  live demo does not visibly break.
- Ownership negotiation on shared items with four response options: "I'll take this," "Let's do
  it together," "Can we discuss it?," "Not now."
- Shared inbox showing items across a trimmed five-state lifecycle: On my mind (private) → Shared
  → Needs agreement → Agreed/Planned → Resolved.
- Interactive weekly check-in: guided, step-through review of open items with prompts (e.g. "what
  needs a decision this week?") allowing the user to act on each item during the review.
- Shared state synced between two separate browser windows via a backend store (Upstash Redis,
  free tier), polled periodically — not reliant on a single browser tab or local-only state.
- Deployment on Vercel (free tier).

### 3.2 Out of Scope

Explicitly excluded from today's PoC (candidates for future iterations, not this build):

- Real authentication, account creation, or multi-household support.
- Budgeting, shopping lists, or financial tracking.
- Gamification: points, streaks, leaderboards, or any workload scoring/comparison.
- Full project-management boards or detailed task breakdowns beyond a single next step.
- Automated analysis of who contributes more ("balance of responsibility" scoring).
- Calendar integration (Google/Outlook/Apple) of any kind.
- Autonomous AI messaging or automatic creation of external commitments/calendar events.
- Communication-preference onboarding (notification timing/tone per person).
- "Seed mental-load map + agree first 3 items" onboarding stage.
- Duplicate-concern detection.
- The full 8-state item lifecycle (only the trimmed 5-state version is built).
- "Suggest a different plan" and "I think this is already handled" ownership-negotiation
  responses (only the core 4 options are built).
- Push notifications of any kind (in-app or external).
- Data export, deletion, retention controls, encryption-at-rest guarantees, or audit history —
  acceptable for a hackathon PoC, but a known gap before any real-world or production use.

---

## 4. Features & Acceptance Criteria

### 4.1 Identity Selection & Onboarding

**Description:** Since there is no real authentication, the demo audience selects which partner
("William" or "Sam") they are acting as in each browser window. Before reaching the main app, a
short, skippable set of household-context questions establishes shared circumstances (e.g.
working patterns, children, pets, home, vehicles).

**Requirement ref:** FR-01

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] On first load, the user is presented with a simple choice of "William" or "Sam" with no
      password or sign-up required.
- [ ] After selecting an identity, the user sees a short sequence of household-context questions
      (4–5 fixed questions) that can be answered with free text or skipped individually.
- [ ] Completing or skipping onboarding leads directly into the main app (shared inbox).
- [ ] Each browser window can independently select a different identity (one as William, one as
      Sam) and both operate against the same shared backend state.

**Usability Criteria:**

- [ ] A first-time user with no explanation can identify which person they are acting as and
      reach the main app within 30 seconds.
- [ ] Skipping onboarding questions is clearly possible and does not feel like an error state.

---

### 4.2 Capture a Concern

**Description:** The core entry point of the product. A user types a single line describing
whatever is on their mind — a worry, a task, a decision — and saves it immediately with no
required categorisation, deadline, or owner.

**Requirement ref:** FR-02

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] The main screen presents a single text field labelled with a prompt equivalent to "What's
      on your mind?"
- [ ] The user can type free text (e.g. "the boiler is making a noise") and save it with a single
      action (button or Enter key).
- [ ] No category, deadline, or owner selection is required before saving.
- [ ] Immediately after capture, the user is asked whether to keep the entry private or share it
      (see 4.3).
- [ ] The saved entry triggers AI structuring (see 4.4) without further user action.

**Usability Criteria:**

- [ ] A user can go from having a thought to it being saved in under 10 seconds, without reading
      instructions.

---

### 4.3 Private / Share Toggle

**Description:** At the point of capture, the user explicitly decides whether the entry stays
private to them or becomes visible to their partner. Nothing is shared by default or silently.

**Requirement ref:** FR-03

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] Every new entry requires an explicit choice: "Keep private" or "Share now."
- [ ] Entries marked private are visible only to the user who created them and do not appear in
      the partner's window or shared inbox.
- [ ] Entries marked shared appear in both users' shared inbox views.
- [ ] There is no mechanism by which a private entry becomes shared without the owning user
      taking an explicit further action.

**Usability Criteria:**

- [ ] The private/share choice is visually unambiguous — a user cannot accidentally share an
      entry without realising it.

---

### 4.4 AI-Assisted Structuring

**Description:** When an entry is captured, the app sends it to an LLM (via the organisation's
Anthropic-compatible endpoint) which proposes a clearer structure: an outcome, a next step, a
suggested date, and a suggested owner. All output is presented as an editable suggestion, never
as a fact, and the raw wording of a concern is never force-shared as the shared title without the
user's consent.

**Requirement ref:** FR-04

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] After capture, the app calls the LLM endpoint and displays, within a few seconds: a
      suggested Outcome, a suggested Next step, a suggested target Date, and a suggested
      Ownership (Me / You / Together / Not agreed).
- [ ] All AI-generated fields are visually labelled as suggestions and are editable by the user
      before being confirmed.
- [ ] If the AI call fails or does not return within a reasonable time (a few seconds), the app
      falls back to a pre-written example structure so the user-facing flow does not break,
      with a subtle visual indicator that this is a fallback.
- [ ] The AI does not infer fault, blame, or relationship judgements, and does not rewrite an
      entry to make it accusatory; sensitive or blunt original wording is not auto-shared as the
      shared item's title without explicit user confirmation.

**Usability Criteria:**

- [ ] A user unfamiliar with the product understands, without explanation, that the AI's
      suggestions can be changed before they are acted on.

---

### 4.5 Ownership Negotiation

**Description:** Once an item is shared, the receiving partner can respond with one of four
lightweight, relationship-aware actions rather than a task being unilaterally "assigned" to them.

**Requirement ref:** FR-05

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] For any shared item awaiting agreement, the receiving partner sees four response options:
      "I'll take this," "Let's do it together," "Can we discuss it?," "Not now."
- [ ] Selecting a response updates the item's ownership state and is visible to both partners.
- [ ] The item's state updates accordingly (e.g. moves from "Needs agreement" to "Agreed/Planned"
      when an ownership response other than "Can we discuss it?" or "Not now" is chosen).
- [ ] Choosing "Can we discuss it?" keeps the item in a needs-agreement state rather than
      resolving ownership.

**Usability Criteria:**

- [ ] A user can respond to a shared item in a single tap/click without needing to open a
      separate assignment form.

---

### 4.6 Shared Inbox

**Description:** A single, calm list view showing all shared items across their lifecycle states,
giving both partners visibility into what's open, what needs agreement, and what's resolved.

**Requirement ref:** FR-06

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] The shared inbox displays all shared items grouped or labelled by state: On my mind
      (private, visible only to the owner), Shared, Needs agreement, Agreed/Planned, Resolved.
- [ ] Private items are visible only in the owning user's own view, never in the partner's inbox.
- [ ] State changes made in one browser window (e.g. an ownership response) are reflected in the
      other window within a short polling interval, without requiring a manual page reload.
- [ ] Each item displays its AI-suggested outcome/next step and current ownership state.

**Usability Criteria:**

- [ ] A user can tell, at a glance, which items need their attention versus which are already
      handled or waiting on the other person.

---

### 4.7 Weekly Check-In (Interactive)

**Description:** A guided, step-through review mode that surfaces what still needs attention,
letting the user act on each item in sequence rather than scanning a static list.

**Requirement ref:** FR-07

**Priority:** Should Have

**Acceptance Criteria:**

- [ ] The user can enter a "Check-in" mode from the main navigation.
- [ ] Check-in presents open items one at a time (e.g. items needing agreement, upcoming actions,
      recently resolved items) with a relevant guiding prompt (e.g. "What needs a decision this
      week?").
- [ ] For each item presented, the user can take an action available to that item's state (e.g.
      respond to an ownership request, mark resolved) without leaving check-in mode.
- [ ] At the end of the sequence, the user sees a simple completion summary (e.g. number of items
      reviewed/resolved).

**Usability Criteria:**

- [ ] A user can complete a full check-in pass across a small number of demo items in under two
      minutes.

---

## 5. Non-Functional Requirements

| ID     | Category      | Requirement                                                                 | Acceptance criterion                                                                 |
| ------ | ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| NFR-01 | Performance   | AI structuring response appears within a few seconds under normal conditions; fallback triggers if it does not | Live demo completes each capture-to-suggestion cycle without an awkward unhandled wait |
| NFR-02 | Reliability   | The demo must not visibly break if the AI endpoint errors, times out, or rate-limits | Fallback canned response is shown automatically; no unhandled error screens appear during the demo |
| NFR-03 | Sync          | State changes in one browser window become visible in the other without manual coordination | Partner-window state (new shares, ownership changes) appears via polling within a short, consistent interval |
| NFR-04 | Deployment    | Must run on a free-tier hosting and data stack suitable for a hackathon PoC | App is deployed and reachable on Vercel free tier with Upstash Redis free tier; no paid infrastructure required |
| NFR-05 | Privacy (PoC-level) | Private entries must never be exposed to the other user through any view or AI output | Manual verification: marking an entry private and confirming it is absent from the partner's window and from any AI-shared text |

**Note:** Production-grade privacy, security, and data-protection requirements (encryption at
rest, UK GDPR/DPA 2018 compliance, retention/export/deletion controls, audit history) are
explicitly out of scope for this PoC and are flagged as required work before any real-world
deployment.

---

## 6. Constraints

- **Timeline:** Must be built and ready to demo by 2pm on 2026-10-22 (hackathon deadline).
- **Budget:** All infrastructure must be free-tier (Vercel hosting, Upstash Redis or equivalent).
- **AI endpoint:** Must use the organisation's existing Anthropic-compatible endpoint
  (pulse.deloitte.com), authenticated via `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL`,
  configured as environment variables in the Vercel project (not committed to source control).
- **No real authentication:** Demo uses mock identity selection only.
- **No provisioned database:** Any persistence must use a zero-setup, free-tier store (Upstash
  Redis), not a traditional provisioned database.
- **Demo mechanic:** The experience must work across two separate browser windows (not a single
  tab with a role switcher), requiring server-side shared state rather than local/client-only
  state.

---

## 7. Data & Integrations

**Key data entities:**
- Item/Entry: text, private/shared status, AI-suggested outcome/next-step/date/owner, current
  state (On my mind / Shared / Needs agreement / Agreed-Planned / Resolved), owning user.
- User: mock identity (William or Sam) and their onboarding household-context answers.
- Shared space: implicit single shared context between the two mock identities (no multi-household
  support needed for this PoC).

**External integrations:**
- Anthropic-compatible LLM API at pulse.deloitte.com (internal org endpoint) for AI structuring of
  captured entries.
- Upstash Redis (or Vercel KV) for shared state storage and polling-based sync between browser
  windows.

**Data sensitivity:** Entries may reference household, family, or personal circumstances. For this
PoC, data is demo-only, ephemeral, and not subject to formal data-protection review; this must be
revisited before any real user data is involved.

---

## 8. UX Requirements Summary

**Mental models and domain language:** The product deliberately avoids task-management language
("assign," "complete," "deadline") in favour of relationship-aware language: "on your mind,"
"shared," "needs agreement," "agreed," "resolved." AI output is always framed as a suggestion, not
an instruction or fact. Resolution is framed as mutual acknowledgement ("Childcare sorted —
William contacted the nursery and Sam confirmed the dates"), not a checkbox tick.

**High-stakes/high-frequency journeys:** Capture → AI structuring → share decision is the
highest-frequency journey and must feel close to instantaneous and effortless. Ownership
negotiation is the most relationship-sensitive journey and must never feel like one partner
"assigning" the other a task.

**Accessibility:** No formal accessibility target (e.g. WCAG level) is in scope for this
hackathon PoC. Standard semantic HTML and reasonable colour contrast via Tailwind/shadcn defaults
is sufficient for the demo; a formal accessibility pass is out of scope.

---

## 9. Sign-off

This document represents the agreed requirements for the project as captured in conversation
with the stakeholder. Before development begins, the stakeholder should review this document
and confirm it accurately reflects what was discussed.

| Role               | Name                           | Status   | Date       |
| ------------------ | ------------------------------ | -------- | ---------- |
| Stakeholder        | [name if provided]             | Confirmed verbally in interview |  2026-10-22 |
| BA / UX Researcher | Requirements Elicitation Skill | Prepared | 2026-10-22 |

---

_This document is the reference for all development, testing, and assurance activity on this
project. Any changes to requirements after sign-off must be captured in an updated version of
this document before implementation begins._
