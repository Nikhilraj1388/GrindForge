# GrindForge — Technical Requirements Document (TRD)

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | GrindForge |
| **Project Type** | Full Stack Web Application |
| **Architecture Style** | Modern Client-Server Architecture |

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI

### Backend

- Next.js API Routes
- Server Actions

### Database

- PostgreSQL

### ORM

- Prisma

### Authentication

- NextAuth/Auth.js

### Realtime

- Socket.IO

### File Storage

- Cloudinary

### Deployment

- Vercel
- Neon PostgreSQL

### Analytics

- PostHog

### Monitoring

- Sentry

---

## 2. Technical Goals

The system must:

- Support thousands of users
- Support real-time study tracking
- Support live leaderboards
- Support group-based permissions
- Persist study sessions permanently
- Maintain historical records
- Be mobile responsive
- Be secure and scalable

---

## 3. System Architecture

### Frontend Layer

**Responsibilities:**

- User Interface
- Form Validation
- Realtime Updates
- State Management

### Backend Layer

**Responsibilities:**

- Authentication
- Authorization
- Business Logic
- Goal Calculations
- Leaderboards
- Session Management

### Database Layer

**Responsibilities:**

- Persistent Storage
- Query Optimization
- Historical Tracking

---

## 4. Technology Stack

### Frontend

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- Shadcn UI
- React Hook Form
- Zod

### Backend

- Next.js Server Actions
- REST API
- Socket.IO

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- Google OAuth
- Email Authentication
- JWT Session Management

### Storage

- Cloudinary

### Notifications

**Phase 1:** In-App Notifications  
**Phase 2:** WhatsApp API, Email Service

---

## 5. Folder Structure

```
/src
  /app
    /(auth)
    /dashboard
    /groups
    /profile
    /challenges
    /settings
  /components
    /ui
    /dashboard
    /groups
    /profile
    /feed
    /challenges
  /lib
    /auth
    /db
    /socket
    /utils
  /actions
    /auth
    /groups
    /study
    /profile
  /prisma
    schema.prisma
  /types
  /hooks
```

---

## 6. Database Design

### Users

**Fields:** `id`, `name`, `username`, `email`, `image`, `bio`, `forge_score`, `daily_hours`, `weekly_hours`, `monthly_hours`, `all_time_hours`, `current_streak`, `best_streak`, `warning_count`, `created_at`, `updated_at`

### Groups

**Fields:** `id`, `name`, `description`, `visibility` (public/private), `goal_mode` (common/personal/hybrid), `party_mode` (true/false), `admin_id`, `created_at`

### Group Members

**Fields:** `id`, `group_id`, `user_id`, `role` (admin/member), `joined_at`

### Group Goals

**Fields:** `id`, `group_id`, `goal_type` (daily/weekly/monthly), `goal_value`, `created_at`

### Study Sessions

**Fields:** `id`, `user_id`, `group_id`, `subject`, `topic`, `description`, `resource_link`, `notion_link`, `status` (running/paused/completed), `duration_seconds`, `started_at`, `paused_at`, `ended_at`, `created_at`

### Study Checkpoints

**Fields:** `id`, `session_id`, `response`, `created_at`

### Warnings

**Fields:** `id`, `user_id`, `group_id`, `warning_type` (idle/checkpoint/other), `message`, `created_at`

### Party Debts

**Fields:** `id`, `group_id`, `user_id`, `reason`, `status` (pending/completed), `created_at`

### Feed Posts

**Fields:** `id`, `user_id`, `group_id`, `content`, `resource_link`, `notion_link`, `likes_count`, `comments_count`, `created_at`

### Comments

**Fields:** `id`, `post_id`, `user_id`, `content`, `created_at`

### Reactions

**Fields:** `id`, `post_id`, `user_id`, `reaction_type`, `created_at`

### Challenges

**Fields:** `id`, `title`, `description`, `goal`, `duration_days`, `created_at`

### Challenge Participants

**Fields:** `id`, `challenge_id`, `user_id`, `progress`, `created_at`

### Notifications

**Fields:** `id`, `user_id`, `title`, `message`, `read`, `created_at`

---

## 7. Authentication Requirements

