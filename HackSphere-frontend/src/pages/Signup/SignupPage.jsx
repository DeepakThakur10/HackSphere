import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, Award } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/authContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();

  const inviteToken = searchParams.get('inviteToken') || '';
  const inviteRole = searchParams.get('role') || '';
  const inviteEmail = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: inviteEmail,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteEmail) {
      setFormData((prev) => ({ ...prev, email: inviteEmail }));
    }
  }, [inviteEmail]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        ...formData,
        inviteToken,
        role: inviteRole || (inviteToken ? 'judge' : undefined),
      });

      if (inviteToken || inviteRole === 'judge' || res?.data?.role === 'judge') {
        toast.success('Judge account created successfully! Opening your Judge Dashboard.');
        navigate('/judge/dashboard');
      } else {
        toast.success('Account created! Sign in to continue.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge={inviteToken ? 'Judge Invitation' : 'Account Onboarding'}
        title={inviteToken ? 'Register as Invited Judge' : 'Join the HackSphere Community'}
        description={
          inviteToken
            ? 'Complete your registration to access your judge evaluation panel and review assigned hackathon entries.'
            : 'Create your account to register for hackathons, build innovative projects with teams, and host your own events.'
        }
      />

      {/* Main Form Container */}
      <PageContainer className="pt-10">
        <div className="mx-auto max-w-xl space-y-6">
          {inviteToken ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <Badge className="mb-1">Judge Invitation Token Detected</Badge>
                <p className="text-xs text-text-secondary">
                  Your account will automatically be assigned as an evaluation judge upon completion.
                </p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              icon={UserPlus}
              title="Registration Details"
              description="Enter your personal details to set up your profile"
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                      First Name *
                    </label>
                    <input
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="First name"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={loading}
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
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                    Username *
                  </label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Choose a username"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                    Email Address *
                  </label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="name@example.com"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-2">
                    Password *
                  </label>
                  <input
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Create a strong password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="pt-4">
                  {/* Primary Action Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full justify-center"
                  >
                    <UserCheck className="h-4 w-4" />
                    {loading
                      ? 'Creating account...'
                      : inviteToken
                      ? 'Register & Open Judge Dashboard'
                      : 'Create account'}
                  </Button>
                </div>
              </div>
            </FormSection>

            {/* Redirect Helper */}
            <div className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </PageContainer>
    </section>
  );
}
