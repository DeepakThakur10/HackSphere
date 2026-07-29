import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Copy,
  Crown,
  Lock,
  LogOut,
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
import { useAuth } from '../../context/authContext';
import {
  deleteTeamRequest,
  getTeamByIdRequest,
  leaveTeamRequest,
  lockTeamRequest,
  transferLeaderRequest,
} from '../../services/api';

export default function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [selectedNewLeader, setSelectedNewLeader] = useState('');

  useEffect(() => {
    let active = true;

    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await getTeamByIdRequest(id);
        if (active) {
          setTeam(res.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load team details');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTeam();

    return () => {
      active = false;
    };
  }, [id]);

  const isLeader = team && user && team.leader?._id === user._id;
  const isMember = team && user && team.members?.some((m) => m._id === user._id);

  const handleCopyInviteCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      setBusy(true);
      await leaveTeamRequest(id);
      toast.success('Left team successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave team');
    } finally {
      setBusy(false);
    }
  };

  const handleLockTeam = async () => {
    if (!window.confirm('Lock team roster? No new members will be able to join.')) return;

    try {
      setBusy(true);
      const res = await lockTeamRequest(id);
      setTeam(res.data.data);
      toast.success('Team roster locked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock team');
    } finally {
      setBusy(false);
    }
  };

  const handleTransferLeader = async () => {
    if (!selectedNewLeader) {
      toast.error('Select a member to transfer captain leadership to');
      return;
    }

    try {
      setBusy(true);
      const res = await transferLeaderRequest({ id, newLeaderId: selectedNewLeader });
      setTeam(res.data.data);
      setSelectedNewLeader('');
      toast.success('Leadership transferred successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to transfer leadership');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      setBusy(true);
      await deleteTeamRequest(id);
      toast.success('Team deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge={team?.status === 'locked' ? 'Locked Team Roster' : 'Team Roster'}
        title={team ? team.name : 'Team Details'}
        description={
          team?.hackathon?.title
            ? `Competing in ${team.hackathon.title}`
            : 'Manage team members, share invite codes, and lock roster for submissions.'
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load team details"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : !team ? (
            <EmptyState
              icon={Users}
              title="Team not found"
              description="The requested team does not exist or has been deleted."
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* 1. Invite Code Card */}
              {team.status !== 'locked' ? (
                <Card className="p-6 sm:p-8 bg-brand-50/50 border-brand-100">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Team Invite Code</p>
                      <p className="mt-1 text-2xl font-bold tracking-wider text-text-primary">{team.inviteCode}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Share this code with teammates to join your roster ({team.members.length} / {team.maxSize} members)
                      </p>
                    </div>
                    <Button type="button" variant="secondary" size="md" onClick={handleCopyInviteCode}>
                      <Copy className="h-4 w-4" />
                      Copy Invite Code
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* 2. Team Members Roster */}
              <FormSection
                icon={Users}
                title={`Team Roster (${team.members.length}/${team.maxSize})`}
                description="Current registered team members"
              >
                <div className="divide-y divide-border">
                  {team.members.map((member) => {
                    const isCaptain = team.leader?._id === member._id;

                    return (
                      <div key={member._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 font-semibold text-brand-700">
                            {member.profilePicture ? (
                              <img src={member.profilePicture} alt={member.firstName} className="h-full w-full object-cover" />
                            ) : (
                              <span>
                                {member.firstName?.charAt(0)}
                                {member.lastName?.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-text-primary">
                                {member.firstName} {member.lastName}
                              </p>
                              {isCaptain ? (
                                <Badge className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                                  <Crown className="h-3 w-3" />
                                  Captain
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-text-secondary">@{member.username || 'user'} • {member.email}</p>
                          </div>
                        </div>

                        {member._id === user?._id ? (
                          <Badge>You</Badge>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </FormSection>

              {/* 3. Captain Management Controls */}
              {isLeader && team.status !== 'locked' ? (
                <FormSection
                  icon={Crown}
                  title="Captain Controls"
                  description="Manage team roster status and leadership"
                >
                  <div className="space-y-6">
                    {/* Transfer Leadership */}
                    {team.members.length > 1 ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={selectedNewLeader}
                          onChange={(e) => setSelectedNewLeader(e.target.value)}
                          className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                        >
                          <option value="">Select member to transfer leadership...</option>
                          {team.members
                            .filter((m) => m._id !== user._id)
                            .map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.firstName} {m.lastName} (@{m.username})
                              </option>
                            ))}
                        </select>
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={handleTransferLeader}
                          disabled={busy || !selectedNewLeader}
                        >
                          <UserCheck className="h-4 w-4" />
                          Transfer Leadership
                        </Button>
                      </div>
                    ) : null}

                    {/* Lock Roster Action */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Lock Team Roster</p>
                        <p className="text-xs text-text-secondary">
                          Once locked, no new members can join and the roster is frozen for submission.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="md"
                        onClick={handleLockTeam}
                        disabled={busy || team.members.length < team.minSize}
                      >
                        <Lock className="h-4 w-4" />
                        Lock Roster
                      </Button>
                    </div>

                    {/* Delete Team Action */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm font-semibold text-red-600">Delete Team</p>
                        <p className="text-xs text-text-secondary">
                          Disband team and return all members to individual status.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={handleDeleteTeam}
                        disabled={busy}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Team
                      </Button>
                    </div>
                  </div>
                </FormSection>
              ) : null}

              {/* 4. Member Actions (Leave Team) */}
              {isMember && team.status !== 'locked' ? (
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleLeaveTeam}
                    disabled={busy}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Leave Team
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
