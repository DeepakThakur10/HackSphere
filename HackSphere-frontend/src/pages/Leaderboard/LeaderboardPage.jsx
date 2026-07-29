import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Clock,
  Crown,
  Download,
  Github,
  Globe,
  Medal,
  Printer,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getLeaderboardRequest } from '../../services/api';
import { exportLeaderboardToCSV, printPageToPDF } from '../../utils/exportUtils';

export default function LeaderboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await getLeaderboardRequest(id);
        if (active) {
          setLeaderboardData(res.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load leaderboard');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      active = false;
    };
  }, [id]);

  const isPublic = leaderboardData?.isPublic;
  const hackathon = leaderboardData?.data?.hackathon;
  const leaderboard = leaderboardData?.data?.leaderboard || [];

  const champion = leaderboard[0] || null;
  const runnerUp = leaderboard[1] || null;
  const secondRunnerUp = leaderboard[2] || null;

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Official Standings"
        title={hackathon ? `${hackathon.title} Leaderboard` : 'Hackathon Leaderboard'}
        description="Authoritative project rankings, average judge scores, and winner announcements."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {leaderboard.length > 0 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => exportLeaderboardToCSV(leaderboard, hackathon?.title || 'Hackathon')}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button type="button" size="md" onClick={printPageToPDF}>
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-10">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load leaderboard"
              description={error}
              actionText="Back to hackathons"
              actionTo="/hackathons"
            />
          ) : !isPublic ? (
            <EmptyState
              icon={Clock}
              title="Results Pending"
              description={leaderboardData?.message || 'Leaderboard rankings will be published once judge evaluations are complete.'}
              actionText="View Event Details"
              actionTo={`/hackathons/${id}`}
            />
          ) : leaderboard.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No evaluated submissions yet"
              description="Submissions have not been evaluated by judges yet."
            />
          ) : (
            <>
              {/* 1. Top 3 Winners Podium Component */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <h2 className="text-2xl font-bold tracking-tight text-text-primary">Winner Podium</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 items-end">
                  {/* 2nd Place Runner-Up */}
                  {runnerUp ? (
                    <Card className="p-6 text-center border-slate-200 bg-slate-50/60 order-2 sm:order-1">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-soft">
                        <Medal className="h-7 w-7" />
                      </div>
                      <Badge className="mt-3 bg-slate-200 text-slate-800">2nd Place (Runner-Up)</Badge>
                      <h3 className="mt-3 text-lg font-bold text-text-primary">
                        {runnerUp.team?.name || `${runnerUp.user?.firstName} ${runnerUp.user?.lastName}`}
                      </h3>
                      <p className="mt-1 text-xs text-brand-700 font-semibold">{runnerUp.projectName}</p>
                      <p className="mt-3 text-xl font-extrabold text-slate-700">{runnerUp.averageScore} / 70</p>
                    </Card>
                  ) : null}

                  {/* 1st Place Champion */}
                  {champion ? (
                    <Card className="p-8 text-center border-amber-300 bg-amber-50/70 shadow-card order-1 sm:order-2 sm:-mt-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-white shadow-soft">
                        <Crown className="h-8 w-8" />
                      </div>
                      <Badge className="mt-3 bg-amber-500 text-white font-bold">🥇 1st Place (Champion)</Badge>
                      <h3 className="mt-3 text-xl font-bold text-text-primary">
                        {champion.team?.name || `${champion.user?.firstName} ${champion.user?.lastName}`}
                      </h3>
                      <p className="mt-1 text-sm text-brand-700 font-semibold">{champion.projectName}</p>
                      <p className="mt-3 text-2xl font-black text-amber-700">{champion.averageScore} / 70</p>
                    </Card>
                  ) : null}

                  {/* 3rd Place Second Runner-Up */}
                  {secondRunnerUp ? (
                    <Card className="p-6 text-center border-amber-200 bg-amber-50/30 order-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-700 text-white shadow-soft">
                        <Award className="h-7 w-7" />
                      </div>
                      <Badge className="mt-3 bg-amber-100 text-amber-900">3rd Place (2nd Runner-Up)</Badge>
                      <h3 className="mt-3 text-lg font-bold text-text-primary">
                        {secondRunnerUp.team?.name || `${secondRunnerUp.user?.firstName} ${secondRunnerUp.user?.lastName}`}
                      </h3>
                      <p className="mt-1 text-xs text-brand-700 font-semibold">{secondRunnerUp.projectName}</p>
                      <p className="mt-3 text-xl font-extrabold text-amber-900">{secondRunnerUp.averageScore} / 70</p>
                    </Card>
                  ) : null}
                </div>
              </div>

              {/* 2. Full Ranked Standings Table */}
              <Card className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Full Competition Standings</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Team / Hacker</th>
                        <th className="py-3 px-4">Project Title</th>
                        <th className="py-3 px-4 text-center">Avg Score</th>
                        <th className="py-3 px-4 text-center">Reviews</th>
                        <th className="py-3 px-4 text-right">Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leaderboard.map((item) => (
                        <tr key={item.submissionId} className="hover:bg-brand-50/40 transition">
                          <td className="py-4 px-4 font-bold text-text-primary">
                            {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-semibold text-text-primary">
                              {item.team?.name || `${item.user?.firstName} ${item.user?.lastName}`}
                            </p>
                            {item.user ? (
                              <p className="text-xs text-text-secondary">@{item.user.username}</p>
                            ) : null}
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-medium text-brand-700">{item.projectName}</p>
                          </td>

                          <td className="py-4 px-4 text-center font-bold text-text-primary">
                            {item.averageScore} / 70
                          </td>

                          <td className="py-4 px-4 text-center text-text-secondary">
                            {item.reviewCount} judge{item.reviewCount > 1 ? 's' : ''}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-xs">
                              {item.githubUrl ? (
                                <a
                                  href={item.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-text-secondary hover:text-brand-700"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  Code
                                </a>
                              ) : null}
                              {item.demoUrl ? (
                                <a
                                  href={item.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  Demo
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
