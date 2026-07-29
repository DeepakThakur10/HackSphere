# HackSphere — Enterprise Hackathon Management Platform (MERN)

> A full-stack, workflow-driven hackathon platform supporting Participants, Host Organizers, Certified Judges, and System Administrators.

---

## 🌟 Resume Highlights

- **Multi-Role RBAC System**: Designed and implemented a role-based access control architecture serving **4 core personas** (Participants, Organizers, Judges, Admins).
- **Workflow State Machines**: Centralized transition validator engine enforcing deterministic lifecycles for Hackathons (`draft` → `published` → `ongoing` → `judging` → `completed`), Submissions, Registrations, and Teams.
- **Service Layer Architecture**: Decoupled business logic featuring a **Leaderboard Service** with 4-tier deterministic tie-breakers (Total Score → Innovation → Technical Complexity → Submission Timestamp).
- **Enterprise Features**: Real-time broadcast announcements (Server-Sent Events), Nodemailer invitation workflow, verifiable PDF certificates, Google/ICS calendar integration, discussion forums, submission version history, team chat, and CSV/PDF export utilities.
- **Production Hardening**: Equipped with Helmet security HTTP headers, Express rate limiting, health monitoring endpoints, Swagger OpenAPI docs, multi-stage Docker containerization, and GitHub Actions CI pipelines.

---

## 🏛️ System Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    HackSphere Full-Stack Application   │
                      └───────────────────┬────────────────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌───────────────┐   ┌───────────────┐     ┌───────────────┐   ┌───────────────┐
│ Participant   │   │ Host          │     │ Certified     │   │ System        │
│ Workspace     │   │ Organizer     │     │ Judge Panel   │   │ Admin Console │
└───────────────┘   └───────────────┘     └───────────────┘   └───────────────┘
```

---

## 🚀 Quickstart Commands

### 1. Docker Compose (Recommended)
```bash
docker-compose up --build
```
Access the application:
- **Vite Frontend Client**: `http://localhost:5173`
- **Express Backend API**: `http://localhost:3000/api`
- **Interactive Swagger Docs**: `http://localhost:3000/api-docs`
- **Health Check Endpoint**: `http://localhost:3000/health`

### 2. Manual Development Setup

#### Backend Setup
```bash
cd HackSphere-backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd HackSphere-frontend
npm install
npm run dev
```

---

## 📚 Platform Documentation Bundle

- 🏗️ **[ARCHITECTURE.md](file:///d:/FullStack%20Project/ARCHITECTURE.md)**: Domain separation, state machine specs, and data flow.
- 📡 **[API.md](file:///d:/FullStack%20Project/API.md)**: Comprehensive REST API endpoint inventory.
- 🐳 **[DEPLOYMENT.md](file:///d:/FullStack%20Project/DEPLOYMENT.md)**: Docker containerization & Cloud deployment guide.
- 🤝 **[CONTRIBUTING.md](file:///d:/FullStack%20Project/CONTRIBUTING.md)**: Development guidelines, branch naming, and pull request standards.

---

## 🛠️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, TailwindCSS, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express 5, Mongoose ODM, JWT, Bcrypt, Nodemailer, Swagger JSDoc |
| **Database** | MongoDB |
| **DevOps & Security** | Docker, Nginx, Helmet, Express Rate Limit, GitHub Actions |

---

## 🏆 Key Features

- **Decoupled Registration & Team Roster**: Register first as an individual, then create or join teams with invite codes.
- **Judge Evaluation Panel**: 7-criteria evaluation out of 70 pts (Innovation, Tech Complexity, UI/UX, Functionality, Scalability, Docs, Presentation).
- **Winner Podium & Standings**: Dynamic Top 3 winner podium (🥇 🥈 🥉) and full leaderboard table.
- **Export Capabilities**: Single-click CSV dataset exporter and print-optimized PDF renderer.