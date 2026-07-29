import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  FileCode,
  Github,
  Globe,
  MessageSquare,
  Send,
  Video,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  createOrUpdateReviewRequest,
  getReviewBySubmissionRequest,
  getSubmissionByIdRequest,
} from '../../services/api';

const CRITERIA_LIST = [
  { key: 'innovation', label: 'Innovation & Originality', description: 'Uniqueness of the idea, creative problem solving, and novel approach.' },
  { key: 'technicalComplexity', label: 'Technical Complexity', description: 'Depth of architecture, backend algorithms, and technical rigor.' },
  { key: 'uiUx', label: 'UI / UX Design', description: 'Visual elegance, layout consistency, micro-animations, and user experience.' },
  { key: 'functionality', label: 'Functionality & Completeness', description: 'Execution quality, feature completeness, and working implementation.' },
  { key: 'scalability', label: 'Scalability & Performance', description: 'Production readiness, load resilience, and system scalability.' },
  { key: 'documentation', label: 'Documentation & Code Quality', description: 'Repository structure, clean code practices, and README clarity.' },
  { key: 'presentation', label: 'Presentation & Pitch', description: 'Demo video quality, slides deck clarity, and problem pitch.' },
];

export default function ProjectEvaluationPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [scores, setScores] = useState({
    innovation: 7,
    technicalComplexity: 7,
    uiUx: 7,
    functionality: 7,
    scalability: 7,
    documentation: 7,
    presentation: 7,
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, reviewRes] = await Promise.all([
          getSubmissionByIdRequest(submissionId),
          getReviewBySubmissionRequest(submissionId).catch(() => ({ data: { data: null } })),
        ]);

        if (active) {
          setSubmission(subRes.data.data);

          const existingReview = reviewRes.data?.data;
          if (existingReview) {
            if (existingReview.scores) {
              setScores(existingReview.scores);
            }
            if (existingReview.comments) {
              setComments(existingReview.comments);
            }
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load submission evaluation form');
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
  }, [submissionId]);

  const handleScoreChange = (criterionKey, value) => {
    const num = Math.min(10, Math.max(0, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [criterionKey]: num,
    }));
  };

  const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);

  const handleSubmitEvaluation = async (event, isSubmit = false) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      await createOrUpdateReviewRequest({
        submissionId,
        scores,
        comments,
        isSubmit,
      });

      toast.success(isSubmit ? 'Evaluation review submitted successfully!' : 'Evaluation draft saved');
      navigate('/judge/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Evaluation Panel"
        title={submission ? `Evaluating ${submission.projectName}` : 'Project Evaluation'}
        description="Review project details, examine repository links, and submit scores across the 7 competition criteria."
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Judge Dashboard
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : !submission ? (
            <p>Submission not found.</p>
          ) : (
            <form onSubmit={(e) => handleSubmitEvaluation(e, true)} className="space-y-8">
              {/* 1. Project Submission Summary Card */}
              <Card className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Badge>{submission.hackathon?.title}</Badge>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{submission.projectName}</h2>
                    {submission.user ? (
                      <p className="mt-1 text-xs text-text-secondary">
                        Submitted by {submission.user.firstName} {submission.user.lastName} (@{submission.user.username})
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Problem Statement</p>
                    <p className="mt-1 text-sm text-text-secondary">{submission.problemStatement}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Solution Summary</p>
                    <p className="mt-1 text-sm text-text-secondary">{submission.solution}</p>
                  </div>

                  {/* Submission Links */}
                  <div className="pt-3 flex flex-wrap gap-4 text-xs font-medium">
                    {submission.githubUrl ? (
                      <a
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                      >
                        <Github className="h-4 w-4" />
                        GitHub Repository
                      </a>
                    ) : null}
                    {submission.demoUrl ? (
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                      >
                        <Globe className="h-4 w-4" />
                        Live Demo
                      </a>
                    ) : null}
                    {submission.presentationUrl ? (
                      <a
                        href={submission.presentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                      >
                        <FileCode className="h-4 w-4" />
                        Slides Deck
                      </a>
                    ) : null}
                    {submission.videoUrl ? (
                      <a
                        href={submission.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                      >
                        <Video className="h-4 w-4" />
                        Video Demo
                      </a>
                    ) : null}
                  </div>
                </div>
              </Card>

              {/* 2. 7 Competition Criteria Scoring Cards */}
              <FormSection
                icon={Award}
                title="Evaluation Criteria Scoring (1 - 10)"
                description="Score the entry across each of the seven official criteria"
              >
                <div className="space-y-6 divide-y divide-border">
                  {CRITERIA_LIST.map((crit) => (
                    <div key={crit.key} className="pt-4 first:pt-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                          <p className="text-sm font-semibold text-text-primary">{crit.label}</p>
                          <Badge className="bg-brand-50 text-brand-700 font-bold">
                            Score: {scores[crit.key]} / 10
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary">{crit.description}</p>
                      </div>

                      <div className="w-full sm:w-48">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={scores[crit.key]}
                          onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                          disabled={saving}
                          className="w-full accent-brand-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* 3. Written Feedback */}
              <FormSection
                icon={MessageSquare}
                title="Judge Feedback & Comments"
                description="Provide constructive evaluation feedback for the team"
              >
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={saving}
                  placeholder="Write your constructive feedback, strengths, and areas for improvement..."
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                />
              </FormSection>

              {/* Submit Actions Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Total Score Summary</p>
                  <p className="text-2xl font-bold tracking-tight text-brand-700">{totalScore} / 70 Points</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={(e) => handleSubmitEvaluation(e, false)}
                    disabled={saving}
                  >
                    Save Draft
                  </Button>

                  <Button type="submit" size="lg" disabled={saving} className="px-8">
                    <Send className="h-4 w-4" />
                    {saving ? 'Submitting...' : 'Submit Evaluation'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
