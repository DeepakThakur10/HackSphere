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
import TeamDetailsPage from '../pages/Team/TeamDetailsPage';
import OrganizerRegistrationsPage from '../pages/Organizer/OrganizerRegistrationsPage';
import ManageHackathonPage from '../pages/Organizer/ManageHackathonPage';
import AssignJudgesPage from '../pages/Organizer/AssignJudgesPage';
import ParticipantWorkspacePage from '../pages/Participant/ParticipantWorkspacePage';
import ProjectSubmissionPage from '../pages/Participant/ProjectSubmissionPage';
import JudgeDashboardPage from '../pages/Judge/JudgeDashboardPage';
import ProjectEvaluationPage from '../pages/Judge/ProjectEvaluationPage';
import LeaderboardPage from '../pages/Leaderboard/LeaderboardPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import AdminUsersPage from '../pages/Admin/AdminUsersPage';
import AdminHackathonsPage from '../pages/Admin/AdminHackathonsPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hackathons" element={<HackathonsPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetailsPage />} />
        <Route path="/hackathons/:id/leaderboard" element={<LeaderboardPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hackathons/create" element={<CreateHackathonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/teams/:id" element={<TeamDetailsPage />} />

          {/* Organizer Routes */}
          <Route path="/organizer/hackathons/:hackathonId/registrations" element={<OrganizerRegistrationsPage />} />
          <Route path="/organizer/hackathons/:id/manage" element={<ManageHackathonPage />} />
          <Route path="/organizer/hackathons/:hackathonId/judges" element={<AssignJudgesPage />} />

          {/* Participant Routes */}
          <Route path="/hackathons/:hackathonId/workspace" element={<ParticipantWorkspacePage />} />
          <Route path="/hackathons/:hackathonId/submit" element={<ProjectSubmissionPage />} />

          {/* Judge Routes */}
          <Route path="/judge/dashboard" element={<JudgeDashboardPage />} />
          <Route path="/judge/submissions/:submissionId/evaluate" element={<ProjectEvaluationPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/hackathons" element={<AdminHackathonsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}