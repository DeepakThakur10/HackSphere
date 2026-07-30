import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Layers3,
  LayoutDashboard,
  MapPin,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RegistrationModal from '../../components/registration/RegistrationModal';
import { useAuth } from '../../context/authContext';
import { formatImageUrl } from '../../utils/format';
import {
  getAssignedJudgesRequest,
  getHackathonByIdRequest,
  getRegistrationsRequest,
  registerForHackathonRequest,
} from '../../services/api';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCurrency(value) {
  if (!value) {
    return 'Free';
  }
  return currencyFormatter.format(value);
}

function formatDateRange(start, end) {
  if (!start || !end) {
    return 'Dates coming soon';
  }
  return `${dateFormatter.format(new Date(start))} - ${dateFormatter.format(new Date(end))}`;
}

function formatTeamSize(hackathon) {
  if (hackathon.teamType === 'individual') {
    return 'Individual participation';
  }
  return `${hackathon.minTeamSize} - ${hackathon.maxTeamSize} members`;
}

function getStatusLabel(status) {
  if (status === 'registration_closed') return 'Registration closed';
  if (status === 'ongoing') return 'Ongoing';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Registration Open';
}

function getOrganizerName(createdBy) {
  if (!createdBy) {
    return 'HackSphere Organizer';
  }
  const fullName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ');
  return fullName || createdBy.email || 'HackSphere Organizer';
}

function isRegistrationOpen(hackathon) {
  if (!hackathon) return false;
  if (hackathon.status === 'registration_closed' || hackathon.status === 'completed' || hackathon.status === 'cancelled') {
    return false;
  }
  const now = new Date();
  return now >= new Date(hackathon.registrationStart) && now <= new Date(hackathon.registrationEnd);
}

