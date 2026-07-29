import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/common/PageContainer';
import { useAuth } from '../../context/authContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
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
      await signup(formData);
      toast.success('Account created. Sign in to continue.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-2xl">
        <Card className="mx-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Join HackSphere</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Create your account in the backend and use the same session for the frontend experience.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                placeholder="First name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                placeholder="Last name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
              placeholder="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
            />
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="font-medium text-brand-700">Sign in</Link>
          </p>
        </Card>
      </PageContainer>
    </section>
  );
}
