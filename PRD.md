# GrindForge — Product Requirements Document (PRD)

## 1. Product Overview

### Product Name

**GrindForge**

### Product Vision

GrindForge is a social accountability learning platform that helps individuals and groups stay consistent with their study goals through transparency, progress tracking, learning logs, group accountability, leaderboards, challenges, and penalties.

The platform is designed around the idea that people achieve more when their progress is visible to others and when they are accountable to a group.

> **This is NOT a simple study timer application.**  
> **This is a social learning accountability platform.**

---

## 2. Problem Statement

### Current Problems

Students often:

- Start studying with motivation but lose consistency
- Have no accountability
- Study alone and feel isolated
- Use study timers that only track time
- Cannot easily see their friends' progress
- Forget what they studied
- Have no structured revision records
- Set goals but never complete them
- Have no consequences for missing goals

Most study applications focus only on productivity.

Very few focus on:

- Accountability
- Social motivation
- Learning transparency
- Group commitment
- Consistency

---

## 3. Proposed Solution

GrindForge enables users to:

- Create study groups
- Invite friends
- Set study goals
- Track study hours
- Maintain learning records
- Store revision links
- Compete on leaderboards
- Participate in challenges
- Receive inactivity warnings
- Stay accountable through group visibility
- Enable optional party penalties

---

## 4. User Roles

### Guest

**Can:**

- Visit public pages
- View public groups
- View public profiles

**Cannot:**

- Start study sessions
- Create groups
- Join private groups

### Member

**Can:**

- Create study sessions
- Join groups
- View progress
- Participate in challenges
- Post study logs

### Group Admin

**Can:**

- Create groups
- Remove members
- Approve join requests
- Configure goals
- Configure warning settings
- Enable/disable party mode
- Configure checkpoint frequency
- Configure group privacy

---

## 5. Group Types

### Private Group

- Invite only
- Join requests optional
- Only members can see data

### Public Group

- Discoverable by everyone
- Anyone can request to join
- Study progress visible publicly

---

## 6. Goal System

Admin chooses one mode:

### Mode A: Common Goal

Admin sets:

- Daily Goal
- Weekly Goal
- Monthly Goal

Applies to all users.

**Example:** 30 hours/week.

### Mode B: Personal Goals

- Admin enables personal goals
- Users set their own targets

### Mode C: Hybrid

- Admin sets minimum requirement
- Users may choose higher goals

---

## 7. Study Session System

Users can create unlimited study sessions.

Each session contains:

- Subject
- Topic
- Description
- Resource Link
- Notion Link
- Tags

### Session States

- Running
- Paused
- Completed

### Timer Controls (Required)

- Start
- Pause
- Resume
- Stop

### Persistence Requirements

Timer progress must remain stored permanently.

**Example:** User studies 3 hours today, logs out, returns after one week — progress must still exist.

---

## 8. Multi Timer Support

Users may have multiple study sessions.

**Example:**

- DSA Session
- Web Development Session
- Aptitude Session

Each session tracks independently.

> **Only one active timer should run at a time.**

---

## 9. Learning Logs

After stopping a session, user must enter:

- What was learned
- Key concepts
- Notes
- Revision links

Admin may configure mandatory completion.

---

## 10. Checkpoint System

**Purpose:** Prevent fake study tracking.

Admin selects interval:

- 30 minutes
- 1 hour
- 2 hours

Popup appears: *"What did you learn?"*

- User response stored
- Failure to respond generates warning

---

## 11. Idle Detection System

Monitor:

- Mouse movement
- Keyboard activity

If no activity for 10 minutes:

- Show popup: *"Are you still studying?"*
- User has 30 seconds
- If no response:
  - Timer pauses automatically
  - Warning issued

---

## 12. Warning System

Warnings are visible to group members.

**Examples:**

- Idle warning
- Missed checkpoint
- Suspicious activity

Warning history stored permanently.

---

## 13. Party Mode

Admin can:

