# GrindForge — App Flow & User Journey

## 1. User Journey Overview

The user journey is designed around four core actions:

1. Join a learning community
2. Track study progress
3. Stay accountable
4. Grow with others

The application should feel like a combination of:

- Study Tracker
- Social Platform
- Accountability Partner
- Challenge System

---

## 2. First Time User Journey

```
Landing Page
    ↓
Sign Up
    ↓
Create Profile
    ↓
Choose Username
    ↓
Complete Onboarding
    ↓
Create Group OR Join Group
    ↓
Dashboard
```

---

## 3. Landing Page Flow

**Guest User sees:**

- Hero Section
- Product Overview
- Features
- Public Leaderboards
- Public Challenges
- Public Groups

**Actions:**

- Login
- Sign Up
- Explore

---

## 4. Authentication Flow

```
User Clicks Sign Up
    ↓
Continue With Google
    OR
Continue With Email
    ↓
Account Created
    ↓
Create Profile
```

**Fields:**

- Username
- Profile Picture
- Bio
    ↓
Redirect To Onboarding

---

## 5. Onboarding Flow

```
Welcome Screen
    ↓
Explain:
  - Study Tracking
  - Accountability
  - Challenges
  - Forge Score
    ↓
Choose Interests
```

**Examples:** DSA, Web Development, UPSC, GATE, Machine Learning
    ↓
Complete
    ↓
Dashboard

---

## 6. Dashboard Flow

Dashboard is the **Home Screen**.

```
Header
    ↓
Quick Stats
    ↓
Current Goals
    ↓
Study Progress
    ↓
Active Sessions
    ↓
Recent Activity
    ↓
Leaderboard Preview
    ↓
Challenge Preview
```

### Dashboard Sections

1. Daily Progress
2. Weekly Progress
3. Monthly Progress
4. Current Streak
5. Forge Score
6. Active Study Session

---

## 7. Group Creation Flow

```
Dashboard
    ↓
Create Group
    ↓
Enter: Group Name, Description
    ↓
Select Privacy: Public | Private
    ↓
Select Goal Mode: Common | Personal | Hybrid
    ↓
Set Goals: Daily, Weekly, Monthly
    ↓
Configure Settings:
  - Party Mode
  - Checkpoint Frequency
  - Warning Rules
    ↓
Create Group
    ↓
Group Dashboard
```

---

## 8. Join Group Flow

### Method 1 — Invite Link

```
Invite Link → Accept → Join Group
```

### Method 2 — Public Discovery

```
Public Discovery
    ↓
Browse Groups
    ↓
Select Group
    ↓
Request Join
    ↓
Admin Approval
    ↓
Join Group
```

---

## 9. Group Dashboard Flow

**Group Dashboard contains:**

```
Group Info
    ↓
Member List
    ↓
Leaderboard
    ↓
Study Feed
    ↓
Active Members
    ↓
Challenges
    ↓
Settings
```

---

## 10. Study Session Flow

```
Dashboard
    ↓
Start Study Session
    ↓
Select: Subject, Topic, Resource Link, Notion Link
    ↓
Start Timer
    ↓
Session Running
```

---

## 11. Running Session Flow

**User sees:**

```
Timer
    ↓
Current Subject
    ↓
Current Topic
    ↓
Progress
    ↓
Buttons: Pause | Resume | Stop
```

---

## 12. Pause Flow

```
Session Running
    ↓
Pause
    ↓
Status Changes: Running → Paused
    ↓
Time Saved
    ↓
User Can Leave Platform
    ↓
Return Later
    ↓
Resume
```

---

## 13. Resume Flow

```
Login
    ↓
Dashboard
    ↓
Detect Existing Session
    ↓
Show Resume Button
    ↓
Continue Session
```

---

## 14. Stop Session Flow

```
Stop Timer
    ↓
Session Summary Modal
```

**Fields:**

- What Did You Learn
- Key Concepts
- Notes
- Revision Link
- Resource Link
    ↓
Submit
    ↓
Session Saved
    ↓
Feed Entry Created
    ↓
Stats Updated

---

## 15. Idle Detection Flow

```
Session Running
    ↓
No Activity For 10 Minutes
    ↓
Popup Appears: "Are you still studying?"
    ↓
30 Second Countdown
    ↓
User Responds YES → Continue
    OR
No Response
    ↓
Pause Session
    ↓
Create Warning
    ↓
Notify Group
```

