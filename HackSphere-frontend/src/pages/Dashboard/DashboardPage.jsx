import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Compass, ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getProfileRequest, getRegistrationsRequest, getHackathonsRequest } from '../../services/api';

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

function getRegistrationStatusTone(status) {
  if (status === 'cancelled') {
    return 'border-red-400/20 bg-red-400/10 text-red-200';
  }

  return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [discoverHackathons, setDiscoverHackathons] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [discoverError, setDiscoverError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [profileResponse, registrationsResponse] = await Promise.all([
          getProfileRequest(),
          getRegistrationsRequest(),
        ]);

        if (active) {
          setProfile(profileResponse.data.data);
          setRegistrations(registrationsResponse.data.data);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your dashboard');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

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

  return (
    <section className="relative overflow-hidden bg-slate-950 py-10 text-slate-100 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <PageContainer className="relative">
        <div className="mx-auto max-w-5xl space-y-8">
          {loading ? (
            <Card className="border-white/10 bg-white/5 p-8 text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="space-y-5">
                <div className="h-6 w-32 rounded-full bg-white/10" />
                <div className="h-9 w-3/4 rounded-xl bg-white/10" />
                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                </div>
              </div>
            </Card>
          ) : error ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Could not load your dashboard</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
              <div className="mt-6 flex justify-center">
                <Button type="button" onClick={() => window.location.reload()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Try again
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Welcome Card */}
              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Welcome back</p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-sm text-slate-300">{profile.email}</p>
                  </div>
                  <Badge className="border-white/10 bg-white/10 text-slate-200">{capitalize(profile.role)}</Badge>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                      <p className="mt-1 text-sm text-slate-100">{capitalize(profile.role)}</p>
                    </div>
                  </div>

                  {profile.collegeOrOrganization ? (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">College / Organization</p>
                        <p className="mt-1 text-sm text-slate-100">{profile.collegeOrOrganization}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">Quick actions</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button as={Link} to="/hackathons" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                    Browse hackathons
                  </Button>
                  <Button as={Link} to="/profile" variant="secondary" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                    Edit profile
                  </Button>
                </div>
              </Card>

              {/* My Registrations */}
              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">My registrations</h2>

                {registrations.length === 0 ? (
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    You haven't registered for any hackathons yet. Browse hackathons to find one worth joining.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {registrations.map((registration) => (
                      <div
                        key={registration._id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-white">{registration.hackathon?.title}</h3>
                          <Badge className={getRegistrationStatusTone(registration.status)}>
                            {capitalize(registration.status)}
                          </Badge>
                        </div>

                        <div className="mt-3 flex items-start gap-2">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                          <p className="text-sm text-slate-300">
                            {formatDateRange(registration.hackathon?.hackathonStart, registration.hackathon?.hackathonEnd)}
                          </p>
                        </div>

                        {registration.teamName ? (
                          <div className="mt-2 flex items-start gap-2">
                            <Users className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                            <p className="text-sm text-slate-300">{registration.teamName}</p>
                          </div>
                        ) : null}

                        <Link
                          to={`/hackathons/${registration.hackathon?._id}`}
                          className="mt-4 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          View registration details
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Discover More */}
              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">Discover more</h2>

                {discoverLoading ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="h-32 rounded-2xl bg-white/10" />
                    <div className="h-32 rounded-2xl bg-white/10" />
                    <div className="h-32 rounded-2xl bg-white/10" />
                  </div>
                ) : discoverError ? (
                  <p className="mt-4 text-sm leading-7 text-slate-400">{discoverError}</p>
                ) : discoverHackathons.length === 0 ? (
                  <p className="mt-4 text-sm leading-7 text-slate-400">No published hackathons to show right now.</p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {discoverHackathons.map((item) => (
                      <Link
                        key={item._id}
                        to={`/hackathons/${item._id}`}
                        className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/40 hover:bg-white/10"
                      >
                        <Sparkles className="h-5 w-5 text-cyan-300" />
                        <h3 className="mt-3 text-sm font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDateRange(item.hackathonStart, item.hackathonEnd)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <Button as={Link} to="/hackathons" variant="secondary" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                    <Compass className="h-4 w-4" />
                    View all hackathons
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}