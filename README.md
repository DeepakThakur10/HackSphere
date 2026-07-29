# HackSphere

HackSphere is a full-stack hackathon discovery and management platform.
The project currently includes a React + Vite frontend and an Express + MongoDB backend.

## What Is Done So Far

- Frontend app shell with routing, layout, and landing page sections.
- Backend API with auth and hackathon routes.
- Login and signup forms connected to the backend.
- Featured hackathons section now loads live data from the backend.
- Auth state persists the backend token and user payload in local storage.
- Backend CORS is enabled for local frontend development.

## Tech Stack

- Frontend: React, Vite, React Router DOM, Tailwind CSS, Axios, React Hot Toast, React Hook Form, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, CORS

## Project Structure

```text
HackSphere-backend/
  src/
    app.js
    server.js
    config/
    controllers/
    middleware/
    models/
    routes/

HackSphere-frontend/
  src/
    App.jsx
    main.jsx
    components/
    constants/
    context/
    layouts/
    pages/
    routes/
    services/
```

## Local Setup

### Backend

```bash
cd HackSphere-backend
npm install
npm run dev
```

### Frontend

```bash
cd HackSphere-frontend
npm install
npm run dev
```

## Environment Variables

### Backend

Create a `.env` file inside `HackSphere-backend` with values like:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend

The frontend defaults to `http://localhost:3000/api`, but you can override it with:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/admin`

### Hackathons

- `POST /api/hackathons`
- `GET /api/hackathons`
- `GET /api/hackathons/:id`
- `PUT /api/hackathons/:id`
- `DELETE /api/hackathons/:id`

## Current Frontend Flow

- The login page sends credentials to the backend and stores the returned token and user data.
- The signup page creates a new user using the backend registration endpoint.
- The featured hackathons section fetches published hackathons from the API and renders them on the landing page.

## Current Backend Status

- Auth login and signup are implemented.
- Published hackathons can be listed from the database.
- The profile route currently returns a placeholder response and can be expanded next.

## Notes

- Frontend development server: `http://localhost:5173`
- Backend development server: `http://localhost:3000`
- The frontend API client uses `hacksphere_token` and `hacksphere_user` in local storage.