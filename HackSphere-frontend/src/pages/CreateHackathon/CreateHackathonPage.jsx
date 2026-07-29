import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Button from '../../components/ui/Button';
import { createHackathonRequest, uploadImageRequest } from '../../services/api';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSizeBytes = 5 * 1024 * 1024; // 5MB

function validateImageFile(file) {
  if (!allowedImageTypes.includes(file.type)) {
    return 'Only JPG, PNG, and WEBP images are allowed.';
  }
  if (file.size > maxImageSizeBytes) {
    return 'Image must be 5 MB or smaller.';
  }
  return '';
}

function safeToISOString(dateStr) {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
}

export default function CreateHackathonPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    mode: 'online',
    location: '',
    isPaid: false,
    entryFee: 0,
    registrationStart: '',
    registrationEnd: '',
    hackathonStart: '',
    hackathonEnd: '',
    teamType: 'team',
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeams: 50,
    prizePool: 0,
    techStack: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === 'isPaid' && !checked ? { entryFee: 0 } : {}),
      }));
      return;
    }

    if (name === 'teamType') {
      setFormData((prev) => ({
        ...prev,
        teamType: value,
        minTeamSize: value === 'individual' ? 1 : prev.minTeamSize < 1 ? 1 : prev.minTeamSize,
        maxTeamSize: value === 'individual' ? 1 : prev.maxTeamSize < 2 ? 4 : prev.maxTeamSize,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const errorMsg = validateImageFile(file);
    if (errorMsg) {
      toast.error(errorMsg);
      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, banner: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleKeyDownTag = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tagToRemove),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.mode) return 'Mode is required';

    const regStartISO = safeToISOString(formData.registrationStart);
    const regEndISO = safeToISOString(formData.registrationEnd);
    const hackStartISO = safeToISOString(formData.hackathonStart);
    const hackEndISO = safeToISOString(formData.hackathonEnd);

    if (!regStartISO) return 'Registration start date is required and must be valid';
    if (!regEndISO) return 'Registration end date is required and must be valid';
    if (!hackStartISO) return 'Hackathon start date is required and must be valid';
    if (!hackEndISO) return 'Hackathon end date is required and must be valid';

    if (!formData.teamType) return 'Team type is required';
    if (!formData.maxTeams || Number(formData.maxTeams) < 1) return 'Max teams must be at least 1';

    const regStart = new Date(regStartISO);
    const regEnd = new Date(regEndISO);
    const hackStart = new Date(hackStartISO);
    const hackEnd = new Date(hackEndISO);

    if (regEnd <= regStart) {
      return 'Registration end date must be after registration start date';
    }
    if (regEnd >= hackStart) {
      return 'Hackathon must start only after registration end date';
    }
    if (hackEnd <= hackStart) {
      return 'Hackathon end date must be after hackathon start date';
    }

    const minSize = Number(formData.minTeamSize);
    const maxSize = Number(formData.maxTeamSize);

    if (formData.teamType === 'individual') {
      if (minSize !== 1 || maxSize !== 1) {
        return 'Individual hackathons must have team size of 1';
      }
    } else {
      if (minSize > maxSize) {
        return 'Minimum team size cannot be greater than maximum team size';
      }
    }

    if (!formData.isPaid && Number(formData.entryFee) > 0) {
      return 'Entry fee must be 0 for free hackathons';
    }
    if (formData.isPaid && Number(formData.entryFee) <= 0) {
      return 'Paid hackathons must have a valid entry fee greater than 0';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || uploading) return;

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      let bannerUrl = formData.banner;

      if (selectedFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);

        const uploadRes = await uploadImageRequest(uploadFormData);
        bannerUrl = uploadRes.data.url;
        setUploading(false);
      }

      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        banner: bannerUrl,
        mode: formData.mode,
        location: formData.location.trim(),
        isPaid: Boolean(formData.isPaid),
        entryFee: Number(formData.entryFee),
        registrationStart: safeToISOString(formData.registrationStart),
        registrationEnd: safeToISOString(formData.registrationEnd),
        hackathonStart: safeToISOString(formData.hackathonStart),
        hackathonEnd: safeToISOString(formData.hackathonEnd),
        teamType: formData.teamType,
        minTeamSize: Number(formData.minTeamSize),
        maxTeamSize: Number(formData.maxTeamSize),
        maxTeams: Number(formData.maxTeams),
        prizePool: Number(formData.prizePool),
        techStack: formData.techStack,
      };

      const response = await createHackathonRequest(payload);
      toast.success('Hackathon created successfully!');

      const createdId = response.data?.hackathon?._id || response.data?.data?._id;
      if (createdId) {
        navigate(`/hackathons/${createdId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create hackathon';
      toast.error(msg);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const isBusy = submitting || uploading;

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Organizer Panel"
        title="Host a New Hackathon"
        description="Publish a new hackathon on HackSphere with a guided product configuration workflow. Participants will be able to discover and register once published."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Main Content Layout */}
      <PageContainer className="pt-10">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-10">
          {/* Section 1: Basic Information */}
          <FormSection
            icon={Sparkles}
            title="Basic Information"
            description="Title, description, and event banner image"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isBusy}
                  placeholder="e.g. HackSphere Global AI Challenge 2026"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:bg-surfaceMuted"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isBusy}
                  placeholder="Describe your hackathon, theme, objectives, and guidelines..."
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:bg-surfaceMuted"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Banner Image (Optional)
                </label>

                {previewUrl || formData.banner ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-white h-48 sm:h-56">
                    <img
                      src={previewUrl || formData.banner}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isBusy}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-red-600 shadow-soft"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !isBusy && fileInputRef.current?.click()}
                    className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-brand-50/40 px-6 py-8 text-center cursor-pointer transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-700 transition group-hover:scale-105 shadow-soft">
                      <Upload className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-text-primary">
                      Click to upload hackathon banner
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      JPG, PNG, or WEBP (Max 5 MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isBusy}
                />
              </div>
            </div>
          </FormSection>

          {/* Section 2: Event Details */}
          <FormSection
            icon={MapPin}
            title="Event Details"
            description="Participation mode and physical or virtual venue location"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Event Mode *
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Location {formData.mode !== 'online' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isBusy}
                    placeholder={formData.mode === 'online' ? 'Online / Virtual' : 'Venue address or City'}
                    className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 3: Timeline & Dates */}
          <FormSection
            icon={Calendar}
            title="Timeline & Key Dates"
            description="Define registration window and hackathon execution dates"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Registration Start *
                </label>
                <input
                  type="datetime-local"
                  name="registrationStart"
                  value={formData.registrationStart}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Registration End *
                </label>
                <input
                  type="datetime-local"
                  name="registrationEnd"
                  value={formData.registrationEnd}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Hackathon Start *
                </label>
                <input
                  type="datetime-local"
                  name="hackathonStart"
                  value={formData.hackathonStart}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Hackathon End *
                </label>
                <input
                  type="datetime-local"
                  name="hackathonEnd"
                  value={formData.hackathonEnd}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* Section 4: Team Settings */}
          <FormSection
            icon={Users}
            title="Team & Participant Settings"
            description="Participation format, team member bounds, and max team limits"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Participation Type *
                </label>
                <select
                  name="teamType"
                  value={formData.teamType}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="team">Team Participation</option>
                  <option value="individual">Individual Participation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Max Teams Allowed *
                </label>
                <input
                  type="number"
                  name="maxTeams"
                  min={1}
                  value={formData.maxTeams}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Min Team Size
                </label>
                <input
                  type="number"
                  name="minTeamSize"
                  min={1}
                  value={formData.minTeamSize}
                  onChange={handleChange}
                  disabled={isBusy || formData.teamType === 'individual'}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:bg-surfaceMuted disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Max Team Size
                </label>
                <input
                  type="number"
                  name="maxTeamSize"
                  min={1}
                  value={formData.maxTeamSize}
                  onChange={handleChange}
                  disabled={isBusy || formData.teamType === 'individual'}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:bg-surfaceMuted disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </FormSection>

          {/* Section 5: Payment Details */}
          <FormSection
            icon={DollarSign}
            title="Payment & Entry Fee"
            description="Configure fee requirements for registration"
          >
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
                <input
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="h-5 w-5 rounded border-border bg-white text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isPaid" className="text-sm font-medium text-text-primary cursor-pointer select-none">
                  This is a paid hackathon
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  name="entryFee"
                  min={0}
                  value={formData.entryFee}
                  onChange={handleChange}
                  disabled={isBusy || !formData.isPaid}
                  placeholder="0"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:bg-surfaceMuted disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </FormSection>

          {/* Section 6: Prize & Tech Stack */}
          <FormSection
            icon={Trophy}
            title="Prize Pool & Tech Stack"
            description="Total reward amounts and tech stack topic tags"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Prize Pool ($)
                </label>
                <input
                  type="number"
                  name="prizePool"
                  min={0}
                  value={formData.prizePool}
                  onChange={handleChange}
                  disabled={isBusy}
                  placeholder="e.g. 10000"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Tech Stack / Tracks
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDownTag}
                    disabled={isBusy}
                    placeholder="Type a tag (e.g. React, AI, Web3) and press Enter"
                    className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddTag}
                    disabled={isBusy}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {formData.techStack.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.techStack.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isBusy}
                          className="rounded-full p-0.5 hover:bg-brand-100 text-brand-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </FormSection>

          {/* Publishing Actions Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-border pt-6">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
              disabled={isBusy}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isBusy}
              className="px-8"
            >
              {uploading ? 'Uploading banner...' : submitting ? 'Publishing hackathon...' : 'Publish Hackathon'}
            </Button>
          </div>
        </form>
      </PageContainer>
    </section>
  );
}
