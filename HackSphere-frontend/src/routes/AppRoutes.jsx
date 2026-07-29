import { Route, Routes } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import HomePage from '../pages/Landing/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import SignupPage from '../pages/Signup/SignupPage';
import HackathonsPage from '../pages/Hackathons/HackathonsPage';
import HackathonDetailsPage from '../pages/HackathonDetails/HackathonDetailsPage';
import CreateHackathonPage from '../pages/CreateHackathon/CreateHackathonPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hackathons" element={<HackathonsPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetailsPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hackathons/create" element={<CreateHackathonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}