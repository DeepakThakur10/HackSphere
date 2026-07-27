import { CalendarDays, MapPin, Trophy } from 'lucide-react';
import PageContainer from '../common/PageContainer';
import SectionHeading from '../common/SectionHeading';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { featuredHackathons } from '../../constants/mockData';

export default function FeaturedHackathons() {
  return (
    <section className="py-12 sm:py-16">
      <PageContainer>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Featured"
            title="Hackathons worth joining"
            description="A curated set of events that show how HackSphere can surface deadlines, prizes, and format at a glance."
          />
          <Button variant="secondary">View all hackathons</Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="group flex h-full flex-col justify-between transition hover:-translate-y-1 hover:shadow-card">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge>{hackathon.status}</Badge>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">{hackathon.name}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{hackathon.organizer}</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-text-secondary">{hackathon.category}</p>

                <div className="mt-6 space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-brand-600" />
                    <span>{hackathon.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span>{hackathon.mode}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Prize pool</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">{hackathon.prize}</p>
                </div>
                <button className="text-sm font-medium text-brand-700 transition hover:text-brand-800">
                  View details
                </button>
              </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
