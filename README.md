# 🚀 HackSphere

HackSphere is a full-stack MERN-based hackathon discovery and management platform that enables students to discover hackathons, register for events, and allows organizers to create and manage hackathons through a modern, scalable web application.

The project is being developed with a **feature-first approach**, prioritizing business logic, clean architecture, and scalability before UI polish.

---

# ✨ Features

## 👨‍🎓 Student

- User Authentication (Signup/Login)
- JWT-based Authorization
- Browse Published Hackathons
- View Hackathon Details
- Register for Hackathons
- Persistent Login
- Profile Management *(In Progress)*

---

## 👨‍💼 Organizer *(Upcoming)*

- Organizer Dashboard
- Create Hackathons
- Edit Hackathons
- Delete Hackathons
- View Registered Participants

---

## 👑 Admin *(Upcoming)*

- Manage Users
- Manage Hackathons
- Platform Analytics

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Hook Form
- React Hot Toast
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Multer
- Cloudinary
- CORS

---

# 📁 Project Structure

```text
HackSphere/

├── HackSphere-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── HackSphere-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Current Progress

## ✅ Completed

### Authentication

- User Signup
- User Login
- JWT Authentication
- Protected Routes
- Guest Routes
- Persistent Authentication

---

### Landing Page

- Hero Section
- Features Section
- Featured Hackathons
- Backend Integration

---

### Hackathons

- List Published Hackathons
- Hackathon Details
- Registration Flow

---

### Backend

- Authentication APIs
- Hackathon CRUD APIs
- Registration APIs
- Generic Image Upload API
- Cloudinary Integration
- Multer Middleware

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/signup` |
| POST | `/api/auth/login` |
| GET | `/api/auth/profile` |
| PUT | `/api/auth/profile` |
| GET | `/api/auth/admin` |

---

## Hackathons

| Method | Endpoint |
|---------|----------|
| GET | `/api/hackathons` |
| GET | `/api/hackathons/:id` |
| POST | `/api/hackathons` |
| PUT | `/api/hackathons/:id` |
| DELETE | `/api/hackathons/:id` |

---

## Registrations

| Method | Endpoint |
|---------|----------|
| POST | `/api/registrations` |
| GET | `/api/registrations` |

---

## Upload

| Method | Endpoint |
|---------|----------|
| POST | `/api/upload/image` |

---

# 🌐 Environment Variables

## Backend (`HackSphere-backend/.env`)

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

---

## Frontend (`HackSphere-frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

# ⚙️ Local Setup

## Backend

```bash
cd HackSphere-backend

npm install

npm run dev
```

Backend runs on:

```
http://localhost:3000
```

---

## Frontend

```bash
cd HackSphere-frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 📌 Development Workflow

This project follows a **feature-first development approach**.

Priority:

1. Business Logic
2. Authentication
3. Student Features
4. Organizer Features
5. Admin Features
6. UI Polish
7. Animations

---

# 📍 Current Roadmap

## 🔄 In Progress

- Profile Page
- Avatar Upload
- Profile Editing

---

## ⏳ Upcoming

- Organizer Dashboard
- Create Hackathon
- Edit Hackathon
- Delete Hackathon
- View Participants
- Admin Dashboard
- Team Management
- Notifications
- Certificates
- Search & Filters

---

# 📖 Coding Guidelines

- Build one feature at a time.
- Avoid modifying unrelated files.
- Keep components modular and reusable.
- Use async/await for asynchronous code.
- Keep API calls inside `services/api.js`.
- Follow existing project structure and coding style.
- Write production-ready code.

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

# 📜 License

This project is developed for learning, portfolio, and hackathon purposes.

---

# 👨‍💻 Author

**Deepak Kumar**

- GitHub: https://github.com/DeepakThakur10

---

⭐ If you like this project, consider giving it a star on GitHub!