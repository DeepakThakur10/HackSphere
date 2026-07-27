import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/common/PageContainer';

export default function SignupPage() {
  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-2xl">
        <Card className="mx-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Join HackSphere</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Signup form scaffolding is ready for role selection and backend integration.
          </p>
          <div className="mt-8 space-y-4">
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300" placeholder="Full name" />
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300" placeholder="Email address" />
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300" placeholder="Password" type="password" />
            <Button className="w-full">Create account</Button>
          </div>
          <p className="mt-6 text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="font-medium text-brand-700">Sign in</Link>
          </p>
        </Card>
      </PageContainer>
    </section>
  );
}
