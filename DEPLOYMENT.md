# HackSphere Deployment & Production Guide

This guide covers deployment options for containerized production environments.

---

## 1. Docker Compose (Local & Single-Server Production)

Execute docker-compose to launch MongoDB, Express Backend, and Nginx Frontend:

```bash
docker-compose up --build -d
```

To stop containers:
```bash
docker-compose down
```

---

## 2. Cloud Deployment Options

### Render / Railway / Fly.io

1. **Backend Service**:
   - Environment: Node.js 20
   - Build Command: `cd HackSphere-backend && npm install`
   - Start Command: `cd HackSphere-backend && node src/server.js`
   - Set Environment Variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`.

2. **Frontend Service**:
   - Build Command: `cd HackSphere-frontend && npm install && npm run build`
   - Publish Directory: `HackSphere-frontend/dist`
   - Set Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`

---

## 3. Environment Variable Reference

### Backend (`.env`)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/hacksphere
JWT_SECRET=super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
