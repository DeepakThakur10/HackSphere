import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/common/PageContainer';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center py-16">
      <PageContainer>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">404</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            The page you were looking for does not exist or has moved.
          </p>
          <div className="mt-8 flex justify-center">
            <Button as={Link} to="/">
              Back to home
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
