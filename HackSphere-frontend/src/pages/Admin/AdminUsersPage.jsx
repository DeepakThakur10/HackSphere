import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
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
  getAdminUsersRequest,
  toggleUserBlockStatusRequest,
  updateUserRoleRequest,
} from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsersRequest({ search, role: roleFilter });
      setUsers(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      if (active) {
        fetchUsers();
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, roleFilter]);

  const handleToggleBlock = async (user) => {
    const actionName = user.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionName} @${user.username}?`)) return;

    try {
      setBusyId(user._id);
      const res = await toggleUserBlockStatusRequest(user._id);
      toast.success(res.data.message);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.data : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionName} user`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setBusyId(userId);
      const res = await updateUserRoleRequest(userId, newRole);
      toast.success(`Role updated to '${newRole}'`);
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.data : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Admin Control Panel"
        title="User Roster & Access Control"
        description="Search platform users, change role permissions, and block or unblock accounts."
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Console
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Search & Filter Bar */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
                >
                  <option value="all">All Roles</option>
                  <option value="participant">Participants</option>
                  <option value="organizer">Organizers</option>
                  <option value="judge">Judges</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </Card>

          {/* User Roster Table */}
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">Platform User Roster</h2>

            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-surfaceMuted" />
            ) : error ? (
              <EmptyState icon={ShieldAlert} title="Could not load user roster" description={error} />
            ) : users.length === 0 ? (
              <EmptyState icon={Users} title="No users found" description="No users match your search query." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-brand-50/40 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-brand-50 font-semibold text-brand-700">
                              {u.profilePicture ? (
                                <img src={u.profilePicture} alt={u.firstName} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                <span>
                                  {u.firstName?.charAt(0)}
                                  {u.lastName?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-text-primary">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-text-secondary">@{u.username} • {u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={busyId === u._id}
                            className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary outline-none"
                          >
                            <option value="participant">Participant</option>
                            <option value="organizer">Organizer</option>
                            <option value="judge">Judge</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="py-4 px-4">
                          <Badge
                            className={
                              u.isBlocked
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }
                          >
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleBlock(u)}
                            disabled={busyId === u._id}
                            className={u.isBlocked ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-red-200 text-red-600 hover:bg-red-50'}
                          >
                            {u.isBlocked ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" />
                                Block
                              </>
                            )}
                          </Button>
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
