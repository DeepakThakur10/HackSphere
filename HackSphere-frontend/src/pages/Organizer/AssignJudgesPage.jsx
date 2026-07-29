import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Award,
  Mail,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  assignJudgeRequest,
  getAssignedJudgesRequest,
  getAvailableJudgesRequest,
  getHackathonByIdRequest,
  removeJudgeRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AssignJudgesPage() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [availableJudges, setAvailableJudges] = useState([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackRes, assignedRes, availableRes] = await Promise.all([
          getHackathonByIdRequest(hackathonId),
          getAssignedJudgesRequest(hackathonId),
          getAvailableJudgesRequest(),
        ]);

        if (active) {
          setHackathon(hackRes.data.data);
          setAssignedJudges(assignedRes.data.data);
          setAvailableJudges(availableRes.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load judge assignments');
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

  const handleAssignJudgeById = async () => {
    if (!selectedJudgeId) {
      toast.error('Select a judge to assign');
      return;
    }

    try {
      setBusy(true);
      const res = await assignJudgeRequest(hackathonId, { judgeId: selectedJudgeId });
      setAssignedJudges(res.data.data);
      setSelectedJudgeId('');
      toast.success('Judge assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign judge');
    } finally {
      setBusy(false);
    }
  };

  const handleAssignJudgeByEmail = async () => {
    if (!emailInput.trim()) {
      toast.error('Enter a valid judge email address');
      return;
    }

    try {
      setBusy(true);
      const res = await assignJudgeRequest(hackathonId, { email: emailInput.trim() });
      setAssignedJudges(res.data.data);
      setEmailInput('');
      toast.success(res.data.message || 'Judge assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign judge by email');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (!window.confirm('Remove this judge from the evaluation panel?')) return;

    try {
      setBusy(true);
      await removeJudgeRequest(hackathonId, judgeId);
      setAssignedJudges((prev) => prev.filter((a) => (a.judge?._id || a.judge) !== judgeId));
      toast.success('Judge removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove judge');
    } finally {
      setBusy(false);
    }
  };

  // Filter out already assigned judges
  const unassignedJudges = availableJudges.filter(
    (j) => !assignedJudges.some((a) => (a.judge?._id || a.judge) === j._id)
  );

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Organizer Control Panel"
        title="Judge Panel & Assignments"
        description={
          hackathon
            ? `Assign certified evaluation panel judges for ${hackathon.title}.`
            : 'Assign certified evaluation panel judges.'
        }
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load judge assignments"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* 1. Assign Judge via Email Input */}
              <FormSection
                icon={Mail}
                title="Add Judge by Email Address"
                description="Type ANY email address to invite and assign a judge to this event."
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="email"
                      placeholder="e.g. expert.judge@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={busy}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAssignJudgeByEmail();
                        }
                      }}
                      className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                    />
                  </div>

                  <Button type="button" size="md" onClick={handleAssignJudgeByEmail} disabled={busy || !emailInput.trim()}>
                    <Plus className="h-4 w-4" />
                    Assign via Email
                  </Button>
                </div>
              </FormSection>

              {/* 2. Select from Roster */}
              <FormSection
                icon={UserCheck}
                title="Select Existing Platform Judge"
                description="Or select from registered platform judges and organizers"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                    disabled={busy}
                    className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                  >
                    <option value="">Select registered judge...</option>
                    {unassignedJudges.map((j) => (
                      <option key={j._id} value={j._id}>
                        {j.firstName} {j.lastName} (@{j.username}) — {capitalize(j.role)}
                      </option>
                    ))}
                  </select>

                  <Button type="button" variant="secondary" size="md" onClick={handleAssignJudgeById} disabled={busy || !selectedJudgeId}>
                    <Plus className="h-4 w-4" />
                    Assign Selected
                  </Button>
                </div>
              </FormSection>

              {/* 3. Assigned Judges Panel */}
              <FormSection
                icon={Award}
                title={`Active Panel Judges (${assignedJudges.length})`}
                description="Assigned evaluation panel for this event"
              >
                {assignedJudges.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No judges assigned yet"
                    description="Assign judges using email address or dropdown selection above to open evaluation forms."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {assignedJudges.map((assignment) => {
                      const judgeUser = assignment.judge;

                      return (
                        <div key={assignment._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 font-semibold text-brand-700">
                              {judgeUser?.profilePicture ? (
                                <img
                                  src={judgeUser.profilePicture}
                                  alt={judgeUser.firstName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {judgeUser?.firstName?.charAt(0)}
                                  {judgeUser?.lastName?.charAt(0)}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-text-primary">
                                  {judgeUser?.firstName} {judgeUser?.lastName}
                                </p>
                                <Badge>{capitalize(judgeUser?.role || 'Judge')}</Badge>
                              </div>
                              <p className="text-xs text-text-secondary">
                                @{judgeUser?.username || 'judge'} • {judgeUser?.email}
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveJudge(judgeUser?._id)}
                            disabled={busy}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </FormSection>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
