import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Archive,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  Play,
  Rocket,
  ShieldAlert,
  Trash2,
  Users,
  Wifi,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  deleteHackathonRequest,
  getHackathonByIdRequest,
  updateHackathonStatusRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const NEXT_STATUS_MAP = {
  draft: { target: 'published', label: 'Publish Hackathon', icon: Rocket, variant: 'primary' },
  published: { target: 'registration_closed', label: 'Close Registration', icon: Clock, variant: 'secondary' },
  registration_closed: { target: 'ongoing', label: 'Start Hackathon', icon: Play, variant: 'primary' },
  ongoing: { target: 'judging', label: 'Start Judging', icon: FileText, variant: 'primary' },
  judging: { target: 'completed', label: 'Publish Results', icon: CheckCircle2, variant: 'primary' },
  completed: { target: 'archived', label: 'Archive Hackathon', icon: Archive, variant: 'secondary' },
};

export default function ManageHackathonPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonByIdRequest(id);
        if (active) {
          setHackathon(res.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load hackathon details');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchHackathon();

    return () => {
      active = false;
    };
  }, [id]);

  const handleStatusTransition = async (targetStatus) => {
    if (!window.confirm(`Transition hackathon status to '${targetStatus}'?`)) return;

    try {
      setBusy(true);
      const res = await updateHackathonStatusRequest(id, targetStatus);
      setHackathon(res.data.data);
      toast.success(`Hackathon status updated to '${targetStatus}'`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteHackathon = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this hackathon? This action cannot be undone.')) return;

    try {
      setBusy(true);
      await deleteHackathonRequest(id);
      toast.success('Hackathon deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hackathon');
    } finally {
      setBusy(false);
    }
  };

  const currentTransition = hackathon ? NEXT_STATUS_MAP[hackathon.status] : null;

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Organizer Workspace"
        title={hackathon ? hackathon.title : 'Manage Hackathon'}
        description="Lifecycle management workspace — update event status, manage participant registrations, assign evaluation panel judges, and control event visibility."
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
              title="Could not load hackathon workspace"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : !hackathon ? (
            <EmptyState
              icon={Rocket}
              title="Hackathon not found"
              description="The requested hackathon does not exist or has been deleted."
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* 1. Stat Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Current Status"
                  icon={Clock}
                  value={capitalize(hackathon.status)}
                  helpText="Event lifecycle state"
                />
                <StatCard
                  label="Participation Format"
                  icon={Users}
                  value={capitalize(hackathon.teamType)}
                  helpText={`Max team size: ${hackathon.maxTeamSize}`}
                />
                <StatCard
                  label="Event Mode"
                  icon={hackathon.mode === 'online' ? Wifi : MapPin}
                  value={capitalize(hackathon.mode)}
                  helpText={hackathon.location || 'Virtual venue'}
                />
              </div>

              {/* 2. Lifecycle Actions Bar */}
              <Card className="p-6 sm:p-8 border-brand-100 bg-brand-50/40 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Lifecycle Action</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                      Status: {capitalize(hackathon.status)}
                    </h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      Execute the next logical transition in the hackathon state machine
                    </p>
                  </div>

                  {currentTransition ? (
                    <Button
                      type="button"
                      size="lg"
                      variant={currentTransition.variant}
                      onClick={() => handleStatusTransition(currentTransition.target)}
                      disabled={busy}
                    >
                      <currentTransition.icon className="h-4 w-4" />
                      {currentTransition.label}
                    </Button>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700">Lifecycle Complete ({capitalize(hackathon.status)})</Badge>
                  )}
                </div>
              </Card>

              {/* 3. Navigation & Management Tools */}
              <FormSection
                icon={Users}
                title="Management Tools"
                description="Jump to registration rosters, judge assignments, and public landing pages"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Link
                    to={`/organizer/hackathons/${hackathon._id}/registrations`}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-5 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Registrations</p>
                        <p className="text-xs text-text-secondary">Review & approve hackers</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/organizer/hackathons/${hackathon._id}/judges`}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-5 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <Award className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Assign Judges</p>
                        <p className="text-xs text-text-secondary">Manage evaluation panel</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/hackathons/${hackathon._id}`}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-5 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <Eye className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Public Page</p>
                        <p className="text-xs text-text-secondary">Preview event view</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </FormSection>

              {/* 4. Danger Zone */}
              <FormSection
                icon={Trash2}
                title="Danger Zone"
                description="Irreversible event actions"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-600">Delete Hackathon</p>
                    <p className="text-xs text-text-secondary">
                      Permanently remove this event and disassociate all registrations.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleDeleteHackathon}
                    disabled={busy}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Hackathon
                  </Button>
                </div>
              </FormSection>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
