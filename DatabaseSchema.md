# GrindForge — Database Schema Design

## Database

- **Database:** PostgreSQL
- **ORM:** Prisma

## Database Design Principles

- UUID Primary Keys
- Soft Deletes where required
- Audit Timestamps on every table
- Optimized Indexes
- Scalable Relationships
- No Duplicate Data
- Future Proof Design

---

## Entity Relationship Overview

```
User
  ↓
GroupMembership
  ↓
Group
  ↓
StudySession
  ↓
LearningCheckpoint
  ↓
FeedPost
  ↓
Comments
  ↓
Reactions
```

Users also connect to:

- Challenges
- Notifications
- Warnings
- Party Debts
- Achievements

---

## USERS TABLE

**Purpose:** Stores user accounts and profile information.

**Table:** `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `email` | VARCHAR | UNIQUE NOT NULL |
| `username` | VARCHAR | UNIQUE NOT NULL |
| `full_name` | VARCHAR | |
| `profile_image` | TEXT | |
| `bio` | TEXT | |
| `provider` | ENUM | GOOGLE, EMAIL |
| `forge_score` | INTEGER | DEFAULT 0 |
| `warning_count` | INTEGER | DEFAULT 0 |
| `party_debt_count` | INTEGER | DEFAULT 0 |
| `current_streak` | INTEGER | DEFAULT 0 |
| `best_streak` | INTEGER | DEFAULT 0 |
| `is_public` | BOOLEAN | DEFAULT TRUE |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `last_seen` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Indexes:** `email`, `username`, `forge_score`

---

## USER STATISTICS TABLE

**Purpose:** Separate frequently updated statistics from users table.

**Table:** `user_statistics`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `daily_hours` | INTEGER | |
| `weekly_hours` | INTEGER | |
| `monthly_hours` | INTEGER | |
| `all_time_hours` | INTEGER | |
| `total_sessions` | INTEGER | |
| `completed_goals` | INTEGER | |
| `failed_goals` | INTEGER | |
| `challenges_completed` | INTEGER | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Indexes:** `user_id`

---

## GROUPS TABLE

**Purpose:** Stores all study groups.

**Table:** `groups`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR | |
| `slug` | VARCHAR | UNIQUE |
| `description` | TEXT | |
| `cover_image` | TEXT | |
| `visibility` | ENUM | PUBLIC, PRIVATE |
| `goal_mode` | ENUM | COMMON, PERSONAL, HYBRID |
| `party_mode` | BOOLEAN | |
| `checkpoint_frequency` | INTEGER | |
| `idle_timeout_minutes` | INTEGER | |
| `allow_join_requests` | BOOLEAN | |
| `admin_id` | UUID | FK |
| `member_count` | INTEGER | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Indexes:** `slug`, `visibility`, `admin_id`

---

## GROUP MEMBERS TABLE

**Purpose:** Many-to-many relationship.

**Table:** `group_members`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `group_id` | UUID | FK |
| `user_id` | UUID | FK |
| `role` | ENUM | ADMIN, MODERATOR, MEMBER |
| `status` | ENUM | ACTIVE, PENDING, REMOVED |
| `joined_at` | TIMESTAMP | |

**Indexes:** `group_id`, `user_id`  
**Unique:** `group_id` + `user_id`

---

## GROUP GOALS TABLE

**Purpose:** Stores group target settings.

**Table:** `group_goals`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `group_id` | UUID | FK |
| `goal_type` | ENUM | DAILY, WEEKLY, MONTHLY |
| `target_hours` | INTEGER | |
| `created_by` | UUID | FK |
| `created_at` | TIMESTAMP | |

**Indexes:** `group_id`

---

## USER GOALS TABLE

**Purpose:** Used when personal goals are enabled.

**Table:** `user_goals`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `group_id` | UUID | FK |
| `goal_type` | ENUM | daily, weekly, monthly |
| `target_hours` | INTEGER | |
| `created_at` | TIMESTAMP | |

**Indexes:** `user_id`, `group_id`

---

## STUDY SESSIONS TABLE

**Purpose:** Core table of platform.

**Table:** `study_sessions`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `group_id` | UUID | FK |
| `subject` | VARCHAR | |
| `topic` | VARCHAR | |
| `description` | TEXT | |
| `resource_link` | TEXT | |
| `notion_link` | TEXT | |
| `status` | ENUM | RUNNING, PAUSED, COMPLETED |
| `total_duration_seconds` | INTEGER | |
| `started_at` | TIMESTAMP | |
| `ended_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Indexes:** `user_id`, `group_id`, `status`, `created_at`

---

## SESSION STATES TABLE

**Purpose:** Session recovery system.

**Table:** `session_states`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `session_id` | UUID | FK |
| `last_active_timestamp` | TIMESTAMP | |
| `current_duration_seconds` | INTEGER | |
| `is_active` | BOOLEAN | |
| `last_mouse_activity` | TIMESTAMP | |
| `last_keyboard_activity` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Indexes:** `session_id`

---

## LEARNING CHECKPOINTS TABLE

**Purpose:** Anti-cheat verification.

**Table:** `learning_checkpoints`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `session_id` | UUID | FK |
| `user_id` | UUID | FK |
| `response` | TEXT | |
| `created_at` | TIMESTAMP | |

**Indexes:** `session_id`, `user_id`

---

## WARNINGS TABLE

**Purpose:** Accountability system.

