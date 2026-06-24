# GrindForge — Project Understanding

> **Purpose of this document:** A consolidated mental model of GrindForge for anyone building, reviewing, or onboarding to the project. Read this before writing code.

---

## 1. What GrindForge Is

**GrindForge is a social accountability learning platform.**

It helps learners — students, placement candidates, UPSC/GATE aspirants, developers, and self-learners — stay consistent with learning goals through **transparency, accountability, social motivation, challenges, progress tracking, and community learning**.

### What GrindForge Is NOT

| Not This | Why |
|----------|-----|
| Pomodoro app | Focus is accountability and community, not timed intervals |
| Study timer only | Timers are one input; social visibility and consequences matter more |
| Task manager | Goals and sessions exist, but the product is about *accountability*, not todos |

### Core Thesis

> People achieve more when their learning progress is visible to others and when they are accountable to a group.

---

## 2. Problem Being Solved

Most learners:

- Start motivated, lose consistency within days
- Study alone with no accountability
- Cannot track long-term progress or revision
- Have no consequences for missing goals
- Forget what they learned

Existing study apps track **time**. GrindForge tracks time **and** enforces **accountability** through groups, visibility, warnings, leaderboards, challenges, and optional party penalties.

---

## 3. Product Pillars

GrindForge combines five systems:

```
Study Tracking  +  Social Learning  +  Community Growth
        +  Accountability Systems  +  Gamification
```

| Pillar | Mechanism |
|--------|-----------|
| Study Tracking | Sessions, hours, learning logs |
| Social Learning | Groups, feed, comments, reactions |
| Community Growth | Public groups, challenges, profiles |
| Accountability | Goals, warnings, checkpoints, idle detection, party mode |
| Gamification | Forge Score, streaks, leaderboards, achievements |

---

## 4. Target Users

**Primary:** College students, placement prep, UPSC/GATE aspirants, software engineers, self-learners

**Secondary:** Coding communities, study clubs, learning groups

---

## 5. User Roles & Permissions

### Guest
- **Can:** View public groups, profiles, challenges
- **Cannot:** Study, join private groups, create content

### Member
- **Can:** Join groups, study, track progress, create posts, join challenges

### Admin (per group)
- **Can:** Create/manage groups, approve requests, configure goals/warnings/checkpoints, enable/disable party mode

---

## 6. Group System

- Users can join **multiple groups**
- Groups support **unlimited members**

| Type | Visibility | Access |
|------|------------|--------|
| **Public** | Visible to everyone | Anyone can request access |
| **Private** | Hidden | Invite-based, admin approval required |

---

## 7. Goal System

Admin selects goal mode per group:

| Mode | Description | Example |
|------|-------------|---------|
| **A — Common** | Same target for everyone | 30 hours/week for all |
| **B — Personal** | Each user sets own target | User A: 20h, User B: 40h |
| **C — Hybrid** | Admin sets minimum; users can go higher | Min 20h/week, user chooses 30h |

**Cadences:** Daily, Weekly, Monthly

---

## 8. Study Session System

### Session Fields
- Subject, Topic, Description
- Resource Link, Notion Link, Tags

### Session States
`Running` → `Paused` → `Completed`

### Actions
Start, Pause, Resume, Stop

### Critical Rule
> A user may create unlimited sessions but may only have **ONE active running session** at a time. Never allow multiple concurrent timers.

### Session Recovery (Critical)
Study progress must survive:
- Page refresh
- Logout / re-login
- Browser restart
- Internet reconnect
- Temporary server failure

Session state must **persist** and **recover** reliably.

---

## 9. Learning Logs

When a session ends, the user records:
- What was learned
- Key concepts
- Notes
- Revision links
- Resources

This data is **permanently stored** and can feed the study feed.

---

## 10. Checkpoint System (Anti-Cheat)

**Purpose:** Prevent fake studying.

- Admin sets interval (e.g., every 30 min, 1h, 2h)
- Popup: *"What did you learn?"*
- Response is stored
- Failure → warning

---

## 11. Idle Detection System

Tracks: mouse movement, keyboard activity, window focus

| Trigger | Action |
|---------|--------|
| 10 min inactive | Popup: *"Are you still studying?"* |
| 30 sec no response | Pause timer, generate warning, notify group |

---

## 12. Warning System

Warnings are **visible** and **permanently stored**.

| Type | Cause |
|------|-------|
| Idle Warning | No response to idle popup |
| Checkpoint Warning | Failed checkpoint |
| Manual Warning | Admin-issued |

Warnings **reduce Forge Score**.

---

## 13. Party Mode

- Admin-controlled (on/off per group)
- Users who fail goals receive **party debt**
- Tracks: debts, history, completion status
- Adds social/financial accountability beyond warnings

---

## 14. Dashboard (User Home)

Must display:
- Daily / Weekly / Monthly / All-Time hours
- Current goals and progress
- Active session
- Forge Score
- Streaks
- Challenges

**Performance target:** Dashboard loads in **< 2 seconds**

---

## 15. Study Feed

Completed sessions can create feed posts containing:
- Study summary, resources, revision links, learning notes

Users can **like, comment, react** — a learning timeline, not a generic social feed.

---

## 16. Leaderboards

**Hours:** Daily, Weekly, Monthly, All-Time

**Forge Score:** Community ranking, accountability ranking

**Performance target:** Leaderboard loads in **< 1 second**

---

## 17. Forge Score

Forge Score is **separate from study hours**.

