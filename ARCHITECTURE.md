# HackSphere Architecture Specification

## 1. Architectural Patterns

HackSphere follows a **Layered Service-Oriented Architecture (SOA)** with strict domain separation between client UI components, REST controllers, service layers, and database models.

```
React Frontend (Vite)
       │ HTTP / REST & SSE
       ▼
Express API Gateway & Security (Helmet, Rate Limiter)
       │
       ▼
Controllers (Validation & Request Handling)
       │
       ▼
Service Layer (Leaderboard Engine, Team Roster Transactions, State Machine)
       │
       ▼
Mongoose Data Models (MongoDB Persistence)
```

---

## 2. State Machine Engine

State transitions across critical domains are governed by the centralized transition engine (`src/utils/stateMachine.js`).

### Hackathon State Lifecycle
```
draft ──► published ──► registration_closed ──► ongoing ──► judging ──► completed ──► archived
```

### Team Roster Lifecycle
```
created ──► joining ──► locked ──► submitted ──► completed
```

### Registration Approval Lifecycle
```
pending ──► approved / rejected ──► cancelled
```

---

## 3. Leaderboard Calculation Algorithm

The **Leaderboard Service** (`src/services/leaderboard.service.js`) executes a 4-tier deterministic sorting algorithm:

1. **Total Average Score**: Highest total sum across 7 criteria out of 70 pts.
2. **Innovation Score**: Higher Innovation score wins ties.
3. **Technical Complexity Score**: Higher Technical Complexity score wins remaining ties.
4. **Timestamp Earliest Submission**: Earliest `submittedAt` timestamp breaks remaining ties.

---

## 4. Database Schema Inventory

- `User`: Accounts with RBAC roles (`participant`, `organizer`, `judge`, `admin`).
- `Hackathon`: Event details, status, dates, team size, prize pool, and tracks.
- `Registration`: User-to-hackathon registration link with team name, member emails, and payment proof.
- `Team`: Team rosters with leader, members, invite code, and lock timestamps.
- `Submission`: Project entry with repository link, demo URL, presentation, tech stack, and version history snapshots.
- `HackathonJudge`: Decoupled judge assignment mapping judges to hackathons.
- `Review`: 7-criteria evaluation scores submitted by certified judges.
- `Announcement`: Real-time broadcast messages pushed via Server-Sent Events (SSE).
- `Discussion`: Public Q&A board posts and nested reply threads.
- `TeamMessage`: Private team chat messages between team members.
- `AuditLog`: Admin audit trail capturing system events.
