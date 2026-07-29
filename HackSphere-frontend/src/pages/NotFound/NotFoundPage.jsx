import { Compass } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import EmptyState from '../../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <section className="pb-16 text-text-primary">
      {/* Page Hero */}
      <PageHero
        badge="404 Error"
        title="Page Not Found"
        description="The page you were looking for does not exist or has moved."
      />

      {/* Main Content */}
      <PageContainer className="pt-10">
        <div className="mx-auto max-w-xl">
          <EmptyState
            icon={Compass}
            title="Lost your way?"
            description="Navigate back to safety or explore live hackathons on the platform."
            actionText="Back to home"
            actionTo="/"
          />
        </div>
      </PageContainer>
    </section>
  );
}
