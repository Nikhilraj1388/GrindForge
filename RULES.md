# GrindForge — RULES

## Purpose

This file contains **mandatory rules** that all AI coding agents must follow.

**Applies To:**

- Cursor
- Claude Code
- Windsurf
- GitHub Copilot
- Any future AI agent

> Failure to follow these rules is considered a project violation.

---

## 1. SOURCE OF TRUTH

Always read before making changes:

1. `PRD.md`
2. `TRD.md`
3. `AppFlow.md`
4. `DatabaseSchema.md`
5. `ImplementationPlan.md`
6. `Tracker.md`
7. `RULES.md`
8. `DESIGN.md`

Never make assumptions without consulting these files.

---

## 2. IMPLEMENTATION ORDER

**Mandatory.**

Features must be implemented in the order defined in `ImplementationPlan.md`.

- Do NOT skip phases.
- Do NOT implement future phases early.
- Do NOT build advanced features before foundational features.

**Example:**

- ❌ Build Challenges before Authentication
- ❌ Build Feed before Study Sessions
- ✔ Follow phase order strictly

---

## 3. TRACKER UPDATE RULE

After completing any task, must update `Tracker.md`.

**Required Updates:**

- Mark task completed
- Update phase progress
- Update project progress
- Update completed task count
- Update remaining task count
- Update current task

Failure to update tracker is a violation.

---

## 4. TASK COMPLETION RULE

A task can only be marked complete if **ALL** conditions are true:

- Code implemented
- Application builds successfully
- No TypeScript errors
- No lint errors
- Feature tested
- Feature functional

Never mark partially completed work as complete.

---

## 5. DATABASE RULES

Before modifying database, must check `DatabaseSchema.md`.

**Never:**

- ❌ Create tables not defined in schema
- ❌ Rename tables without updating schema
- ❌ Remove relationships without approval
- ❌ Duplicate data unnecessarily

When schema changes, must update:

- Prisma schema
- `DatabaseSchema.md`
- Migration files

---

## 6. API RULES

Before creating API:

- Check if API already exists
- Never create duplicate endpoints
- Use REST conventions

**GOOD:**

- `/api/groups`
- `/api/groups/:id`
- `/api/sessions`
- `/api/challenges`

**BAD:**

- `/api/group-data`
- `/api/group-fetch`
- `/api/get-groups`

---

## 7. COMPONENT RULES

- All components must be reusable
- Never create duplicate UI
- Before creating component: search existing components
- If reusable component exists: use it, do not rebuild it

---

## 8. TYPE SAFETY RULES

TypeScript is mandatory.

**Never use `any`** unless absolutely unavoidable.

Always:

- Create proper types
- Validate API responses
- Validate form inputs

---

## 9. VALIDATION RULES

All forms require validation. Use **Zod**.

**Required Validation:**

- Email
- Username
- Group Name
- Goals
- URLs

Never trust frontend input. Always validate server-side.

---

## 10. AUTHENTICATION RULES

Protected routes must require authentication.

**Never expose** without authorization checks:

- User private data
- Admin functionality
- Group management endpoints

---

## 11. AUTHORIZATION RULES

Always verify **role** before allowing:

- Remove member
- Edit group
- Change goals
- Enable party mode

Admin checks required. Never trust client-side role values.

---

## 12. STUDY SESSION RULES

**Critical Feature.**

**Rules:**

- Only one active session may run per user
- Users may have many sessions
- Users may not have many running sessions

**Must support:** Start, Pause, Resume, Stop, Recovery

---

## 13. SESSION RECOVERY RULES

Study progress must never be lost.

**Must recover after:**

- Refresh
- Logout
- Browser restart
- Temporary disconnect

Timer state must persist.

---

## 14. FEED RULES

- Feed posts linked to study sessions
- Do not allow orphan posts
- Deleting session must not delete feed history
- Feed must preserve learning records

---

## 15. LEADERBOARD RULES

- Leaderboards must use database calculations
- Do not calculate on frontend
- Support: Daily, Weekly, Monthly, All Time

---

## 16. SECURITY RULES

**Mandatory — Use:**

- HTTPS
- Rate Limiting
- Input Validation
- Output Sanitization
- RBAC

**Prevent:**

- SQL Injection
- XSS
- CSRF

Never expose secrets. Never commit environment variables.

---

## 17. PERFORMANCE RULES

Before writing complex query, check indexing.

**Avoid:**

- N+1 Queries
- Repeated Fetching
- Unnecessary Re-renders

**Use:**

- Pagination
- Lazy Loading
- Caching

---

## 18. ERROR HANDLING RULES

Never silently fail.

Every action must return **Success** OR **Meaningful Error**.

- No generic errors
- Provide user-friendly messages

---

## 19. LOGGING RULES

**Log:**

- Authentication failures
- Session failures
- Database failures
- Server errors

**Do not log:**

- Passwords
- Tokens
- Secrets

---

## 20. TESTING RULES

Before marking feature complete, must test:

- Happy Path
- Edge Cases
- Failure Cases

**Required Tests:**

- Authentication
- Groups
- Goals
- Sessions
- Warnings
- Notifications
- Leaderboards
- Challenges

---

## 21. UI RULES

### Design Principles

- Clean
- Fast
- Minimal
- Mobile Responsive
- Accessible

**Use:** Shadcn UI, TailwindCSS, `DESIGN.md` color tokens and layout

**Avoid:**

- Overcomplicated UI
- Excessive Animations
- Heavy Components

---

## 22. MOBILE RULES

Every page must work on:

- Mobile
- Tablet
- Desktop

Mobile is not optional.

---

## 23. DOCUMENTATION RULES

Whenever major architecture changes, update:

- `PRD.md`
- `TRD.md`
- `DatabaseSchema.md`
- `ImplementationPlan.md`
- `Tracker.md`

Documentation must match code.

---

## 24. DEPLOYMENT RULES

Before deployment, verify:

- Build Success
- No TypeScript Errors
- No Lint Errors
- Database Connected
- Environment Variables Configured

---

## 25. AI AGENT CHECKLIST

### Before starting work

- [ ] Read PRD
- [ ] Read TRD
- [ ] Read AppFlow
- [ ] Read DatabaseSchema
- [ ] Read ImplementationPlan
- [ ] Read Tracker
- [ ] Read RULES
- [ ] Read DESIGN

### Before marking task complete

- [ ] Feature Implemented
- [ ] Build Passes
- [ ] No TS Errors
- [ ] No Lint Errors
- [ ] Tested
- [ ] Tracker Updated

---

## 26. GOLDEN RULE

**Do not optimize for speed. Optimize for correctness.**

A slower correct implementation is preferred over a fast broken implementation.

Never sacrifice architecture quality for short-term progress.

The goal is a **production-ready GrindForge platform**.
