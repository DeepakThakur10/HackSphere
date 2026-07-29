import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  getProfileRequest,
  getRegistrationsRequest,
  getHackathonsRequest,
  getOrganizerHackathonsRequest,
} from '../../services/api';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

// TODO: no "/hackathons/create" (or similar) route exists in AppRoutes.jsx yet.
// Flip this to true once a Create Hackathon route/page is added so the
// organizer quick action below can safely link to it.
const CREATE_HACKATHON_ROUTE_EXISTS = false;

// TODO: Organizer statistic values are placeholders until the backend
// exposes counts (Total/Published/Draft hackathons and Total Registrations).
// GET /api/hackathons/mine now returns the organizer's own hackathon list,
// but not aggregate counts across all pages — see conversation notes.
const organizerStatCards = [
  {
    key: 'total',
    label: 'Total Hackathons',
    icon: LayoutGrid,
  },
  {
    key: 'published',
    label: 'Published Hackathons',
    icon: CheckCircle2,
  },
  {
    key: 'draft',
    label: 'Draft Hackathons',
    icon: FileClock,
  },
  {
    key: 'registrations',
    label: 'Total Registrations',
    icon: Users,
  },
];

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

function getRegistrationStatusTone(status) {
  if (status === 'cancelled') {
    return 'border-l-red-400 bg-red-400/5';
  }

  return 'border-l-emerald-400 bg-emerald-400/5';
}

function getRegistrationBadgeTone(status) {
  if (status === 'cancelled') {
    return 'border-red-400/20 bg-red-400/10 text-red-200';
  }

  return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
}

function getHackathonStatusTone(status) {
  if (status === 'draft') {
    return 'border-l-amber-400 bg-amber-400/5';
  }

  if (status === 'cancelled') {
    return 'border-l-red-400 bg-red-400/5';
  }

  return 'border-l-emerald-400 bg-emerald-400/5';
}

function getHackathonStatusBadgeTone(status) {
  if (status === 'draft') {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  }

  if (status === 'cancelled') {
    return 'border-red-400/20 bg-red-400/10 text-red-200';
  }

  return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
}

