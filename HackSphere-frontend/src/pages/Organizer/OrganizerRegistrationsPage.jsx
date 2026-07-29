import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  CheckCircle2,
  Clock,
  Search,
  ShieldAlert,
  Users,
  XCircle,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  approveRegistrationRequest,
  getHackathonByIdRequest,
  getOrganizerRegistrationsRequest,
  rejectRegistrationRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function OrganizerRegistrationsPage() {
  const { hackathonId } = useParams();

  const [hackathon, setHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonRes, regRes] = await Promise.all([
          getHackathonByIdRequest(hackathonId),
          getOrganizerRegistrationsRequest(hackathonId),
        ]);

        if (active) {
          setHackathon(hackathonRes.data.data);
          setRegistrations(regRes.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load registrations');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [hackathonId]);

  const handleApprove = async (id) => {
    try {
      setBusyId(id);
      await approveRegistrationRequest(id);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'approved' } : r))
      );
      toast.success('Registration approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve registration');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setBusyId(id);
      await rejectRegistrationRequest(id);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'rejected' } : r))
      );
      toast.success('Registration rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject registration');
    } finally {
      setBusyId(null);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const nameMatch = `${reg.user?.firstName} ${reg.user?.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = reg.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const teamMatch = (reg.team?.name || reg.teamName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || emailMatch || teamMatch;
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Organizer Control Panel"
        title="Manage Registrations"
        description={
          hackathon
            ? `Review, approve, and manage registered hackers for ${hackathon.title}.`
            : 'Review, approve, and manage registered hackers.'
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load registrations"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* Search & Filter Toolbar */}
              <Card className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search participant name, email, or team name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          statusFilter === status
                            ? 'bg-brand-600 text-white shadow-soft'
                            : 'bg-white border border-border text-text-secondary hover:bg-brand-50'
                        }`}
                      >
                        {capitalize(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Registrations List */}
              {filteredRegistrations.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No registrations found"
                  description="No registrations match your search query or filter selection."
                />
              ) : (
                <div className="space-y-4">
                  {filteredRegistrations.map((reg) => {
                    const isBusy = busyId === reg._id;

                    return (
                      <Card key={reg._id} className="p-6 transition hover:shadow-card">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* User Details */}
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 font-semibold text-brand-700">
                              {reg.user?.profilePicture ? (
                                <img
                                  src={reg.user.profilePicture}
                                  alt={reg.user.firstName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {reg.user?.firstName?.charAt(0)}
                                  {reg.user?.lastName?.charAt(0)}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-semibold text-text-primary">
                                  {reg.user?.firstName} {reg.user?.lastName}
                                </h3>
                                <Badge
                                  className={
                                    reg.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : reg.status === 'rejected'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }
                                >
                                  {reg.status === 'approved' ? (
                                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                  ) : reg.status === 'rejected' ? (
                                    <XCircle className="h-3 w-3 inline mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 inline mr-1" />
                                  )}
                                  {capitalize(reg.status)}
                                </Badge>
                              </div>

                              <p className="text-xs text-text-secondary">
                                @{reg.user?.username || 'user'} • {reg.user?.email}
                              </p>

                              {(reg.team?.name || reg.teamName) ? (
                                <div className="pt-1 flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-brand-600" />
                                  <span className="text-xs font-medium text-brand-700">
                                    Team: {reg.team?.name || reg.teamName}
                                  </span>
                                  {reg.team?._id ? (
                                    <Link
                                      to={`/teams/${reg.team._id}`}
                                      className="text-xs text-text-muted hover:text-brand-700 underline"
                                    >
                                      View roster
                                    </Link>
                                  ) : null}
                                </div>
                              ) : null}

                              {Array.isArray(reg.memberEmails) && reg.memberEmails.length > 0 ? (
                                <p className="text-xs text-text-muted">
                                  Invited Teammates: {reg.memberEmails.join(', ')}
                                </p>
                              ) : null}

                              {reg.paymentProof ? (
                                <div className="pt-1">
                                  <a
                                    href={reg.paymentProof}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                  >
                                    View Payment Receipt / Proof
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Organizer Action Buttons */}
                          <div className="flex items-center gap-2 sm:self-center">
                            {reg.status !== 'approved' ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleApprove(reg._id)}
                                disabled={isBusy}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                            ) : null}

                            {reg.status !== 'rejected' ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleReject(reg._id)}
                                disabled={isBusy}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
