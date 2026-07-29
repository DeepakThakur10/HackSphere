import { Navigate, Route, Routes } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import HomePage from '../pages/Landing/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import SignupPage from '../pages/Signup/SignupPage';
import HackathonDetailsPage from '../pages/HackathonDetails/HackathonDetailsPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/hackathons" element={<Navigate to="/" replace />} />
        <Route path="/hackathons/:id" element={<HackathonDetailsPage />} />
        <Route path="/profile" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}