function getHackathonStatusLabel(status) {
  if (status === 'draft') {
    return 'Draft';
  }

  if (status === 'registration_closed') {
    return 'Registration closed';
  }

  if (status === 'ongoing') {
    return 'Ongoing';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

  return 'Published';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [discoverHackathons, setDiscoverHackathons] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [discoverError, setDiscoverError] = useState('');

  const [organizerHackathons, setOrganizerHackathons] = useState([]);
  const [organizerHackathonsLoading, setOrganizerHackathonsLoading] = useState(true);
  const [organizerHackathonsError, setOrganizerHackathonsError] = useState('');

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
      const response = await getOrganizerHackathonsRequest();

      setOrganizerHackathons(response.data.data);
      setOrganizerHackathonsError('');
    } catch (requestError) {
      setOrganizerHackathonsError(requestError.response?.data?.message || 'Unable to load your hackathons');
    } finally {
      setOrganizerHackathonsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (profile?.role !== 'organizer') {
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

  const isOrganizer = profile?.role === 'organizer';
  const showCreateHackathonAction = isOrganizer && CREATE_HACKATHON_ROUTE_EXISTS;

  const quickActions = [
    {
      key: 'browse',
      label: 'Browse hackathons',
      description: 'Explore live and upcoming events to join.',
      icon: Compass,
      type: 'link',
      to: '/hackathons',
    },
    showCreateHackathonAction
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
    <section className="relative overflow-hidden bg-slate-950 pb-16 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />

      {error ? (
        <PageContainer className="relative pt-14">
          <div className="mx-auto max-w-5xl space-y-8">
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Could not load your dashboard</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
              <div className="mt-6 flex justify-center">
                <Button type="button" onClick={loadDashboard} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Try again
                </Button>
              </div>
            </Card>
          </div>
        </PageContainer>
      ) : (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden border-b border-white/10">
            {/* TODO(reactbits): Aurora / Animated Grid background goes here */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.16),transparent_55%)]" />
            <PageContainer className="relative py-14 sm:py-20">
              <div className="mx-auto max-w-5xl">
                {loading ? (
                  <div className="space-y-5">
                    <div className="h-6 w-28 rounded-full bg-white/10" />
                    <div className="h-11 w-3/4 rounded-xl bg-white/10" />
                    <div className="h-4 w-full max-w-xl rounded-full bg-white/10" />
                    <div className="h-4 w-40 rounded-full bg-white/10" />
                    <div className="h-11 w-48 rounded-full bg-white/10" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">{capitalize(profile.role)}</Badge>
                    <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      Welcome back, {profile.firstName} 👋
                    </h1>
                    <p className="max-w-xl text-base leading-7 text-slate-300">
                      {isOrganizer
                        ? "Here's a quick look at your organizer activity — track your hackathons, keep an eye on registrations, and publish new events when you're ready."
                        : "Here's a quick look at your hackathon journey — track registrations, discover new events, and keep your profile fresh."}
                    </p>
                    <p className="text-sm text-slate-400">{profile.email}</p>
                    <div className="pt-2">
                      {isOrganizer ? (
                        <Button
                          type="button"
                          onClick={scrollToOrganizerSection}
                          className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        >
                          View organizer overview
                        </Button>
                      ) : (
                        <Button as={Link} to="/hackathons" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                          Browse hackathons
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </PageContainer>
          </div>

          {isOrganizer ? (
            <PageContainer className="relative pt-10">
              <div ref={organizerSectionRef} className="mx-auto max-w-5xl space-y-10 scroll-mt-24">
                {/* Organizer Overview */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">Organizer overview</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Track your hackathons and registrations at a glance.
                    </p>
                  </div>

                  {CREATE_HACKATHON_ROUTE_EXISTS ? (
                    <Button as={Link} to="/hackathons/create" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      <PlusCircle className="h-4 w-4" />
                      Create hackathon
                    </Button>
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <Button
                        type="button"
                        disabled
                        className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create hackathon
                      </Button>
                      <span className="text-xs text-slate-500">Coming soon</span>
                    </div>
                  )}
                </div>

                {/* Organizer Statistics */}
                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="h-32 rounded-3xl bg-white/10" />
                    <div className="h-32 rounded-3xl bg-white/10" />
                    <div className="h-32 rounded-3xl bg-white/10" />
                    <div className="h-32 rounded-3xl bg-white/10" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {organizerStatCards.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <Card
                          key={stat.key}
                          className="border-white/10 bg-white/5 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                            <Icon className="h-5 w-5" />
                          </span>
                          {/* TODO: replace placeholder "—" with real data once a
                              stats-capable endpoint exists (see TODO above
                              organizerStatCards). */}
                          <p className="mt-4 text-2xl font-semibold tracking-tight text-white">—</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                          <p className="mt-3 text-xs text-slate-500">Live data coming soon</p>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* My Hackathons */}
                <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                  <h2 className="text-xl font-semibold tracking-tight text-white">My hackathons</h2>

                  {organizerHackathonsLoading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="h-32 rounded-2xl bg-white/10" />
                      <div className="h-32 rounded-2xl bg-white/10" />
                    </div>
                  ) : organizerHackathonsError ? (
                    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
                      <p className="text-sm leading-6 text-slate-300">{organizerHackathonsError}</p>
                      <Button
                        type="button"
                        onClick={loadOrganizerHackathons}
                        className="mt-5 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        Try again
                      </Button>
                    </div>
                  ) : organizerHackathons.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                        <Rocket className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-white">Your hackathons will appear here</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        Once you publish a hackathon, you'll be able to manage it and track its registrations from
                        this section.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {organizerHackathons.map((hackathon) => (
                        <div
                          key={hackathon._id}
                          className={`rounded-2xl border border-white/10 border-l-4 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.16)] ${getHackathonStatusTone(hackathon.status)}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold leading-snug text-white">{hackathon.title}</h3>
                            <Badge className={getHackathonStatusBadgeTone(hackathon.status)}>
                              {getHackathonStatusLabel(hackathon.status)}
                            </Badge>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              <p className="text-sm text-slate-300">
                                Registration: {formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              <p className="text-sm text-slate-300">
                                Event: {formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              {hackathon.mode === 'online' ? (
                                <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              ) : (
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              )}
                              <p className="text-sm text-slate-300">{capitalize(hackathon.mode)}</p>
                            </div>
                          </div>

                          <Button
                            as={Link}
                            to={`/hackathons/${hackathon._id}`}
                            className="mt-5 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                          >
                            View details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </PageContainer>
          ) : null}

          {!isOrganizer ? (
            <PageContainer className="relative pt-10">
              <div className="mx-auto max-w-5xl space-y-10">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">Quick actions</h2>
                  {loading ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="h-24 rounded-3xl bg-white/10" />
                      <div className="h-24 rounded-3xl bg-white/10" />
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        const cardClassName =
                          'group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-[0_20px_45px_rgba(0,0,0,0.28)]';

                        const content = (
                          <>
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="flex-1">
                              <p className="text-base font-semibold text-white">{action.label}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-400">{action.description}</p>
                            </div>
                            <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
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
                  )}
                </div>

                {/* My Registrations */}
                <Card
                  id="registrations"
                  ref={registrationsRef}
                  className="scroll-mt-24 border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-white">My registrations</h2>

                  {loading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="h-32 rounded-2xl bg-white/10" />
                      <div className="h-32 rounded-2xl bg-white/10" />
                    </div>
                  ) : registrations.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                        <ClipboardList className="h-6 w-6" />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-white">No registrations yet</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        You haven't registered for any hackathons yet. Browse hackathons to find one worth joining.
                      </p>
                      <Button as={Link} to="/hackathons" className="mt-5 bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                        Browse hackathons
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {registrations.map((registration) => (
                        <div
                          key={registration._id}
                          className={`rounded-2xl border border-white/10 border-l-4 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.16)] ${getRegistrationStatusTone(registration.status)}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold leading-snug text-white">{registration.hackathon?.title}</h3>
                            <Badge className={getRegistrationBadgeTone(registration.status)}>
                              {capitalize(registration.status)}
                            </Badge>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                              <p className="text-sm text-slate-300">
                                {formatDateRange(registration.hackathon?.hackathonStart, registration.hackathon?.hackathonEnd)}
                              </p>
                            </div>

                            {registration.teamName ? (
                              <div className="flex items-start gap-2">
                                <Users className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                                <p className="text-sm text-slate-300">{registration.teamName}</p>
                              </div>
                            ) : null}
                          </div>

                          <Link
                            to={`/hackathons/${registration.hackathon?._id}`}
                            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                          >
                            View registration details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Discover More */}
                <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold tracking-tight text-white">Discover more</h2>
                    <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  </div>

                  {discoverLoading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="h-36 rounded-2xl bg-white/10" />
                      <div className="h-36 rounded-2xl bg-white/10" />
                      <div className="h-36 rounded-2xl bg-white/10" />
                    </div>
                  ) : discoverError ? (
                    <p className="mt-4 text-sm leading-7 text-slate-400">{discoverError}</p>
                  ) : discoverHackathons.length === 0 ? (
                    <p className="mt-4 text-sm leading-7 text-slate-400">No published hackathons to show right now.</p>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {discoverHackathons.map((item) => (
                        <Link
                          key={item._id}
                          to={`/hackathons/${item._id}`}
                          className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
                        >
                          <div>
                            <Sparkles className="h-5 w-5 text-cyan-300" />
                            <h3 className="mt-3 text-sm font-semibold leading-snug text-white">{item.title}</h3>
                            <p className="mt-2 text-xs text-slate-400">
                              {formatDateRange(item.hackathonStart, item.hackathonEnd)}
                            </p>
                            {item.mode ? (
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                                {item.mode === 'online' ? <Wifi className="h-3.5 w-3.5 text-cyan-300" /> : <MapPin className="h-3.5 w-3.5 text-cyan-300" />}
                                {capitalize(item.mode)}
                              </p>
                            ) : null}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 transition group-hover:text-cyan-200">
                            View details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button as={Link} to="/hackathons" variant="secondary" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                      <Compass className="h-4 w-4" />
                      View all hackathons
                    </Button>
                  </div>
                </Card>
              </div>
            </PageContainer>
          ) : null}
        </>
      )}
    </section>
  );
}