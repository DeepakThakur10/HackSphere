import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileCode,
  FileText,
  LayoutGrid,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import StatCard from '../../components/common/StatCard';
import FormSection from '../../components/common/FormSection';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getAdminAuditLogsRequest, getAdminDashboardMetricsRequest } from '../../services/api';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, logsRes] = await Promise.all([
          getAdminDashboardMetricsRequest(),
          getAdminAuditLogsRequest(),
        ]);

        if (active) {
          setMetrics(metricsRes.data.data);
          setAuditLogs(logsRes.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load admin metrics');
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
  }, []);

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="System Administration"
        title="Admin Command Console"
        description="Platform oversight — monitoring real-time user metrics, hackathon lifecycles, global activity, and system audit logs."
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-10">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load admin console"
              description={error}
              actionText="Back to dashboard"
              actionTo="/dashboard"
            />
          ) : (
            <>
              {/* 1. Global Stat Tiles */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Platform Users"
                  icon={Users}
                  value={metrics?.users?.total || 0}
                  helpText="Registered user accounts"
                />
                <StatCard
                  label="Total Hackathons"
                  icon={LayoutGrid}
                  value={metrics?.hackathons?.total || 0}
                  helpText="Events created"
                />
                <StatCard
                  label="Total Submissions"
                  icon={FileCode}
                  value={metrics?.activity?.submissions || 0}
                  helpText="Project entries"
                />
                <StatCard
                  label="Judge Reviews"
                  icon={Award}
                  value={metrics?.activity?.reviews || 0}
                  helpText="Evaluations submitted"
                />
              </div>

              {/* 2. Admin Quick Module Navigation */}
              <FormSection
                icon={ShieldCheck}
                title="Console Control Modules"
                description="Manage user permissions, hackathon lifecycles, and system settings"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/admin/users"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold text-text-primary">User Management</p>
                        <p className="text-xs text-text-secondary">Roster search, role updates, and account blocking</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/hackathons"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <LayoutGrid className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold text-text-primary">Global Hackathons</p>
                        <p className="text-xs text-text-secondary">Supervise all hackathons & override lifecycle states</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </FormSection>

              {/* 3. System Audit Logs Feed */}
              <Card className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-text-primary">Platform Audit Trail</h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      Real-time administrative actions, security updates, and lifecycle overrides
                    </p>
                  </div>
                  <Badge className="bg-brand-50 text-brand-700 font-semibold">{auditLogs.length} Recent Logs</Badge>
                </div>

                {auditLogs.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No audit logs recorded"
                    description="System administrative actions will appear here in real-time."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {auditLogs.map((log) => (
                      <div key={log._id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-800 font-bold">{log.action}</Badge>
                            <span className="text-xs font-semibold text-text-primary">
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System Admin'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Entity: <strong className="text-text-primary">{log.entityType}</strong> •{' '}
                            {log.metadata ? JSON.stringify(log.metadata) : ''}
                          </p>
                        </div>

                        <span className="text-[11px] text-text-muted shrink-0">
                          {dateFormatter.format(new Date(log.createdAt))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
