import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Pencil, ShieldCheck, User, UserCheck, X } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getProfileRequest, updateProfileRequest, uploadImageRequest } from '../../services/api';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSizeBytes = 5 * 1024 * 1024;

function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCreatedAt(value) {
  if (!value) {
    return 'Unknown';
  }
  return dateFormatter.format(new Date(value));
}

function validateForm(formData) {
  if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
    return 'First name must be at least 2 characters';
  }
  if (!formData.lastName.trim()) {
    return 'Last name is required';
  }
  if (!formData.username.trim() || formData.username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  return '';
}

function validateImageFile(file) {
  if (!allowedImageTypes.includes(file.type)) {
    return 'Only JPG, PNG, and WEBP images are allowed';
  }
  if (file.size > maxImageSizeBytes) {
    return 'Image must be 5 MB or smaller';
  }
  return '';
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfileRequest();

        if (active) {
          setProfile(response.data.data);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your profile');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      username: profile.username || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || uploading) return;

    const validationError = validateForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      let profilePictureUrl = profile.profilePicture;

      if (selectedFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);

        const uploadResponse = await uploadImageRequest(uploadFormData);
        profilePictureUrl = uploadResponse.data.url;
        setUploading(false);
      }

      setSaving(true);
      const response = await updateProfileRequest({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        profilePicture: profilePictureUrl,
      });

      setProfile(response.data.data);
      toast.success('Profile updated successfully');
      handleCancel();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to update your profile');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const isBusy = saving || uploading;

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Account Settings"
        title="Profile & Preferences"
        description="View and manage your personal account details, avatar photo, and public identity on HackSphere."
      />

      {/* Main Content */}
      <PageContainer className="pt-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {loading ? (
            <Card className="h-64 animate-pulse bg-surfaceMuted" />
          ) : error ? (
            <EmptyState
              icon={UserCheck}
              title="Could not load your profile"
              description={error}
              actionText="Try again"
              onActionClick={() => window.location.reload()}
            />
          ) : !isEditing ? (
            /* DEFAULT VIEW MODE */
            <div className="space-y-8">
              {/* 1. Profile Summary */}
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 text-center sm:text-left">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 shadow-soft">
                    {profile.profilePicture ? (
                      <img src={profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-brand-700">
                        {profile.firstName?.charAt(0)}
                        {profile.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <Badge>{capitalize(profile.role)}</Badge>
                    </div>
                    <p className="text-sm font-medium text-brand-700">@{profile.username}</p>
                    <p className="text-xs text-text-secondary">Member since {formatCreatedAt(profile.createdAt)}</p>
                  </div>

                  <Button type="button" size="lg" onClick={handleEditClick}>
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </Button>
                </div>
              </Card>

              {/* 2. Personal Information Detail Card */}
              <FormSection
                icon={User}
                title="Personal Information"
                description="Your name and public handle details"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">First name</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{profile.firstName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Last name</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{profile.lastName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Username</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">@{profile.username}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Account role</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{capitalize(profile.role)}</p>
                  </div>
                </div>
              </FormSection>

              {/* 3. Account Information Detail Card */}
              <FormSection
                icon={ShieldCheck}
                title="Account & Security"
                description="Email credentials and membership status"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Email address</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{profile.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Joined date</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{formatCreatedAt(profile.createdAt)}</p>
                  </div>
                </div>
              </FormSection>
            </div>
          ) : (
            /* EDITING MODE */
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection
                icon={Camera}
                title="Edit Avatar & Details"
                description="Update your photo, name, and username"
              >
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-50 cursor-pointer"
                      aria-label="Change profile picture"
                    >
                      {previewUrl || profile.profilePicture ? (
                        <img src={previewUrl || profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-semibold text-brand-700">
                          {profile.firstName?.charAt(0)}
                          {profile.lastName?.charAt(0)}
                        </span>
                      )}

                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 transition group-hover:opacity-100">
                        <Camera className="h-6 w-6 text-white" />
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Change photo (JPG, PNG, WEBP - Max 5MB)
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      First Name *
                    </label>
                    <input
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isBusy}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Last Name *
                    </label>
                    <input
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isBusy}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      Username *
                    </label>
                    <input
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isBusy}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={handleCancel}
                      disabled={isBusy}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isBusy}
                      className="px-8"
                    >
                      {uploading ? 'Uploading photo...' : saving ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              </FormSection>
            </form>
          )}
        </div>
      </PageContainer>
    </section>
  );
}