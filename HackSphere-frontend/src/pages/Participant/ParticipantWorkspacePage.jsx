import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCode,
  FileText,
  MapPin,
  Rocket,
  ShieldAlert,
  Trophy,
  Users,
  Wifi,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Timeline from '../../components/common/Timeline';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  getHackathonByIdRequest,
  getRegistrationsRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ParticipantWorkspacePage() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchWorkspaceData = async () => {
      try {
        setLoading(true);
        const [hackathonRes, regRes] = await Promise.all([
          getHackathonByIdRequest(hackathonId),
          getRegistrationsRequest(),
        ]);

        if (active) {
          const foundHackathon = hackathonRes.data.data;
          setHackathon(foundHackathon);

          const myReg = regRes.data.data.find(
            (r) => (r.hackathon?._id || r.hackathon) === hackathonId
          );
          setRegistration(myReg || null);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load workspace data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchWorkspaceData();

    return () => {
      active = false;
    };
  }, [hackathonId]);

  const teamId = registration?.team?._id || registration?.team;
  const isTeamLocked = registration?.team?.status === 'locked' || registration?.team?.status === 'submitted';
  const submissionStatus = submission ? submission.status : 'not_started';

  // Timeline Steps Configuration
  const timelineSteps = [
    {
      key: 'registration',
      label: 'Registration',
      description: 'Approved & Confirmed',
      isCompleted: true,
      isCurrent: false,
    },
    {
      key: 'team',
      label: 'Team Formation',
      description: isTeamLocked ? 'Roster Locked' : teamId ? 'Team Roster Set' : 'Pending Team',
      isCompleted: Boolean(teamId || hackathon?.teamType === 'individual'),
      isCurrent: !teamId && hackathon?.teamType === 'team',
    },
    {
      key: 'submission',
      label: 'Project Submission',
      description: submissionStatus === 'submitted' ? 'Submitted' : 'Pending Entry',
      isCompleted: submissionStatus === 'submitted' || submissionStatus === 'under_review' || submissionStatus === 'scored' || submissionStatus === 'published',
      isCurrent: teamId || hackathon?.teamType === 'individual',
    },
    {
      key: 'judging',
      label: 'Evaluation',
      description: submissionStatus === 'under_review' ? 'In Progress' : 'Awaiting Review',
      isCompleted: submissionStatus === 'scored' || submissionStatus === 'published',
      isCurrent: submissionStatus === 'under_review',
    },
    {
      key: 'results',
      label: 'Leaderboard',
      description: submissionStatus === 'published' ? 'Winners Announced' : 'Results Pending',
      isCompleted: submissionStatus === 'published',
      isCurrent: submissionStatus === 'scored',
    },
  ];

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Participant Workspace"
        title={hackathon ? hackathon.title : 'Event Workspace'}
        description="Your hacker command center — manage your team roster, track event timeline milestones, and submit your hackathon project."
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load workspace"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : !hackathon ? (
            <EmptyState
              icon={Rocket}
              title="Hackathon not found"
              description="The requested event does not exist."
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* 1. Timeline Stepper Component */}
              <Card className="p-6 sm:p-8 space-y-4">
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">Event Timeline & Progress</h2>
                <Timeline steps={timelineSteps} />
              </Card>

              {/* 2. Team Roster Overview */}
              <FormSection
                icon={Users}
                title="Team Roster Status"
                description="Your registered team setup for this event"
              >
                {teamId ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-text-primary">
                        {registration.team?.name || registration.teamName || 'Your Team'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Roster Status: {capitalize(registration.team?.status || 'Active')}
                      </p>
                    </div>
                    <Button as={Link} to={`/teams/${teamId}`} variant="secondary" size="md">
                      <Users className="h-4 w-4" />
                      View Team Roster
                    </Button>
                  </div>
                ) : hackathon.teamType === 'team' ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Team Required</p>
                      <p className="text-xs text-text-secondary">
                        Create a new team or join an existing team via invite code to complete your setup.
                      </p>
                    </div>
                    <Button as={Link} to="/dashboard">
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Individual Participation Confirmed.</p>
                )}
              </FormSection>

              {/* 3. Project Submission Dynamic Action Card */}
              <Card className="p-6 sm:p-8 border-brand-100 bg-brand-50/40 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge className="mb-2">
                      {submissionStatus === 'submitted'
                        ? 'Project Submitted'
                        : submissionStatus === 'under_review'
                        ? 'Under Judge Review'
                        : submissionStatus === 'published'
                        ? 'Winners Published'
                        : 'Submission Open'}
                    </Badge>
                    <h2 className="text-xl font-bold tracking-tight text-text-primary">Project Submission</h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      {submissionStatus === 'submitted'
                        ? 'Your project has been successfully submitted before the deadline.'
                        : submissionStatus === 'under_review'
                        ? 'Judges are evaluating your submission against competition criteria.'
                        : submissionStatus === 'published'
                        ? 'Hackathon results have been published on the leaderboard.'
                        : 'Submit your GitHub repository, live demo URL, presentation slides, and video demo.'}
                    </p>
                  </div>

                  {submissionStatus === 'published' ? (
                    <Button as={Link} to="/hackathons" size="lg">
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </Button>
                  ) : (
                    <Button as={Link} to={`/hackathons/${hackathonId}/submit`} size="lg">
                      <FileCode className="h-4 w-4" />
                      {submissionStatus === 'submitted' ? 'View / Edit Submission' : 'Submit Project'}
                    </Button>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
