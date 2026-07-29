import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Eye,
  LayoutGrid,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  adminDeleteHackathonRequest,
  adminOverrideHackathonStatusRequest,
  getAdminHackathonsRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminHackathonsPage() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await getAdminHackathonsRequest();
      setHackathons(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) {
        await fetchHackathons();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusOverride = async (hackathonId, newStatus) => {
    try {
      setBusyId(hackathonId);
      const res = await adminOverrideHackathonStatusRequest(hackathonId, newStatus);
      toast.success(res.data.message);
      setHackathons((prev) => prev.map((h) => (h._id === hackathonId ? res.data.data : h)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteHackathon = async (hackathonId, title) => {
    if (!window.confirm(`Permanently delete hackathon "${title}"? This action cannot be undone.`)) return;

    try {
      setBusyId(hackathonId);
      await adminDeleteHackathonRequest(hackathonId);
      toast.success('Hackathon deleted by administrator');
      setHackathons((prev) => prev.filter((h) => h._id !== hackathonId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hackathon');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Admin Control Panel"
        title="Global Hackathons Supervision"
        description="Supervise all platform hackathons, override lifecycle status, and manage platform listings."
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Console
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">Global Platform Hackathons</h2>

            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-surfaceMuted" />
            ) : error ? (
              <EmptyState icon={ShieldAlert} title="Could not load hackathons" description={error} />
            ) : hackathons.length === 0 ? (
              <EmptyState icon={LayoutGrid} title="No hackathons found" description="No hackathons have been created on the platform yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                      <th className="py-3 px-4">Hackathon</th>
                      <th className="py-3 px-4">Organizer</th>
                      <th className="py-3 px-4">Status Override</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {hackathons.map((h) => (
                      <tr key={h._id} className="hover:bg-brand-50/40 transition">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-text-primary">{h.title}</p>
                          <p className="text-xs text-text-secondary">{capitalize(h.mode)} • {capitalize(h.teamType)}</p>
                        </td>

                        <td className="py-4 px-4">
                          <p className="text-xs font-medium text-text-primary">
                            {h.createdBy ? `${h.createdBy.firstName} ${h.createdBy.lastName}` : 'System'}
                          </p>
                          {h.createdBy ? <p className="text-[11px] text-text-secondary">@{h.createdBy.username}</p> : null}
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={h.status}
                            onChange={(e) => handleStatusOverride(h._id, e.target.value)}
                            disabled={busyId === h._id}
                            className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="registration_closed">Registration Closed</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="judging">Judging</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button as={Link} to={`/hackathons/${h._id}`} variant="secondary" size="sm">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDeleteHackathon(h._id, h.title)}
                              disabled={busyId === h._id}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}
