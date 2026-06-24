# GrindForge — Design Philosophy (DESIGN.md)

> **Purpose:** Visual and UX source of truth for all GrindForge UI. Every screen must reinforce social accountability, competitive motivation, and the **"Digital Forge"** identity.

---

## Design Philosophy

### GrindForge must NOT look like

- ❌ A school LMS
- ❌ An admin dashboard
- ❌ A generic productivity app
- ❌ A cloned SaaS template
- ❌ A Notion clone
- ❌ A boring AI-generated dashboard

### GrindForge should feel like

- 🔥 A place where ambitious people gather
- 🔥 A place where progress is visible
- 🔥 A forge where skills are built
- 🔥 A competitive learning community
- 🔥 A living ecosystem

---

## Core Design Concept

**Theme:** *The Digital Forge*

Users are forging:

- Skills
- Knowledge
- Discipline
- Consistency

Every design decision should reinforce that feeling.

---

## Emotional Experience

| Moment | User should feel |
|--------|------------------|
| Opening the app | *"I need to continue my grind."* |
| Seeing the leaderboard | *"I need to catch up."* |
| Seeing friends studying | *"I should start studying too."* |
| Reaching goals | *"I earned this."* |
| Missing goals | *"I need to improve."* |

---

## Visual Identity

### Design Style

- Modern
- Premium
- Minimal
- Dark
- Competitive
- Focused
- Community Driven

### Avoid

- Playful cartoon design
- Corporate design
- Overly colorful design
- Heavy gradients
- Random glassmorphism everywhere
- Excessive animations

### Design Inspiration

Combine influences (do **not** copy any of them):

| Source | Weight |
|--------|--------|
| Discord | 40% |
| GitHub | 25% |
| Linear | 20% |
| Duolingo | 15% |

**Create a unique GrindForge identity.**

---

## Core Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary Background** | `#0B0F19` | Main app background |
| **Secondary Background** | `#111827` | Page sections, sidebars |
| **Card Background** | `#1A2234` | Cards, panels, widgets |
| **Border** | `#2A3447` | Card borders, dividers |
| **Forge Orange** | `#F97316` | Primary CTA, progress, achievements, highlights |
| **Success** | `#22C55E` | Positive trends, active status, online |
| **Warning** | `#FACC15` | Warnings, caution states |
| **Danger** | `#EF4444` | Errors, critical alerts |
| **Text Primary** | `#F8FAFC` | Headings, primary content |
| **Text Secondary** | `#94A3B8` | Labels, captions, metadata |

### Color Usage Rules

- **Forge Orange** is the hero accent — progress bars, primary buttons, active nav, streak flames
- Use **Success Green** sparingly for positive deltas (+1.2h, Active badges, online dots)
- Keep backgrounds layered: page → section → card (darkest to slightly lighter)
- Never use bright white backgrounds or light mode in MVP

---

## Brand Language

### Never use

- Tasks
- Assignments
- Lessons
- Students
- Classes

### Prefer

- Forge
- Progress
- Grind
- Session
- Challenge
- Guild
- Streak
- Milestone
- Achievement
- Hours Forged

---

## Typography

| Setting | Value |
|---------|-------|
| **Primary Font** | Inter |
| **Fallback** | System Sans |
| **Weights** | 600, 700 |
| **Hero only** | 800 (sparingly) |

Avoid excessive boldness. Use weight and size for hierarchy, not bold everywhere.

---

## Layout System

### Desktop — Three Column Layout

```
| Navigation | Content | Activity |
```

| Column | Role |
|--------|------|
| **LEFT** | Navigation (fixed sidebar) |
| **CENTER** | Main content |
| **RIGHT** | Live activity |

This creates a **community feeling** — the user is never alone on the dashboard.

### Mobile

- Bottom navigation: Dashboard, Study, Groups, Feed, Profile
- **Start Forge** button remains floating — always accessible

---

## Sidebar Design

### Left Sidebar (Fixed)

**Top — Navigation**

- Logo (GrindForge + flame icon)
- Dashboard
- Study
- Groups
- Challenges
- Leaderboard
- Feed
- Notifications (badge when unread)
- Resources
- Settings

**Bottom — User Card**

- Avatar + name
- Forge Score
- Current Streak (flame icon)
- **Start Forge** CTA button (orange, full-width or prominent)

### The Forge Button (Global CTA)