---

## 16. Checkpoint Flow

```
Admin Defined Interval (30 Min | 1 Hour | 2 Hour)
    ↓
Popup Appears: "What did you learn?"
    ↓
User Writes Response
    ↓
Stored In Database
    ↓
Continue Session
```

**Missed Checkpoint:**
    ↓
Generate Warning → Store Warning → Show On Profile

---

## 17. Study Feed Flow

```
User Completes Session
    ↓
Learning Summary Created
    ↓
Feed Post Generated
    ↓
Visible To Group
    ↓
Members Can: Like | Comment | React
```

---

## 18. Challenge Flow

```
User Opens Challenges
    ↓
Browse Challenges
    ↓
Select Challenge
    ↓
View Rules
    ↓
Join Challenge
    ↓
Challenge Dashboard
    ↓
Track Progress
    ↓
Leaderboard Updates
```

---

## 19. Party Mode Flow

```
End Of Goal Period (Daily | Weekly | Monthly)
    ↓
Evaluate Goals
    ↓
Goal Achieved?
```

**YES:** Success → Reward Forge Score

**NO:**
    ↓
Party Debt Created
    ↓
Visible To Group
    ↓
Admin Can Mark Completed

---

## 20. Profile Flow

```
User Opens Profile
    ↓
View:
  - Profile Info
  - Study Statistics
  - Forge Score
  - Achievements
  - Warnings
  - Party History
  - Challenge History
  - Groups Joined
```

---

## 21. Leaderboard Flow

```
Open Leaderboards
    ↓
Choose Type: Hours | Forge Score | Challenges
    ↓
Choose Duration: Daily | Weekly | Monthly | All Time
    ↓
View Rankings
```

---

## 22. Notification Flow

**Events:**

- Warning
- Comment
- Like
- Goal Achieved
- Goal Failed
- Challenge Update
- Join Request
    ↓
Create Notification
    ↓
Show Notification Center
    ↓
Mark Read

---

## 23. Admin Flow

```
Open Group Settings
    ↓
Manage Members
    ↓
Approve Requests
    ↓
Remove Members
    ↓
Change Goals
    ↓
Enable Party Mode
    ↓
Configure Checkpoints
    ↓
Configure Warnings
    ↓
Save
```

---

## 24. Public Profile Flow

```
Visitor Opens Profile
    ↓
View:
  - Study Hours
  - Forge Score
  - Achievements
  - Challenges
  - Groups
  - Activity Feed
```

Privacy Rules Applied.

---

## 25. User Logout Flow

```
Logout
    ↓
Save All Session State
    ↓
Persist Progress
    ↓
Logout Complete
```

---

## 26. Session Recovery Flow

```
User Returns
    ↓
Login
    ↓
Check Active Session
    ↓
Restore Session State
    ↓
Offer Resume
    ↓
Continue Studying
```

---

## 27. Mobile Flow

```
User Opens App
    ↓
Dashboard
    ↓
Quick Start Session
    ↓
Pause → Resume → Stop
    ↓
Submit Learning Log
    ↓
Close App
```

---

## 28. Error Recovery Flow

### Internet Lost

```
Internet Lost
    ↓
Timer Continues Locally
    ↓
Reconnect
    ↓
Sync Data
    ↓
No Data Loss
```

### Server Restart

```
Server Restart
    ↓
Recover Session
    ↓
Restore State
    ↓
Continue
```

---

## 29. MVP Screen Checklist

### Authentication

- [ ] Login
- [ ] Register
- [ ] Forgot Password

### Dashboard

- [ ] Home Dashboard

### Groups

- [ ] Create Group
- [ ] Group Dashboard
- [ ] Group Settings
- [ ] Member Management

### Study

- [ ] Create Session
- [ ] Running Session
- [ ] Pause Session
- [ ] Stop Session
- [ ] Session Summary

### Feed

- [ ] Feed Page
- [ ] Post Details

### Challenges

- [ ] Challenge List
- [ ] Challenge Details

### Leaderboards

- [ ] Hours Leaderboard
- [ ] Forge Leaderboard

### Profile

- [ ] Public Profile
- [ ] Private Profile

### Notifications

- [ ] Notification Center

### Settings

- [ ] User Settings

### System

- [ ] Idle Warning Modal
- [ ] Checkpoint Modal
- [ ] Session Recovery

> App Flow is complete only when every screen and flow above is implemented and tested.
