import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Pencil, X } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
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

    if (!file) {
      return;
    }

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

    if (saving || uploading) {
      return;
    }

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
    <section className="relative overflow-hidden bg-slate-950 py-10 text-slate-100 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <PageContainer className="relative">
        <div className="mx-auto max-w-3xl space-y-8">
          {loading ? (
            <Card className="border-white/10 bg-white/5 p-8 text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="space-y-5">
                <div className="h-20 w-20 rounded-full bg-white/10" />
                <div className="h-9 w-3/4 rounded-xl bg-white/10" />
                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                </div>
              </div>
            </Card>
          ) : error ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Could not load your profile</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
              <div className="mt-6 flex justify-center">
                <Button type="button" onClick={() => window.location.reload()} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Try again
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
              {/* Profile Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={!isEditing}
                      className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      aria-label="Change profile picture"
                    >
                      {previewUrl || profile.profilePicture ? (
                        <img src={previewUrl || profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-slate-200">
                          {profile.firstName?.charAt(0)}
                          {profile.lastName?.charAt(0)}
                        </span>
                      )}

                      {isEditing ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition group-hover:opacity-100">
                          <Camera className="h-5 w-5 text-white" />
                        </span>
                      ) : null}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <Badge className="border-white/10 bg-white/10 text-slate-200">{capitalize(profile.role)}</Badge>
                  </div>
                </div>

                {!isEditing ? (
                  <Button type="button" onClick={handleEditClick} variant="secondary" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </Button>
                ) : null}
              </div>

              {isEditing ? (
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                  {isEditing ? (
                    <button type="button" onClick={handleAvatarClick} className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
                      Change photo
                    </button>
                  ) : null}

                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                    placeholder="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                    placeholder="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" disabled={isBusy} className="flex-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      {uploading ? 'Uploading photo...' : saving ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isBusy}
                      className="flex-1 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">First name</p>
                    <p className="mt-1 text-sm text-slate-100">{profile.firstName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last name</p>
                    <p className="mt-1 text-sm text-slate-100">{profile.lastName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Username</p>
                    <p className="mt-1 text-sm text-slate-100">{profile.username}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                    <p className="mt-1 text-sm text-slate-100">{profile.email}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                    <p className="mt-1 text-sm text-slate-100">{capitalize(profile.role)}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Joined date</p>
                    <p className="mt-1 text-sm text-slate-100">{formatCreatedAt(profile.createdAt)}</p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </PageContainer>
    </section>
  );
}