| Property | Value |
|----------|-------|
| **Visibility** | Global — accessible from every screen |
| **Style** | Floating or fixed in sidebar bottom |
| **Position** | Bottom right (floating) or sidebar bottom (dashboard) |
| **Label** | `⚒️ Start Forge` |

**Never use:** Start Timer · Begin Session · Study Now

The platform language matters.

---

## Dashboard Design

> **Most important screen.** This is the reference layout for the entire product.

### Reference Mockup

The dashboard must match the approved high-fidelity mockup:

- Dark charcoal background with orange accent system
- Three-column layout: nav | content | live activity
- Hero weekly goal card with blacksmith/forge illustration
- Stats grid, resume session, streak ring, groups row, leaderboard + friends
- Right panel: Live Activity feed + Upcoming Challenges

![GrindForge Dashboard Reference](../assets/dashboard-reference.png)

### Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo] GrindForge          Good Evening, Nikhil!        [🔔] [Search] │
├──────────┬──────────────────────────────────────────────┬───────────────┤
│          │  ┌─ Weekly Goal: 18/30 Hours ─────────────┐  │ Live Activity │
│ Dashboard│  │  ████████████░░░░  + blacksmith art    │  │ 🟢 Amit DSA   │
│ Study    │  └──────────────────────────────────────┘  │ 🟢 Rahul React│
│ Groups   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │ ...           │
│ ...      │  │Today│ │Week│ │Month│ │Score│             ├───────────────┤
│          │  └────┘ └────┘ └────┘ └────┘               │ Upcoming      │
│          │  ┌─ Resume Session: Binary Search ────────┐  │ Challenges    │
│          │  │ 01:42:15  [▶]  LeetCode Notes Link   │  │ Striver 45    │
│          │  └──────────────────────────────────────┘  │ 100hr DSA     │
│ ──────── │  ┌─ Streak ─┐  ┌─ Your Groups ─────────┐  │               │
│ Nikhil   │  │ 14 days  │  │ Placement Warriors ... │  │               │
│ Score    │  └──────────┘  └────────────────────────┘  │               │
│ Streak   │  ┌─ Leaderboard ─┐ ┌─ Friends Online ───┐  │               │
│ [Start   │  │ 🥇 Amit 32h   │ │ 🟢 Priya DSA      │  │               │
│  Forge]  │  └───────────────┘ └────────────────────┘  │               │
└──────────┴──────────────────────────────────────────────┴───────────────┘
```

### Header

- Personalized greeting: *"Good Evening, {name}!"*
- Motivational subtitle: *"Small progress everyday leads to big results."*
- Centered or right-aligned search bar
- Notification bell (top right)

### Hero Section (Top)

Large card showing:

- Weekly Goal (e.g. **18 / 30 Hours**)
- Thick orange progress bar
- Hours remaining
- Optional: blacksmith-at-anvil illustration (sparks, forge theme)
- Current Streak + Forge Score can appear in hero or adjacent tiles

**Example:**

```
Weekly Goal
18 / 30 Hours
██████████░░░░░░
12 Hours Remaining
```

### Statistics Grid (Middle)

Four compact stat cards in a row:

| Card | Content |
|------|---------|
| **Today's Hours** | e.g. 4h 32m, green delta (+1.2h) |
| **Weekly Hours** | e.g. 18h 20m, % of goal |
| **Monthly Hours** | e.g. 72h 45m, trend |
| **Forge Score** | e.g. 1,245, rank context (Top 7%) |

### Resume Session Card

When an active/paused session exists:

- Subject + topic (e.g. *Binary Search* · *Data Structures and Algorithms*)
- Large timer display (e.g. `01:42:15`)
- Play/pause control
- Quick links: LeetCode, Notes, Revision Link

### Current Streak Card

- Circular progress ring with day count (e.g. **14 days**)
- Mini bar chart: activity per weekday (M–S)

### Your Groups Row

Horizontal scroll or grid of group cards:

- Group name, member count
- **Active** badge (green)
- Tag chips (e.g. DSA, Placement)

### Bottom Row

**Leaderboard (left)** — Top users this week with hours  
**Friends Online (right)** — Status dot (green/orange/grey) + current activity

### Live Activity Panel (Right Sidebar)

Always visible on desktop. Shows:

- Friends currently studying (name, subject, duration)
- Live sessions
- Warnings
- Goal completions
- Challenge updates

**Example:**

```
🟢 Amit    Studying DSA     1h 42m
🟢 Rahul   Studying React   42m
```

This panel must **feel alive** — real-time or near-real-time updates.

### Upcoming Challenges (Right Sidebar, below activity)

- Challenge title, days remaining, participant count
- Orange progress bar for time elapsed
- Examples: Striver 45 Day Challenge, 100 Hour DSA Challenge

---

## Dashboard Cards

### Card Style

- Rounded XL (`border-radius: 12–16px`)
- Subtle border (`#2A3447`)
- Card background `#1A2234`
- Soft hover state (slight border or background lift)
- **No heavy shadows**