export default function HackathonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [isAssignedJudge, setIsAssignedJudge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadHackathon = async () => {
      try {
        setLoading(true);
        const [hackRes, regRes, judgeRes] = await Promise.all([
          getHackathonByIdRequest(id),
          isAuthenticated ? getRegistrationsRequest().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
          isAuthenticated ? getAssignedJudgesRequest(id).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        ]);

        if (active) {
          setHackathon(hackRes.data.data);
          const foundReg = regRes.data?.data?.find(
            (r) => (r.hackathon?._id || r.hackathon) === id
          );
          setMyRegistration(foundReg || null);

          const assignedList = Array.isArray(judgeRes.data?.data) ? judgeRes.data.data : [];
          const currentUserId = String(user?.id || user?._id || '');
          const judgeFound = assignedList.some((j) => {
            const judgeId = String(j.judge?._id || j.judge || '');
            return judgeId && judgeId === currentUserId;
          });
          setIsAssignedJudge(judgeFound);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load this hackathon');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHackathon();

    return () => {
      active = false;
    };
  }, [id, isAuthenticated, user]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hackathon?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleRegister = () => {
    if (isHostOrganizer) {
      toast.error('As the host organizer, you manage this event and cannot register as a participant.');
      return;
    }

    if (isAssignedJudge) {
      toast.error('As an assigned judge for this hackathon, you cannot register as a participant.');
      return;
    }

    if (!isRegistrationOpen(hackathon)) {
      toast.error('Registration is closed for this hackathon');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsModalOpen(true);
  };

  const handleRegistrationSubmit = async ({ teamName, memberEmails, paymentProof } = {}) => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerForHackathonRequest({
        hackathonId: hackathon._id,
        teamName,
        memberEmails,
        paymentProof,
      });
      setMyRegistration(res.data.data);
      toast.success(res.data.message || 'Registered successfully!');
      setIsModalOpen(false);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to register for this hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  const isOpen = isRegistrationOpen(hackathon);
  const hostId = hackathon?.createdBy?._id || hackathon?.createdBy;
  const isHostOrganizer = user && hostId && String(hostId) === String(user.id || user._id);

  return (
    <section className="pb-16 text-text-primary">
      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-10">
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {loading ? (
            <Card className="h-96 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={Sparkles}
              title="Could not load this hackathon"
              description={error}
              actionText="Back to hackathons"
              actionTo="/hackathons"
            />
          ) : !hackathon ? (
            <EmptyState
              icon={Sparkles}
              title="Hackathon not found"
              description="This hackathon may have been removed or is no longer available."
              actionText="Back to hackathons"
              actionTo="/hackathons"
            />
          ) : (
            <>
              {/* 1. Hero Header */}
              <Card className="overflow-hidden p-0">
                <div className="relative flex h-56 items-end justify-start overflow-hidden bg-brand-50 sm:h-72">
                  {hackathon.banner ? (
                    <img src={formatImageUrl(hackathon.banner)} alt={hackathon.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Sparkles className="absolute right-8 top-8 h-16 w-16 text-brand-300/40" />
                  )}
                </div>

                <div className="space-y-6 p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{getStatusLabel(hackathon.status)}</Badge>
                    <Badge className="bg-surfaceMuted text-text-secondary border-border">{capitalize(hackathon.mode)}</Badge>
                    {isHostOrganizer ? (
                      <Badge className="bg-brand-50 text-brand-700 border-brand-200 font-semibold">
                        Host Organizer Workspace
                      </Badge>
                    ) : isAssignedJudge ? (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                        Assigned Judge
                      </Badge>
                    ) : myRegistration ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Registered ({capitalize(myRegistration.status)})
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{hackathon.title}</h1>
                    <p className="text-base text-text-secondary">Hosted by {getOrganizerName(hackathon.createdBy)}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {isHostOrganizer ? (
                      <Button
                        as={Link}
                        to={`/organizer/hackathons/${hackathon._id}/manage`}
                        size="lg"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Hackathon
                      </Button>
                    ) : myRegistration ? (
                      <Button
                        as={Link}
                        to={`/hackathons/${hackathon._id}/workspace`}
                        size="lg"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Workspace ({capitalize(myRegistration.status)})
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="lg"
                        disabled={!isOpen}
                        onClick={handleRegister}
                        className={!isOpen ? 'opacity-60 cursor-not-allowed' : ''}
                      >
                        {isOpen ? 'Register now' : 'Registration closed'}
                      </Button>
                    )}

                    <Button
                      as={Link}
                      to={`/hackathons/${hackathon._id}/leaderboard`}
                      variant="secondary"
                      size="lg"
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 2. Quick Facts Grid */}
              <Card className="p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Location</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">{hackathon.location || 'Location TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Registration Window</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Event Dates</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Prize Pool</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">{formatCurrency(hackathon.prizePool)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Team Size</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">{formatTeamSize(hackathon)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Tech Stack Tracks</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(hackathon.techStack) && hackathon.techStack.length > 0 ? (
                          hackathon.techStack.filter(Boolean).map((track) => (
                            <span
                              key={track}
                              className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                            >
                              {track}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                            General
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 3. Register / Registered / Host CTA Banner */}
              {isHostOrganizer ? (
                <Card className="border-brand-200 bg-brand-50/60 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-2">
                        <Settings className="h-4 w-4" />
                        Host Organizer Workspace
                      </div>
                      <h2 className="text-xl font-semibold text-text-primary">You are the host organizer of this hackathon</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Access your organizer control panel to review registrations, assign judges, and transition event lifecycles.
                      </p>
                    </div>

                    <Button as={Link} to={`/organizer/hackathons/${hackathon._id}/manage`} size="lg" className="shrink-0">
                      Manage Hackathon
                    </Button>
                  </div>
                </Card>
              ) : isAssignedJudge ? (
                <Card className="border-purple-200 bg-purple-50/60 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-700 mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        Evaluation Panel Judge
                      </div>
                      <h2 className="text-xl font-semibold text-text-primary">You are assigned as a Judge for this hackathon</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        You are part of the evaluation panel for this event and cannot register as a participant due to conflict of interest rules. Access your Judge Panel to evaluate entries.
                      </p>
                    </div>

                    <Button as={Link} to="/judge/dashboard" size="lg" className="shrink-0">
                      Go to Judge Panel
                    </Button>
                  </div>
                </Card>
              ) : myRegistration ? (
                <Card className="border-brand-200 bg-brand-50/60 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Registration Confirmed ({capitalize(myRegistration.status)})
                      </div>
                      <h2 className="text-xl font-semibold text-text-primary">You are registered for this event</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Access your hacker command center to manage your team roster and submit project entries.
                      </p>
                    </div>

                    <Button as={Link} to={`/hackathons/${hackathon._id}/workspace`} size="lg" className="shrink-0">
                      Go to Workspace
                    </Button>
                  </div>
                </Card>
              ) : isOpen ? (
                <Card className="border-brand-200 bg-brand-50/60 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Registration is live
                      </div>
                      <h2 className="text-xl font-semibold text-text-primary">Ready to build and submit your project?</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Secure your spot before registration closes on {dateFormatter.format(new Date(hackathon.registrationEnd))}.
                      </p>
                    </div>

                    <Button type="button" size="lg" onClick={handleRegister} className="shrink-0">
                      Register for hackathon
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* 4. About Section */}
              <Card className="p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">About this hackathon</h2>
                <p className="text-base leading-7 text-text-secondary whitespace-pre-line">{hackathon.description}</p>
              </Card>

              {/* 5. Rules Section */}
              <Card className="p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Rules & Guidelines</h2>
                <p className="text-sm leading-7 text-text-secondary">
                  All submissions must be original work built during the hackathon period. Teams must respect code of conduct guidelines and submit project links prior to the hackathon deadline.
                </p>
              </Card>

              {/* 6. Requirements Section */}
              <Card className="p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Submission Requirements</h2>
                <p className="text-sm leading-7 text-text-secondary">
                  Participants must provide a public repository link, demo video link, and project description. Detailed submission forms will open once the hackathon starts.
                </p>
              </Card>

              {/* 7. Organizer Information */}
              <Card className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 font-semibold text-lg">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Event Organizer</p>
                    <h3 className="text-base font-semibold text-text-primary">{getOrganizerName(hackathon.createdBy)}</h3>
                  </div>
                </div>
              </Card>

              {/* Registration Modal */}
              <RegistrationModal
                hackathon={hackathon}
                isOpen={isModalOpen}
                onClose={() => {
                  if (!submitting) {
                    setIsModalOpen(false);
                  }
                }}
                onSubmit={handleRegistrationSubmit}
                submitting={submitting}
              />
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}