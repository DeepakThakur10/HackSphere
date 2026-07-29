import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Clock,
  FileCode,
  Github,
  Globe,
  Rocket,
  ShieldAlert,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getAssignedSubmissionsForJudgeRequest } from '../../services/api';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function JudgeDashboardPage() {
  const [assignedData, setAssignedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchAssigned = async () => {
      try {
        setLoading(true);
        const res = await getAssignedSubmissionsForJudgeRequest();
        if (active) {
          setAssignedData(res.data.data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load assigned judge projects');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAssigned();

    return () => {
      active = false;
    };
  }, []);

  const totalAssigned = assignedData.length;
  const completedCount = assignedData.filter((item) => item.review?.status === 'submitted').length;
  const pendingCount = totalAssigned - completedCount;

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Judge Workspace"
        title="Evaluation Panel Dashboard"
        description="Review assigned hackathon project entries, evaluate submissions across 7 competition criteria, and submit scores."
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={ShieldAlert}
              title="Could not load judge dashboard"
              description={error}
              actionText="Back to home"
              actionTo="/"
            />
          ) : (
            <>
              {/* Stat Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Assigned Projects"
                  icon={FileCode}
                  value={totalAssigned}
                  helpText="Total projects assigned for evaluation"
                />
                <StatCard
                  label="Completed Reviews"
                  icon={CheckCircle2}
                  value={completedCount}
                  helpText="Evaluations submitted"
                />
                <StatCard
                  label="Pending Reviews"
                  icon={Clock}
                  value={pendingCount}
                  helpText="Awaiting scoring"
                />
              </div>

              {/* Assigned Submissions List */}
              <Card className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Assigned Project Entries</h2>

                {assignedData.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No assigned projects yet"
                    description="You currently have no project submissions assigned for review. Check back when organizers open judging."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {assignedData.map(({ submission, review }) => {
                      const isEvaluated = review?.status === 'submitted';

                      return (
                        <Card key={submission._id} className="flex flex-col justify-between p-5 transition hover:shadow-card space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Badge className="mb-2">{submission.hackathon?.title}</Badge>
                                <h3 className="text-lg font-semibold leading-snug text-text-primary">
                                  {submission.projectName}
                                </h3>
                              </div>
                              <Badge
                                className={
                                  isEvaluated
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }
                              >
                                {isEvaluated ? 'Evaluated' : 'Pending Review'}
                              </Badge>
                            </div>

                            <p className="mt-2 text-xs text-text-secondary line-clamp-2">
                              {submission.problemStatement}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
                              {submission.githubUrl ? (
                                <a
                                  href={submission.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 hover:text-brand-700"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  Repo
                                </a>
                              ) : null}
                              {submission.demoUrl ? (
                                <a
                                  href={submission.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 hover:text-brand-700"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  Live Demo
                                </a>
                              ) : null}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            {isEvaluated ? (
                              <p className="text-xs font-semibold text-emerald-700">
                                Score: {review.totalScore} / 70
                              </p>
                            ) : (
                              <p className="text-xs text-text-muted">7 Evaluation Criteria</p>
                            )}

                            <Button as={Link} to={`/judge/submissions/${submission._id}/evaluate`} size="sm">
                              <Award className="h-3.5 w-3.5" />
                              {isEvaluated ? 'Edit Scores' : 'Evaluate Project'}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
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