### Standard Dashboard Cards

- Today's Hours
- Weekly Hours
- Monthly Hours
- Current Streak
- Warnings
- Forge Score
- Party Status

---

## Study Session Screen

> **Second most important screen.** Minimal UI. No distractions.

### Center Layout

```
        DSA
   Binary Search

     02:34:18

   [ Pause ]  [ Stop ]
```

### Below Timer

- Session Notes
- Checkpoint History
- Resources
- Notion Links

---

## Group Design

Do **not** build standard group pages. Groups should feel like **guilds**.

### Layout

```
| Channels (left) | Feed (center) | Members (right) |
```

### Channels

- `#feed`
- `#leaderboard`
- `#resources`
- `#challenges`
- `#party-mode`

Feels like a study Discord server.

---

## Feed Design

Inspired by GitHub Activity + LinkedIn Posts.

### Card Example

```
Nikhil · Forged 2h 30m
Topic: Binary Search

Key Learnings
• Lower Bound
• Upper Bound

Resources · Notion Link

🔥 12   💬 4
```

- No endless scrolling
- Prioritize **quality over quantity**

---

## Leaderboards

Avoid plain tables. Use **ranking cards**.

### Example

```
🥇 Amit    32 Hours   14 Day Streak
🥈 Nikhil  29 Hours   11 Day Streak
🥉 Rahul   24 Hours    7 Day Streak
```

Feels competitive, not corporate.

---

## Profile Design

Inspired by GitHub.

| Section | Content |
|---------|---------|
| **Top** | Profile, statistics, achievements |
| **Middle** | Contribution heatmap |
| **Bottom** | Activity timeline |

### Signature Feature: Forge Heatmap

- Every study day creates activity
- Green scale — more hours = darker cells
- Users should instantly recognize this as *theirs*

---

## Achievement Design

Achievements should look **forged** — metal badge style.

| Tier | Style |
|------|-------|
| Bronze | Entry milestones |
| Silver | Consistency |
| Gold | Major goals |
| Platinum | Elite grind |
| Obsidian | Legendary |

**Not** childish badges.

---

## Party Mode Design

Fun but mature.

### Party Debt Board

- 🍕 Pending
- 🍕 Completed
- 🍕 History

Never make it look like punishment. Make it feel **social**.

---

## Animation Rules

### Allowed

- Hover states
- Card elevation (subtle)
- Progress bar fill animations
- Number counters

### Style

- Fast
- Subtle
- Purposeful

### Avoid

- Long animations
- Bouncy effects
- Distracting motion

---

## UX Rules

| Action | Target |
|--------|--------|
| Start study session | Within **3 seconds** |
| See remaining weekly hours | Within **2 seconds** |
| See active friends | Within **2 seconds** |
| View leaderboard | Within **1 click** |
| Join challenge | Within **2 clicks** |

---

## Golden Design Rule

Every screen should answer one question:

> **"Am I progressing faster or slower than the people around me?"**

If a UI element does not help **motivation**, **accountability**, **learning**, or **community** — **remove it**.

---

## Summary

GrindForge is **not** a productivity tool.

It is a **social accountability ecosystem** for ambitious learners — a digital forge where progress is visible, competition is healthy, and every pixel reinforces the grind.

---

## Implementation Checklist (Dashboard MVP)

Use this when building Phase 6 (Dashboard):

- [ ] Three-column layout (nav | content | activity)
- [ ] Dark theme with brand color tokens
- [ ] Left sidebar with nav + user card + Start Forge
- [ ] Header with greeting, quote, search, notifications
- [ ] Hero weekly goal card with progress bar
- [ ] Four stat tiles (today, week, month, forge score)
- [ ] Resume session card with timer + quick links
- [ ] Streak card with ring + weekday chart
- [ ] Your Groups horizontal section
- [ ] Leaderboard + Friends Online row
- [ ] Live Activity right panel
- [ ] Upcoming Challenges right panel
- [ ] Inter font, rounded XL cards, subtle borders
- [ ] Orange CTA: "Start Forge" (never "Start Timer")
