import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/common/PageContainer';
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

    try {
      setLoading(true);
      await login(formData);
      toast.success('Signed in successfully');
      navigate(location.state?.from?.pathname ? `${location.state.from.pathname}${location.state.from.search || ''}` : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-2xl">
        <Card className="mx-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Sign in to HackSphere</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Sign in with the account created on your backend to access your dashboard and saved sessions.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
              placeholder="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
              placeholder="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-text-secondary">
            Don’t have an account? <Link to="/signup" className="font-medium text-brand-700">Create one</Link>
          </p>
        </Card>
      </PageContainer>
    </section>
  );
}