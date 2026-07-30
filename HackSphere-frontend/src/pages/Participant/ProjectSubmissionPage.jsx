import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Code,
  FileCode,
  Github,
  Globe,
  Plus,
  Rocket,
  Send,
  ShieldAlert,
  Trophy,
  Video,
  X,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  createOrUpdateSubmissionRequest,
  getHackathonByIdRequest,
  getParticipantSubmissionRequest,
} from '../../services/api';

export default function ProjectSubmissionPage() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    problemStatement: '',
    solution: '',
    githubUrl: '',
    demoUrl: '',
    presentationUrl: '',
    videoUrl: '',
    techStack: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonRes, subRes] = await Promise.all([
          getHackathonByIdRequest(hackathonId),
          getParticipantSubmissionRequest(hackathonId).catch(() => ({ data: { data: null } })),
        ]);

        if (active) {
          setHackathon(hackathonRes.data.data);

          const existingSub = subRes.data?.data;
          if (existingSub) {
            setFormData({
              projectName: existingSub.projectName || '',
              problemStatement: existingSub.problemStatement || '',
              solution: existingSub.solution || '',
              githubUrl: existingSub.githubUrl || '',
              demoUrl: existingSub.demoUrl || '',
              presentationUrl: existingSub.presentationUrl || '',
              videoUrl: existingSub.videoUrl || '',
              techStack: existingSub.techStack || [],
            });
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load submission data');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formData.techStack.includes(trimmed)) {
      toast.error('Tag already added');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      techStack: [...prev.techStack, trimmed],
    }));
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tag),
    }));
  };

  const isLocked = hackathon?.status === 'completed' || hackathon?.status === 'cancelled';

  const handleSubmit = async (event, isSubmit = false) => {
    event.preventDefault();

    if (saving) return;

    if (isLocked) {
      toast.error('Submissions are locked as results have been declared for this hackathon.');
      return;
    }

    if (!formData.projectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!formData.problemStatement.trim()) {
      toast.error('Problem statement is required');
      return;
    }
    if (!formData.solution.trim()) {
      toast.error('Solution description is required');
      return;
    }
    if (!formData.githubUrl.trim()) {
      toast.error('GitHub repository URL is required');
      return;
    }

    try {
      setSaving(true);
      await createOrUpdateSubmissionRequest({
        hackathonId,
        ...formData,
        isSubmit,
      });

      toast.success(isSubmit ? 'Project submitted successfully!' : 'Draft saved successfully!');
      navigate(`/hackathons/${hackathonId}/workspace`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Project Submission"
        title={hackathon ? `Submit to ${hackathon.title}` : 'Project Submission'}
        description="Enter your project details, GitHub repository link, demo URLs, presentation slides, and tech stack tags."
        actions={
          <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
        }
      />

      <PageContainer className="pt-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {loading ? (
            <div className="h-64 rounded-2xl bg-surfaceMuted animate-pulse" />
          ) : isLocked ? (
            <Card className="p-8 text-center border-amber-300 bg-amber-50/70 space-y-4 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Submissions Locked</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Submissions for this hackathon are closed as official results have been declared or the competition has ended.
              </p>
              <div className="pt-2">
                <Button as={Link} to={`/hackathons/${hackathonId}/leaderboard`} size="lg" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  View Official Leaderboard
                </Button>
              </div>
            </Card>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-8">
              {/* Section 1: Overview */}
              <FormSection
                icon={FileCode}
                title="Project Overview"
                description="Name, problem statement, and solution summary"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="e.g. HackSphere AI Judge Engine"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Problem Statement *
                    </label>
                    <textarea
                      name="problemStatement"
                      rows={3}
                      value={formData.problemStatement}
                      onChange={handleChange}
                      placeholder="What problem does your project solve?"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Solution Description *
                    </label>
                    <textarea
                      name="solution"
                      rows={4}
                      value={formData.solution}
                      onChange={handleChange}
                      placeholder="Describe your solution architecture, features, and implementation details..."
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>
                </div>
              </FormSection>

              {/* Section 2: Repositories & Links */}
              <FormSection
                icon={Github}
                title="Links & Repositories"
                description="GitHub code, live deployment, presentation, and video URLs"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      GitHub Repository *
                    </label>
                    <div className="relative">
                      <Github className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/org/repo"
                        className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Live Demo URL (Optional)
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                      <input
                        type="url"
                        name="demoUrl"
                        value={formData.demoUrl}
                        onChange={handleChange}
                        placeholder="https://myproject.vercel.app"
                        className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Presentation Slides URL (Optional)
                    </label>
                    <div className="relative">
                      <FileCode className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                      <input
                        type="url"
                        name="presentationUrl"
                        value={formData.presentationUrl}
                        onChange={handleChange}
                        placeholder="https://docs.google.com/presentation/..."
                        className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Demo Video Link (Optional)
                    </label>
                    <div className="relative">
                      <Video className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Section 3: Tech Stack */}
              <FormSection
                icon={Code}
                title="Technologies Used"
                description="Add topic tags for technologies and frameworks used"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type technology (e.g. React, Node, Mongoose, AI) and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {formData.techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.techStack.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="rounded-full p-0.5 hover:bg-brand-100 text-brand-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FormSection>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-border pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={saving}
                >
                  Save Draft
                </Button>

                <Button type="submit" size="lg" disabled={saving} className="px-8">
                  <Send className="h-4 w-4" />
                  {saving ? 'Submitting...' : 'Submit Final Project'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
