# HackSphere REST API Reference

Interactive OpenAPI 3.0 documentation is served live at `http://localhost:3000/api-docs`.

---

## 🔐 Authentication API

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| `GET` | `/api/auth/profile` | Get logged-in user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile information | ✅ |

---

## 🏆 Hackathon API

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/hackathons` | List public hackathons with filters | ❌ |
| `GET` | `/api/hackathons/:id` | Get hackathon details | ❌ |
| `GET` | `/api/hackathons/mine` | List organizer's hosted hackathons | ✅ (Organizer) |
| `POST` | `/api/hackathons` | Create new hackathon | ✅ (Organizer) |
| `PATCH` | `/api/hackathons/:id/status` | Transition hackathon lifecycle status | ✅ (Organizer) |

---

## 👥 Registrations & Team Roster API

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/registrations` | Register for hackathon | ✅ |
| `GET` | `/api/registrations/organizer/:hackathonId` | List participant registrations | ✅ (Organizer) |
| `PATCH` | `/api/registrations/:id/approve` | Approve participant registration | ✅ (Organizer) |
| `POST` | `/api/teams` | Create new team | ✅ |
| `POST` | `/api/teams/join` | Join team via invite code | ✅ |

---

## ⚖️ Judge Evaluation & Leaderboard API

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/judges/hackathon/:id` | Assign judge to hackathon (via ID or Email) | ✅ (Organizer) |
| `GET` | `/api/reviews/assigned` | Get judge's assigned projects | ✅ (Judge) |
| `POST` | `/api/reviews` | Submit project evaluation score | ✅ (Judge) |
| `GET` | `/api/hackathons/:id/leaderboard` | Get official leaderboard standings | ❌ (Public when published) |
| `GET` | `/api/hackathons/:id/winners` | Get Top 3 winner summary | ❌ |
