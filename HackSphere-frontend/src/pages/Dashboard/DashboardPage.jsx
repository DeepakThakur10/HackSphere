import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  Compass,
  Sparkles,
  Users,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  MapPin,
  Wifi,
  PlusCircle,
  LayoutGrid,
  CheckCircle2,
  FileClock,
  Rocket,
  UserPlus,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  getProfileRequest,
  getRegistrationsRequest,
  getHackathonsRequest,
  getOrganizerHackathonsRequest,
  getOrganizerMetricsRequest,
  createTeamRequest,
  joinTeamRequest,
} from '../../services/api';

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

function formatDateRange(start, end) {
  if (!start || !end) {
    return 'Dates coming soon';
  }
  return `${dateFormatter.format(new Date(start))} - ${dateFormatter.format(new Date(end))}`;
}

function getHackathonStatusLabel(status) {
  if (status === 'draft') return 'Draft';
  if (status === 'registration_closed') return 'Registration closed';
  if (status === 'ongoing') return 'Ongoing';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Published';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [discoverHackathons, setDiscoverHackathons] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [discoverError, setDiscoverError] = useState('');

  const [organizerHackathons, setOrganizerHackathons] = useState([]);
  const [organizerMetrics, setOrganizerMetrics] = useState(null);
  const [organizerHackathonsLoading, setOrganizerHackathonsLoading] = useState(true);
  const [organizerHackathonsError, setOrganizerHackathonsError] = useState('');

  // Team management state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createTeamNameInput, setCreateTeamNameInput] = useState('');
  const [activeHackathonForTeam, setActiveHackathonForTeam] = useState(null);
  const [teamBusy, setTeamBusy] = useState(false);

  const registrationsRef = useRef(null);
  const organizerSectionRef = useRef(null);

  const scrollToRegistrations = () => {
    registrationsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToOrganizerSection = () => {
    organizerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [profileResponse, registrationsResponse] = await Promise.all([
        getProfileRequest(),
        getRegistrationsRequest(),
      ]);

      setProfile(profileResponse.data.data);
      setRegistrations(registrationsResponse.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) {
        await loadDashboard();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  useEffect(() => {
    let active = true;
    const loadDiscoverHackathons = async () => {
      try {
        setDiscoverLoading(true);
        const response = await getHackathonsRequest({ limit: 3 });

        if (active) {
          setDiscoverHackathons(response.data.data);
          setDiscoverError('');
        }
      } catch (requestError) {
        if (active) {
          setDiscoverError(requestError.response?.data?.message || 'Unable to load hackathons right now');
        }
      } finally {
        if (active) {
          setDiscoverLoading(false);
        }
      }
    };

    loadDiscoverHackathons();
    return () => {
      active = false;
    };
  }, []);

  const loadOrganizerHackathons = useCallback(async () => {
    try {
      setOrganizerHackathonsLoading(true);
      const [listRes, metricsRes] = await Promise.all([
        getOrganizerHackathonsRequest(),
        getOrganizerMetricsRequest(),
      ]);

      setOrganizerHackathons(listRes.data.data);
      setOrganizerMetrics(metricsRes.data.data);
      setOrganizerHackathonsError('');
    } catch (requestError) {
      setOrganizerHackathonsError(requestError.response?.data?.message || 'Unable to load your hackathons');
    } finally {
      setOrganizerHackathonsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (profile?.role !== 'organizer' && profile?.role !== 'admin') {
      return undefined;
    }

    const run = async () => {
      if (active) {
        await loadOrganizerHackathons();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [profile?.role, loadOrganizerHackathons]);

  const handleCreateTeam = async (hackathonId) => {
    if (!createTeamNameInput.trim()) {
      toast.error('Enter a team name');
      return;
    }

    try {
      setTeamBusy(true);
      const res = await createTeamRequest({
        name: createTeamNameInput.trim(),
        hackathonId,
      });
      toast.success('Team created successfully!');
      setCreateTeamNameInput('');
      setActiveHackathonForTeam(null);
      navigate(`/teams/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setTeamBusy(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCodeInput.trim()) {
      toast.error('Enter a valid team invite code');
      return;
    }

    try {
      setTeamBusy(true);
      const res = await joinTeamRequest({ inviteCode: joinCodeInput.trim() });
      toast.success('Joined team successfully!');
      setJoinCodeInput('');
      navigate(`/teams/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join team');
    } finally {
      setTeamBusy(false);
    }
  };

  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin';

  const quickActions = [
    {
      key: 'browse',
      label: 'Browse hackathons',
      description: 'Explore live and upcoming events to join.',
      icon: Compass,
      type: 'link',
      to: '/hackathons',
    },
    isOrganizer
      ? {
          key: 'create',
          label: 'Create hackathon',
          description: 'Publish a new hackathon for participants to join.',
          icon: PlusCircle,
          type: 'link',
          to: '/hackathons/create',
        }
      : {
          key: 'registrations',
          label: 'My registrations',
          description: 'Jump straight to the hackathons you joined.',
          icon: ClipboardList,
          type: 'scroll',
          onClick: scrollToRegistrations,
        },
  ];

  return (
    <section className="pb-16 text-text-primary">
      {error ? (
        <PageContainer className="pt-14">
          <div className="mx-auto max-w-5xl space-y-8">
            <EmptyState
              icon={Rocket}
              title="Could not load your dashboard"
              description={error}
              actionText="Try again"
              onActionClick={loadDashboard}
            />
          </div>
        </PageContainer>
      ) : (
        <>
          {/* Page Hero */}
          {loading ? (
            <PageHero
              badge="Dashboard"
              title="Welcome back 👋"
              description="Loading your personalized dashboard and active hackathons..."
            />
          ) : (
            <PageHero
              badge={capitalize(profile?.role || 'User')}
              title={`Welcome back, ${profile?.firstName} 👋`}
              description={
                isOrganizer
                  ? "Here's a quick look at your organizer activity — track your hackathons, keep an eye on registrations, and publish new events when you're ready."
                  : "Here's a quick look at your hackathon journey — track registrations, manage teams, and discover new events."
              }
              actions={
                profile?.role === 'admin' ? (
                  <>
                    <Button as={Link} to="/admin/dashboard" size="lg">
                      <ShieldCheck className="h-4 w-4" />
                      Admin Console
                    </Button>
                    <Button as={Link} to="/hackathons/create" variant="secondary" size="lg">
                      <PlusCircle className="h-4 w-4" />
                      Create hackathon
                    </Button>
                  </>
                ) : isOrganizer ? (
                  <>
                    <Button as={Link} to="/hackathons/create" size="lg">
                      <PlusCircle className="h-4 w-4" />
                      Create hackathon
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={scrollToOrganizerSection}
                    >
                      View organizer overview
                    </Button>
                  </>
                ) : (
                  <Button as={Link} to="/hackathons" size="lg">
                    Browse hackathons
                  </Button>
                )
              }
            />
          )}

          {/* Organizer Section */}
          {isOrganizer && !loading ? (
            <PageContainer className="pt-10">
              <div ref={organizerSectionRef} className="mx-auto max-w-5xl space-y-10 scroll-mt-24">
                {/* Overview Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-text-primary">Organizer overview</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Track your hackathons and registrations at a glance.
                    </p>
                  </div>

                  <Button as={Link} to="/hackathons/create">
                    <PlusCircle className="h-4 w-4" />
                    Create hackathon
                  </Button>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Hackathons"
                    icon={LayoutGrid}
                    value={organizerMetrics?.totalHackathons ?? 0}
                    helpText="Events created"
                  />
                  <StatCard
                    label="Published Hackathons"
                    icon={CheckCircle2}
                    value={organizerMetrics?.published ?? 0}
                    helpText="Active on platform"
                  />
                  <StatCard
                    label="Draft Hackathons"
                    icon={FileClock}
                    value={organizerMetrics?.drafts ?? 0}
                    helpText="In progress"
                  />
                  <StatCard
                    label="Total Registrations"
                    icon={Users}
                    value={organizerMetrics?.registrations ?? 0}
                    helpText="Hacker applications"
                  />
                </div>

                {/* My Hackathons Card */}
                <Card className="p-6 sm:p-8 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary">My hackathons</h2>

                  {organizerHackathonsLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="h-32 rounded-2xl bg-surfaceMuted animate-pulse" />
                      <div className="h-32 rounded-2xl bg-surfaceMuted animate-pulse" />
                    </div>
                  ) : organizerHackathonsError ? (
                    <EmptyState
                      title="Unable to load hackathons"
                      description={organizerHackathonsError}
                      actionText="Try again"
                      onActionClick={loadOrganizerHackathons}
                    />
                  ) : organizerHackathons.length === 0 ? (
                    <EmptyState
                      icon={Rocket}
                      title="Your hackathons will appear here"
                      description="Once you publish a hackathon, you'll be able to manage it and track its registrations from this section."
                      actionText="Create your first hackathon"
                      actionTo="/hackathons/create"
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {organizerHackathons.map((hackathon) => (
                        <Card
                          key={hackathon._id}
                          className="group flex flex-col justify-between p-5 transition hover:-translate-y-1 hover:shadow-card"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-lg font-semibold leading-snug text-text-primary">{hackathon.title}</h3>
                              <Badge>{getHackathonStatusLabel(hackathon.status)}</Badge>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-text-secondary">
                              <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                <p>Registration: {formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}</p>
                              </div>

                              <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                <p>Event: {formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}</p>
                              </div>

                              <div className="flex items-start gap-2">
                                {hackathon.mode === 'online' ? (
                                  <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                ) : (
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                )}
                                <p>{capitalize(hackathon.mode)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-2">
                            <Button
                              as={Link}
                              to={`/organizer/hackathons/${hackathon._id}/manage`}
                              size="sm"
                            >
                              <Settings className="h-3.5 w-3.5" />
                              Manage
                            </Button>
                            <Button
                              as={Link}
                              to={`/organizer/hackathons/${hackathon._id}/registrations`}
                              variant="secondary"
                              size="sm"
                            >
                              <Users className="h-3.5 w-3.5" />
                              Registrations
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </PageContainer>
          ) : null}

          {/* Participant Section */}
          {!isOrganizer && !loading ? (
            <PageContainer className="pt-10">
              <div className="mx-auto max-w-5xl space-y-10">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary">Quick actions</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      const cardClassName =
                        'group flex items-start gap-4 rounded-2xl border border-border bg-white p-6 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-card';

                      const content = (
                        <>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-text-primary">{action.label}</p>
                            <p className="mt-1 text-sm leading-6 text-text-secondary">{action.description}</p>
                          </div>
                          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-600" />
                        </>
                      );

                      if (action.type === 'scroll') {
                        return (
                          <button key={action.key} type="button" onClick={action.onClick} className={cardClassName}>
                            {content}
                          </button>
                        );
                      }

                      return (
                        <Link key={action.key} to={action.to} className={cardClassName}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Join Team via Invite Code Card */}
                <Card className="p-6 sm:p-8 space-y-4 border-brand-100 bg-brand-50/40">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-text-primary">Have a Team Invite Code?</h2>
                  </div>
                  <p className="text-sm text-text-secondary">
                    If your captain created a team and shared an invite code, enter it below to join the roster.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      placeholder="e.g. HS-9X2K7L"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      disabled={teamBusy}
                      className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                    />
                    <Button type="button" size="md" onClick={handleJoinTeam} disabled={teamBusy}>
                      Join Team
                    </Button>
                  </div>
                </Card>

                {/* My Registrations */}
                <Card
                  id="registrations"
                  ref={registrationsRef}
                  className="scroll-mt-24 p-6 sm:p-8 space-y-6"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary">My registrations</h2>

                  {registrations.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="No registrations yet"
                      description="You haven't registered for any hackathons yet. Browse hackathons to find one worth joining."
                      actionText="Browse hackathons"
                      actionTo="/hackathons"
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {registrations.map((registration) => {
                        const isTeamHackathon = registration.hackathon?.teamType === 'team';
                        const teamId = registration.team?._id || registration.team;
                        const hackId = registration.hackathon?._id || registration.hackathon;

                        return (
                          <Card
                            key={registration._id}
                            className="flex flex-col justify-between p-5 transition hover:shadow-card space-y-4"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-lg font-semibold leading-snug text-text-primary">
                                  {registration.hackathon?.title}
                                </h3>
                                <Badge>{capitalize(registration.status)}</Badge>
                              </div>

                              <div className="mt-4 space-y-2 text-sm text-text-secondary">
                                <div className="flex items-start gap-2">
                                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                  <p>
                                    {formatDateRange(
                                      registration.hackathon?.hackathonStart,
                                      registration.hackathon?.hackathonEnd
                                    )}
                                  </p>
                                </div>

                                {teamId ? (
                                  <div className="flex items-start gap-2 text-brand-700 font-medium">
                                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>Team Roster Assigned</p>
                                  </div>
                                ) : isTeamHackathon ? (
                                  <div className="flex items-start gap-2 text-amber-700">
                                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>Team required for this event</p>
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border flex flex-wrap gap-2 items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button as={Link} to={`/hackathons/${hackId}/workspace`} size="sm">
                                  <LayoutDashboard className="h-3.5 w-3.5" />
                                  Workspace
                                </Button>
                                {teamId ? (
                                  <Button as={Link} to={`/teams/${teamId}`} variant="secondary" size="sm">
                                    <Users className="h-3.5 w-3.5" />
                                    Team
                                  </Button>
                                ) : null}
                              </div>

                              {!teamId && isTeamHackathon ? (
                                activeHackathonForTeam === hackId ? (
                                  <div className="w-full space-y-2 pt-2">
                                    <input
                                      type="text"
                                      placeholder="Enter new team name"
                                      value={createTeamNameInput}
                                      onChange={(e) => setCreateTeamNameInput(e.target.value)}
                                      className="w-full rounded-xl border border-border px-3 py-2 text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleCreateTeam(hackId)}
                                        disabled={teamBusy}
                                      >
                                        Create
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setActiveHackathonForTeam(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setActiveHackathonForTeam(hackId)}
                                  >
                                    <Users className="h-3.5 w-3.5" />
                                    Create Team
                                  </Button>
                                )
                              ) : null}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </PageContainer>
          ) : null}
        </>
      )}
    </section>
  );
}