### Supported Providers

- Google OAuth
- Email Authentication

### Requirements

- Email Verification
- Secure Sessions
- Password Hashing
- Protected Routes
- Role-Based Access

---

## 8. Authorization Rules

| Role | Permissions |
|------|-------------|
| **Guest** | Read Public Content |
| **Member** | Create Sessions, Join Groups, Create Posts |
| **Admin** | Manage Members, Manage Goals, Manage Group Settings, Enable Party Mode, Remove Users |

---

## 9. Realtime Requirements

### Socket Events

- `user_online`
- `user_offline`
- `session_started`
- `session_paused`
- `session_resumed`
- `session_completed`
- `warning_created`
- `goal_completed`
- `leaderboard_updated`
- `notification_created`
- `challenge_updated`

---

## 10. Study Timer Logic

### Requirements

- Start Timer
- Pause Timer
- Resume Timer
- Stop Timer
- Persist State
- Recover State
- Auto Save Every 30 Seconds
- Database Sync
- Recovery After Refresh
- Recovery After Logout
- Recovery After Server Restart

---

## 11. Idle Detection Logic

### Track

- Mouse Movement
- Keyboard Input
- Window Focus

### Rules

1. No Activity 10 Minutes → Show Popup
2. 30 Second Countdown
3. No Response → Pause Timer, Create Warning, Broadcast Warning

---

## 12. Leaderboard Logic

### Hours Leaderboard

Sort by: `daily_hours`, `weekly_hours`, `monthly_hours`, `all_time_hours`

### Forge Leaderboard

Sort by: `forge_score`

Realtime Updates Required.

---

## 13. Forge Score Engine

### Inputs

- Study Hours
- Goal Completion
- Streaks
- Challenge Participation
- Feed Contributions
- Checkpoint Responses

### Penalties

- Warnings
- Missed Checkpoints

> Future formula must be configurable. Store formula separately. Do not hardcode.

---

## 14. Search Requirements

- Users Search
- Groups Search
- Challenges Search
- Pagination Required
- Debounced Search

---

## 15. Performance Requirements

| Surface | Target |
|---------|--------|
| Dashboard Load | < 2 seconds |
| Leaderboard Load | < 1 second |
| Profile Load | < 2 seconds |
| Database Queries | Optimized, Indexed |

---

## 16. Security Requirements

- JWT
- HTTPS
- CSRF Protection
- Rate Limiting
- Input Validation
- SQL Injection Prevention
- XSS Prevention
- Role Based Access Control
- Audit Logging

---

## 17. API Requirements

### Auth APIs

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`

### Groups APIs

- `POST /groups`
- `GET /groups`
- `GET /groups/:id`
- `PATCH /groups/:id`
- `DELETE /groups/:id`

### Study APIs

- `POST /sessions`
- `PATCH /sessions/pause`
- `PATCH /sessions/resume`
- `PATCH /sessions/stop`
- `GET /sessions`

### Feed APIs

- `POST /posts`
- `GET /posts`
- `POST /comments`
- `POST /reactions`

### Challenge APIs

- `POST /challenges`
- `GET /challenges`
- `POST /join`

### Leaderboard APIs

- `GET /leaderboards/hours`
- `GET /leaderboards/forge`

---

## 18. Testing Requirements

- Unit Tests
- Integration Tests
- Authentication Tests
- Group Tests
- Timer Tests
- Leaderboard Tests
- Notification Tests
- Idle Detection Tests
- API Tests

---

## 19. Deployment Requirements

- Environment Variables
- Database Migration Pipeline
- CI/CD
- Error Monitoring
- Analytics Tracking
- Production Logging
- Automatic Backups

---

## 20. Technical Completion Checklist

- [ ] Authentication
- [ ] Database
- [ ] Groups
- [ ] Goals
- [ ] Study Sessions
- [ ] Realtime System
- [ ] Idle Detection
- [ ] Warnings
- [ ] Feed
- [ ] Leaderboards
- [ ] Profiles
- [ ] Challenges
- [ ] Notifications
- [ ] Security
- [ ] Testing
- [ ] Deployment

> Project is considered technically complete only when every checkbox is marked complete.
