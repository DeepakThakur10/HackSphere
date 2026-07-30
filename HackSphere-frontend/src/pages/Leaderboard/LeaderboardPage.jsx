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
import StarBorder from '../../components/ui/StarBorder';
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
              {/* 1. Winner Podium Header & Cards */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-300/40 shadow-sm">
                    <Trophy className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-text-primary">Winner Podium</h2>
                    <p className="text-xs text-text-secondary">Official leaderboard standings & competition champions</p>
                  </div>
                </div>

                {/* Podium Grid Layout */}
                <div
                  className={`grid gap-6 items-end ${
                    leaderboard.length === 1
                      ? 'max-w-md mx-auto grid-cols-1'
                      : leaderboard.length === 2
                      ? 'max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {/* 2nd Place (Runner-Up) */}
                  {runnerUp ? (
                    <div className="order-2 sm:order-1 flex flex-col items-center">
                      <div className="w-full rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-50 via-white to-slate-100/90 p-6 text-center shadow-md relative overflow-hidden transition-all hover:border-slate-400 hover:shadow-lg">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-200/50 blur-xl pointer-events-none" />

                        {/* Medal Avatar Badge */}
                        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-700 shadow-md ring-4 ring-slate-200">
                          <Medal className="h-8 w-8 text-slate-700" />
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white font-bold text-xs shadow">
                            2
                          </span>
                        </div>

                        <Badge className="mt-4 bg-slate-200 text-slate-800 border-slate-300 font-bold">
                          🥈 2nd Place (Runner-Up)
                        </Badge>

                        <h3 className="mt-3 text-lg font-bold text-text-primary tracking-tight">
                          {runnerUp.team?.name || `${runnerUp.user?.firstName} ${runnerUp.user?.lastName}`}
                        </h3>
                        {runnerUp.user && runnerUp.team?.name ? (
                          <p className="text-xs text-text-muted mt-0.5">@{runnerUp.user.username}</p>
                        ) : null}

                        <p className="mt-2 text-sm font-semibold text-brand-700">{runnerUp.projectName}</p>

                        {/* Project Links */}
                        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                          {runnerUp.githubUrl ? (
                            <a
                              href={runnerUp.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-text-secondary hover:text-brand-700"
                            >
                              <Github className="h-3.5 w-3.5" /> Code
                            </a>
                          ) : null}
                          {runnerUp.demoUrl ? (
                            <a
                              href={runnerUp.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
                            >
                              <Globe className="h-3.5 w-3.5" /> Demo
                            </a>
                          ) : null}
                        </div>

                        {/* Score Pill */}
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-200/80 px-4 py-2 text-slate-800 border border-slate-300/60">
                          <span className="text-xs text-slate-600 font-medium">Avg Score:</span>
                          <span className="text-lg font-black">{runnerUp.averageScore}</span>
                          <span className="text-xs text-slate-500">/ 70</span>
                        </div>
                      </div>

                      {/* Pedestal Step */}
                      <div className="w-full bg-slate-200/90 border-t border-slate-300 rounded-b-xl py-2 text-center text-xs font-extrabold uppercase tracking-wider text-slate-700 shadow-inner sm:h-12 flex items-center justify-center">
                        2nd Position
                      </div>
                    </div>
                  ) : null}

                  {/* 1st Place Champion */}
                  {champion ? (
                    <div className="order-1 sm:order-2 flex flex-col items-center sm:-mt-4">
                      <StarBorder color="#f59e0b" className="w-full rounded-2xl">
                        <div className="w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-100/90 via-amber-50/60 to-white p-7 text-center shadow-xl relative overflow-hidden transition-all hover:border-amber-500">
                          <div className="absolute top-0 right-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-amber-300/50 blur-2xl pointer-events-none" />

                          {/* Crown Avatar Badge */}
                          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-lg ring-4 ring-amber-300/60">
                            <Crown className="h-10 w-10 text-amber-950" />
                            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white font-extrabold text-xs shadow-md border-2 border-white">
                              1
                            </span>
                          </div>

                          <Badge className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-600 font-extrabold shadow-sm">
                            🏆 1st Place (Champion)
                          </Badge>

                          <h3 className="mt-3 text-xl font-extrabold text-text-primary tracking-tight">
                            {champion.team?.name || `${champion.user?.firstName} ${champion.user?.lastName}`}
                          </h3>
                          {champion.user && champion.team?.name ? (
                            <p className="text-xs text-text-muted mt-0.5">@{champion.user.username}</p>
                          ) : null}

                          <p className="mt-2 text-sm font-bold text-brand-700">{champion.projectName}</p>

                          {/* Project Links */}
                          <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                            {champion.githubUrl ? (
                              <a
                                href={champion.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-text-secondary hover:text-brand-700"
                              >
                                <Github className="h-3.5 w-3.5" /> Code
                              </a>
                            ) : null}
                            {champion.demoUrl ? (
                              <a
                                href={champion.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
                              >
                                <Globe className="h-3.5 w-3.5" /> Demo
                              </a>
                            ) : null}
                          </div>

                          {/* Score Pill */}
                          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/70 px-5 py-2 text-amber-950 shadow-sm">
                            <span className="text-xs text-amber-800 font-semibold">Avg Score:</span>
                            <span className="text-xl font-black text-amber-900">{champion.averageScore}</span>
                            <span className="text-xs text-amber-700 font-semibold">/ 70</span>
                          </div>
                        </div>
                      </StarBorder>

                      {/* Pedestal Step */}
                      <div className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 border-t border-amber-500 rounded-b-xl py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-amber-950 shadow-md sm:h-16 flex items-center justify-center">
                        👑 1st Champion Pedestal
                      </div>
                    </div>
                  ) : null}

                  {/* 3rd Place (2nd Runner-Up) */}
                  {secondRunnerUp ? (
                    <div className="order-3 flex flex-col items-center">
                      <div className="w-full rounded-2xl border border-amber-800/30 bg-gradient-to-b from-orange-50/90 via-white to-amber-50/80 p-6 text-center shadow-md relative overflow-hidden transition-all hover:border-amber-800/50 hover:shadow-lg">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-700/20 blur-xl pointer-events-none" />

                        {/* Award Avatar Badge */}
                        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white shadow-md ring-4 ring-amber-600/30">
                          <Award className="h-8 w-8 text-white" />
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-800 text-white font-bold text-xs shadow">
                            3
                          </span>
                        </div>

                        <Badge className="mt-4 bg-amber-100 text-amber-900 border-amber-300 font-bold">
                          🥉 3rd Place (2nd Runner-Up)
                        </Badge>

                        <h3 className="mt-3 text-lg font-bold text-text-primary tracking-tight">
                          {secondRunnerUp.team?.name || `${secondRunnerUp.user?.firstName} ${secondRunnerUp.user?.lastName}`}
                        </h3>
                        {secondRunnerUp.user && secondRunnerUp.team?.name ? (
                          <p className="text-xs text-text-muted mt-0.5">@{secondRunnerUp.user.username}</p>
                        ) : null}

                        <p className="mt-2 text-sm font-semibold text-brand-700">{secondRunnerUp.projectName}</p>

                        {/* Project Links */}
                        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                          {secondRunnerUp.githubUrl ? (
                            <a
                              href={secondRunnerUp.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-text-secondary hover:text-brand-700"
                            >
                              <Github className="h-3.5 w-3.5" /> Code
                            </a>
                          ) : null}
                          {secondRunnerUp.demoUrl ? (
                            <a
                              href={secondRunnerUp.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
                            >
                              <Globe className="h-3.5 w-3.5" /> Demo
                            </a>
                          ) : null}
                        </div>

                        {/* Score Pill */}
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-100/90 px-4 py-2 text-amber-900 border border-amber-300/60">
                          <span className="text-xs text-amber-700 font-medium">Avg Score:</span>
                          <span className="text-lg font-black">{secondRunnerUp.averageScore}</span>
                          <span className="text-xs text-amber-600">/ 70</span>
                        </div>
                      </div>

                      {/* Pedestal Step */}
                      <div className="w-full bg-amber-200/90 border-t border-amber-300 rounded-b-xl py-2 text-center text-xs font-bold uppercase tracking-wider text-amber-900 shadow-inner sm:h-10 flex items-center justify-center">
                        3rd Position
                      </div>
                    </div>
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