**Table:** `warnings`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `group_id` | UUID | FK |
| `session_id` | UUID | FK |
| `warning_type` | ENUM | IDLE, CHECKPOINT, OTHER |
| `message` | TEXT | |
| `created_at` | TIMESTAMP | |

**Indexes:** `user_id`, `group_id`

---

## PARTY DEBTS TABLE

**Purpose:** Tracks accountability penalties.

**Table:** `party_debts`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `group_id` | UUID | FK |
| `user_id` | UUID | FK |
| `reason` | TEXT | |
| `status` | ENUM | PENDING, COMPLETED |
| `marked_by` | UUID | FK |
| `created_at` | TIMESTAMP | |
| `completed_at` | TIMESTAMP | |

**Indexes:** `user_id`, `group_id`, `status`

---

## FEED POSTS TABLE

**Purpose:** Social learning feed.

**Table:** `feed_posts`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `group_id` | UUID | FK |
| `session_id` | UUID | FK |
| `content` | TEXT | |
| `resource_link` | TEXT | |
| `notion_link` | TEXT | |
| `visibility` | ENUM | PUBLIC, GROUP |
| `likes_count` | INTEGER | |
| `comments_count` | INTEGER | |
| `created_at` | TIMESTAMP | |

**Indexes:** `group_id`, `user_id`, `created_at`

---

## COMMENTS TABLE

**Purpose:** Post discussions.

**Table:** `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `post_id` | UUID | FK |
| `user_id` | UUID | FK |
| `content` | TEXT | |
| `created_at` | TIMESTAMP | |

**Indexes:** `post_id`

---

## REACTIONS TABLE

**Purpose:** Post engagement.

**Table:** `reactions`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `post_id` | UUID | FK |
| `user_id` | UUID | FK |
| `reaction_type` | ENUM | LIKE, FIRE, CLAP |
| `created_at` | TIMESTAMP | |

**Unique:** `post_id` + `user_id`

---

## CHALLENGES TABLE

**Purpose:** Platform-wide challenges.

**Table:** `challenges`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `title` | VARCHAR | |
| `description` | TEXT | |
| `challenge_type` | ENUM | HOURS, STREAK, CUSTOM |
| `goal_value` | INTEGER | |
| `duration_days` | INTEGER | |
| `is_public` | BOOLEAN | |
| `created_by` | UUID | FK |
| `created_at` | TIMESTAMP | |

**Indexes:** `created_by`

---

## CHALLENGE PARTICIPANTS TABLE

**Purpose:** Challenge progress tracking.

**Table:** `challenge_participants`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `challenge_id` | UUID | FK |
| `user_id` | UUID | FK |
| `progress` | INTEGER | |
| `joined_at` | TIMESTAMP | |

**Indexes:** `challenge_id`, `user_id`  
**Unique:** `challenge_id` + `user_id`

---

## ACHIEVEMENTS TABLE

**Purpose:** Platform badges.

**Table:** `achievements`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR | |
| `description` | TEXT | |
| `icon` | TEXT | |
| `created_at` | TIMESTAMP | |

---

## USER ACHIEVEMENTS TABLE

**Purpose:** Achievement unlock tracking.

**Table:** `user_achievements`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `achievement_id` | UUID | FK |
| `earned_at` | TIMESTAMP | |

**Indexes:** `user_id`, `achievement_id`

---

## NOTIFICATIONS TABLE

**Purpose:** User notifications.

**Table:** `notifications`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `title` | VARCHAR | |
| `message` | TEXT | |
| `type` | VARCHAR | |
| `is_read` | BOOLEAN | |
| `created_at` | TIMESTAMP | |

**Indexes:** `user_id`, `is_read`

---

## JOIN REQUESTS TABLE

**Purpose:** Private group access.

**Table:** `join_requests`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `group_id` | UUID | FK |
| `user_id` | UUID | FK |
| `status` | ENUM | PENDING, APPROVED, REJECTED |
| `created_at` | TIMESTAMP | |

**Indexes:** `group_id`, `user_id`

---

## SYSTEM SETTINGS TABLE

**Purpose:** Global configuration.

**Table:** `system_settings`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `key` | VARCHAR | UNIQUE |
| `value` | TEXT | |
| `updated_at` | TIMESTAMP | |

---

## Important Database Rules

| Rule | Description |
|------|-------------|
| **Rule 1** | A user can belong to unlimited groups. |
| **Rule 2** | A group can contain unlimited members. |
| **Rule 3** | Only one active study session can run per user at any time. Enforce at application level. |
| **Rule 4** | Deleting a group must not delete user accounts. Use cascading carefully. |
| **Rule 5** | Study session history must never be lost. Soft delete only. |
| **Rule 6** | Feed posts linked to sessions must remain available even after session completion. |
| **Rule 7** | All timestamps stored in UTC. |
| **Rule 8** | Every table must include `created_at` and `updated_at`. |

---

## Database Completion Checklist

- [ ] Users
- [ ] Groups
- [ ] Memberships
- [ ] Goals
- [ ] Study Sessions
- [ ] Session Recovery
- [ ] Checkpoints
- [ ] Warnings
- [ ] Party Debts
- [ ] Feed
- [ ] Comments
- [ ] Reactions
- [ ] Challenges
- [ ] Achievements
- [ ] Notifications
- [ ] Join Requests
- [ ] Indexes
- [ ] Constraints

> Database schema is considered complete only when every relationship and constraint above is implemented and tested.