| Metric | Measures |
|--------|----------|
| **Hours** | Effort / time invested |
| **Forge Score** | Consistency, goal completion, challenge participation, feed contributions, community engagement |

Warnings reduce Forge Score.

---

## 18. Challenges

Platform-wide challenges (e.g., Striver 45-Day, 100-Hour DSA, GATE Challenge)

Features: progress tracking, rules, deadlines, leaderboards

---

## 19. User Profile

- Username, bio, profile image
- Study hours, Forge Score
- Achievements, streaks
- Joined groups, challenges
- Activity feed

---

## 20. Notifications

**Phase 1 — In-app:** Goal completion/failure, warnings, comments, reactions, join requests

**Phase 2 — External:** WhatsApp, email

---

## 21. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js / NextAuth |
| Realtime | Socket.IO |
| Storage | Cloudinary |
| Deployment | Vercel |
| Analytics | PostHog |
| Monitoring | Sentry |

---

## 22. Architecture Principles

**Follow:**
- Clean Architecture
- Feature-based folder structure
- Reusable components
- Separation of concerns
- End-to-end type safety

**Avoid:**
- God components
- Duplicated logic
- Hardcoded values
- Tight coupling

---

## 23. Database Principles

- PostgreSQL + Prisma
- UUIDs for primary keys
- Normalized schema, no unnecessary duplication
- Designed for scale (millions of records)
- All timestamps in **UTC**

---

## 24. Security Requirements

| Requirement | Notes |
|-------------|-------|
| Authentication | Auth.js / NextAuth |
| Authorization | Role-based (Guest, Member, Admin) |
| RBAC | Per-group and platform-level |
| Rate limiting | API protection |
| Input validation | All user input |
| XSS / SQL injection prevention | Framework + Prisma defaults |
| Secure sessions | No secret exposure |

---

## 25. Performance Requirements

| Surface | Target |
|---------|--------|
| Dashboard | < 2s |
| Leaderboard | < 1s |
| Queries | Optimized, paginated, no N+1 |
| Loading | Caching, lazy loading where appropriate |

---

## 26. Development Workflow

### Before implementing any feature, read:

1. `PRD.md` — Product requirements
2. `TRD.md` — Technical requirements
3. `AppFlow.md` — User flows and screens
4. `DatabaseSchema.md` — Data model
5. `ImplementationPlan.md` — Phased rollout
6. `Tracker.md` — Task status
7. `RULES.md` — Coding and process rules
8. `DESIGN.md` — Visual identity, layout, and UI reference

### Implementation order
- Follow phases strictly
- Never skip dependencies
- Never build future-phase features early

### Task completion criteria
A task is done only when:
- [ ] Code implemented
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Feature tested
- [ ] `Tracker.md` updated

---

## 27. High-Level System Map

```
┌─────────────────────────────────────────────────────────────┐
│                        GrindForge                           │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Identity   │    Groups    │   Sessions   │  Accountability│
│  Auth/RBAC   │ Public/Priv  │ Timer/Logs   │ Goals/Warnings │
├──────────────┼──────────────┼──────────────┼────────────────┤
│   Social     │ Gamification │  Realtime    │   Platform     │
│ Feed/Notify  │ Score/Streak │  Socket.IO   │ Challenges     │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                    PostgreSQL (Prisma)
```

---

## 28. Critical Business Rules (Non-Negotiable)

1. **One active session per user** — never two running timers
2. **Session recovery** — progress must never be lost on refresh/disconnect
3. **Forge Score ≠ Hours** — separate metrics, separate leaderboards
4. **Warnings are permanent and visible** — accountability requires history
5. **Checkpoints + idle detection** — integrity of study time
6. **UTC everywhere** — all timestamps
7. **No mock/placeholder logic** in production paths unless explicitly requested

---

## 29. Key User Journeys

### Journey A: New Member Joins a Group
1. Discover public group or receive invite
2. Request / accept membership
3. Admin approves (if required)
4. See group goals and members
5. Start first study session

### Journey B: Study Session Lifecycle
1. Create session (subject, topic, etc.)
2. Start timer (only if no other active session)
3. Idle/checkpoint popups during study
4. Pause / resume as needed
5. Stop → learning log → optional feed post
6. Hours and Forge Score update

### Journey C: Accountability Event
1. User misses goal / fails checkpoint / goes idle
2. Warning generated and stored
3. Group notified (if configured)
4. Forge Score reduced
5. Party debt assigned (if party mode on)

---

## 30. What Success Looks Like

GrindForge succeeds when:

- Learners **return daily** because their group sees their progress
- Study hours reflect **real effort** (checkpoints + idle detection)
- Groups **self-regulate** through visibility and consequences
- The platform scales to **many groups and millions of records** without degrading UX
- Every feature reinforces the core idea: **accountability through social learning**

---

## 31. Current Project State

| Item | Status |
|------|--------|
| Repository | Initialized (greenfield) |
| Application code | Not yet started |
| Documentation | Complete — `PRD.md`, `TRD.md`, `AppFlow.md`, `DatabaseSchema.md`, `ImplementationPlan.md`, `Tracker.md`, `RULES.md`, `DESIGN.md` |
| This document (`understand.md`) | Living synthesis of project vision and constraints |

---

## 32. Guiding Principle for All Implementation

> Build a **real public platform**, not a prototype. Every decision must align with social accountability learning — correctness, maintainability, scalability, security, and clean architecture over speed.

---

*Last updated: June 2025 — synthesized from master project context and product vision. PDF documentation converted to Markdown.*
