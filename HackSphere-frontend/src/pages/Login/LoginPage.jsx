import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/common/PageContainer';

export default function LoginPage() {
  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-2xl">
        <Card className="mx-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Sign in to HackSphere</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Login form scaffolding is in place. Wire this up to the backend auth endpoint next.
          </p>
          <div className="mt-8 space-y-4">
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300" placeholder="Email address" />
            <input className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300" placeholder="Password" type="password" />
            <Button className="w-full">Sign in</Button>
          </div>
          <p className="mt-6 text-sm text-text-secondary">
            Don’t have an account? <Link to="/signup" className="font-medium text-brand-700">Create one</Link>
          </p>
        </Card>
      </PageContainer>
    </section>
  );
}
