import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, LogIn } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import FormSection from '../../components/common/FormSection';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/authContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      toast.success('Signed in successfully');
      navigate(
        location.state?.from?.pathname
          ? `${location.state.from.pathname}${location.state.from.search || ''}`
          : '/dashboard'
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="Account Access"
        title="Welcome back to HackSphere"
        description="Sign in with your registered email and password to access your dashboard, saved registrations, and organizer tools."
      />

      {/* Form Layout Container */}
      <PageContainer className="pt-10">
        <div className="mx-auto max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              icon={Lock}
              title="Credentials"
              description="Enter your email address and account password"
            >
              <div className="space-y-4">
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
                    placeholder="Enter your password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
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
                    <LogIn className="h-4 w-4" />
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </FormSection>

            {/* Account Redirect Footer Link */}
            <div className="text-center text-sm text-text-secondary">
              Don’t have an account?{' '}
              <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
                Create one now
              </Link>
            </div>
          </form>
        </div>
      </PageContainer>
    </section>
  );
}