import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Layers3, MapPin, Share2, Sparkles, Trophy, Users } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RegistrationModal from '../../components/registration/RegistrationModal';
import { useAuth } from '../../context/authContext';
import { getHackathonByIdRequest, registerForHackathonRequest } from '../../services/api';

// TODO: duplicated from HackathonsPage.jsx (not exported there). Extract to a
// shared src/utils/format.js if this duplication grows further.
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

  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
}

function formatTeamSize(hackathon) {
  if (hackathon.teamType === 'individual') {
    return 'Individual participation';
  }

  return `${hackathon.minTeamSize} - ${hackathon.maxTeamSize} members`;
}

function getStatusLabel(status) {
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

function getOrganizerName(createdBy) {
  if (!createdBy) {
    return 'HackSphere Organizer';
  }

  const fullName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ');

  return fullName || createdBy.email || 'HackSphere Organizer';
}

function isRegistrationOpen(hackathon) {
  return hackathon.status === 'published' && new Date() <= new Date(hackathon.registrationEnd);
}

export default function HackathonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadHackathon = async () => {
      try {
        setLoading(true);
        const response = await getHackathonByIdRequest(id);

        if (active) {
          setHackathon(response.data.data);
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
  }, [id]);

  const handleShare = () => {
    // TODO: wire up real share behaviour (navigator.share / copy link) once
    // designs for this interaction are finalised. UI only for now.
  };

  const handleRegister = () => {
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

  const handleRegistrationSubmit = async (payload) => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await registerForHackathonRequest(id, payload);
      toast.success('Registered successfully');
      setIsModalOpen(false);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-10 text-slate-100 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <PageContainer className="relative">
        <div className="mx-auto max-w-5xl space-y-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {loading ? (
            <Card className="border-white/10 bg-white/5 p-8 text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="space-y-5">
                <div className="h-6 w-32 rounded-full bg-white/10" />
                <div className="h-9 w-3/4 rounded-xl bg-white/10" />
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-4 w-5/6 rounded-full bg-white/10" />
                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                </div>
              </div>
            </Card>
          ) : error ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Could not load this hackathon</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button type="button" onClick={() => window.location.reload()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Try again
                </Button>
                <Button as={Link} to="/hackathons" variant="secondary" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                  Back to hackathons
                </Button>
              </div>
            </Card>
          ) : !hackathon ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Hackathon not found</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This hackathon may have been removed or is no longer available.
              </p>
              <div className="mt-6 flex justify-center">
                <Button as={Link} to="/hackathons" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Back to hackathons
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden border-white/10 bg-white/5 p-0 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                {/* TODO(reactbits): banner reveal / parallax animation placeholder */}
                <div className="relative flex h-56 items-end justify-start overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_45%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))] sm:h-72">
                  {hackathon.banner ? (
                    <img src={hackathon.banner} alt={hackathon.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  ) : (
                    <Sparkles className="absolute right-8 top-8 h-16 w-16 text-cyan-400/20" />
                  )}
                </div>

                <div className="space-y-6 p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">{getStatusLabel(hackathon.status)}</Badge>
                    <Badge className="border-white/10 bg-white/10 text-slate-200">{capitalize(hackathon.mode)}</Badge>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{hackathon.title}</h1>
                    <p className="text-sm text-slate-300">Hosted by {getOrganizerName(hackathon.createdBy)}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleRegister} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      Register now
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleShare}
                      className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Location</p>
                      <p className="mt-1 text-sm text-slate-100">{hackathon.location || 'Location TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Registration</p>
                      <p className="mt-1 text-sm text-slate-100">
                        {formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Event dates</p>
                      <p className="mt-1 text-sm text-slate-100">
                        {formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prize pool</p>
                      <p className="mt-1 text-sm text-slate-100">{formatCurrency(hackathon.prizePool)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Team size</p>
                      <p className="mt-1 text-sm text-slate-100">{formatTeamSize(hackathon)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tracks</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(hackathon.techStack) && hackathon.techStack.length > 0 ? (
                          hackathon.techStack.filter(Boolean).map((track) => (
                            <span
                              key={track}
                              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                            >
                              {track}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                            General
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">About this hackathon</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{hackathon.description}</p>
              </Card>

              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">Rules</h2>
                {/* TODO: the Hackathon model has no `rules` field yet. Once the
                    backend adds one, replace this placeholder with hackathon.rules. */}
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Rules for this hackathon have not been published yet. Check back closer to the event date.
                </p>
              </Card>

              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">Requirements</h2>
                {/* TODO: the Hackathon model has no `requirements` field yet.
                    Once the backend adds one, replace this placeholder with hackathon.requirements. */}
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Requirements for this hackathon have not been published yet.
                </p>
              </Card>

              <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">Related hackathons</h2>
                {/* TODO: no backend endpoint for related/similar hackathons yet
                    (e.g. by shared tracks or organizer). Wire this up once one
                    exists — placeholder only, no data fetched here. */}
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Related hackathons will appear here once this feature is available.
                </p>
              </Card>

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