- Enable Party Mode
- Disable Party Mode

If enabled:

- Users who fail goals receive party debt

Track:

- Party debts owed
- Party debts completed
- Party history stored

---

## 14. Study Feed

Users can post:

- Study summaries
- Resources
- Notes
- Revision links

Feed supports:

- Likes
- Comments
- Reactions

---

## 15. Leaderboards

### Hours Leaderboard

Rank by:

- Daily hours
- Weekly hours
- Monthly hours
- All-time hours

### Forge Score Leaderboard

Rank by:

- Consistency
- Participation
- Contributions

---

## 16. User Profile

Profile contains:

- Username
- Bio
- Total Hours
- Weekly Hours
- Monthly Hours
- All Time Hours
- Forge Score
- Current Streak
- Best Streak
- Achievements
- Joined Groups
- Challenges

---

## 17. Forge Score

Separate from study hours.

**Forge Score rewards:**

- Consistency
- Goal completion
- Learning logs
- Challenge participation
- Community contributions

**Forge Score penalties:**

- Warnings
- Missed checkpoints
- Inactivity

Hours and Forge Score are independent metrics.

---

## 18. Challenge System

Users can join challenges.

**Examples:**

- Striver 45 Day Challenge
- 100 Hour DSA Challenge
- GATE Challenge

**Challenge features:**

- Rules
- Time limits
- Leaderboards
- Progress tracking

---

## 19. Notifications

### In-App Notifications

- Goal reminders
- Warnings
- Join requests
- Comments
- Challenge updates

### Future

- WhatsApp integration
- Email integration

---

## 20. Privacy Requirements

- Public Profile: Configurable
- Group Privacy: Configurable
- Users control profile visibility

---

## 21. Non-Functional Requirements

### Performance

- Dashboard loads < 2 seconds
- Timer updates in real time
- Supports 1000+ concurrent users

### Security

- JWT authentication
- Secure password storage
- Role based access control

### Availability

- 99.9% uptime target

### Mobile Responsive

- Fully responsive
- Desktop first
- Mobile compatible

---

## 22. Future Features (Not MVP)

- Voice study rooms
- Video study rooms
- Browser extension
- AI summaries
- AI flashcards
- AI revision notes
- Mobile app
- Discord integration
- Telegram integration

---

## 23. Out of Scope (MVP)

Do NOT build initially:

- Video calling
- Screen sharing
- AI tutoring
- Payment system
- Marketplace
- Course selling

---

## 24. Success Metrics

Platform success measured by:

- Daily active users
- Weekly active users
- Total study hours
- Challenge participation
- Goal completion rate
- User retention
- Group creation rate

---

## 25. MVP Completion Checklist

### Authentication

- [ ] Email signup
- [ ] Google signup
- [ ] Login
- [ ] Logout

### Groups

- [ ] Create group
- [ ] Join group
- [ ] Remove member
- [ ] Public groups
- [ ] Private groups

### Goals

- [ ] Common goals
- [ ] Personal goals
- [ ] Hybrid goals

### Study Sessions

- [ ] Start timer
- [ ] Pause timer
- [ ] Resume timer
- [ ] Stop timer
- [ ] Persistent storage

### Learning Logs

- [ ] Notes
- [ ] Revision links
- [ ] Resources

### Warnings

- [ ] Idle detection
- [ ] Auto pause
- [ ] Warning generation

### Leaderboards

- [ ] Hours leaderboard
- [ ] Forge leaderboard

### Profiles

- [ ] User profile
- [ ] Statistics page

### Party Mode

- [ ] Enable
- [ ] Disable
- [ ] Debt tracking

### Challenges

- [ ] Create challenge
- [ ] Join challenge
- [ ] Challenge leaderboard

### Notifications

- [ ] In-app notifications

### Deployment

- [ ] Production database
- [ ] Production deployment
- [ ] Error monitoring
- [ ] Analytics

> **MVP is complete ONLY when every checkbox above is functional.**
