import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Trophy } from 'lucide-react';
import PageContainer from '../common/PageContainer';
import SectionHeading from '../common/SectionHeading';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ElectricBorder from '../ui/ElectricBorder';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';
import SkeletonLoader from '../ui/SkeletonLoader';
import { getHackathonsRequest } from '../../services/api';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const formatMode = (mode) => {
  if (!mode) {
    return 'Hybrid';
  }

  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const formatStatus = (status) => {
  if (status === 'registration_closed') {
    return 'Registration closed';
  }

  if (status === 'ongoing') {
    return 'Ongoing';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  return 'Open';
};

const formatPrize = (prizePool) => {
  if (!prizePool) {
    return 'Free';
  }

  return currencyFormatter.format(prizePool);
};

const formatDateRange = (start, end) => {
  if (!start || !end) {
    return 'Dates coming soon';
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
};

const mapHackathon = (hackathon) => ({
  id: hackathon._id,
  name: hackathon.title,
  organizer: [hackathon.createdBy?.firstName, hackathon.createdBy?.lastName].filter(Boolean).join(' ') || hackathon.createdBy?.email || 'HackSphere Organizer',
  date: formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd),
  mode: formatMode(hackathon.mode),
  prize: formatPrize(hackathon.prizePool),
  status: formatStatus(hackathon.status),
  category: hackathon.techStack?.length ? hackathon.techStack.join(' / ') : 'Hackathon',
  location: hackathon.location || 'Location TBA',
});

export default function FeaturedHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadHackathons = async () => {
      try {
        setLoading(true);
        const response = await getHackathonsRequest({ limit: 3 });

        if (isMounted) {
          setHackathons((response.data.data || []).map(mapHackathon));
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || 'Unable to load hackathons');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHackathons();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <PageContainer>
        <ScrollReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Featured"
              title="Hackathons worth joining"
              description="Live hackathons pulled from the backend, showing the basics teams care about first."
            />
            <Button variant="secondary">View all hackathons</Button>
          </div>
        </ScrollReveal>

        <div className="mt-10">
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : error ? (
            <Card className="border-dashed text-center text-text-secondary">
              <p className="text-sm font-medium text-text-primary">Could not load hackathons</p>
              <p className="mt-2 text-sm">{error}</p>
            </Card>
          ) : hackathons.length === 0 ? (
            <Card className="border-dashed text-center text-text-secondary">
              <p className="text-sm font-medium text-text-primary">No published hackathons yet</p>
              <p className="mt-2 text-sm">Once your backend has published events, they will appear here automatically.</p>
            </Card>
          ) : (
            <ScrollReveal delay={150}>
              <div className="grid gap-6 lg:grid-cols-3">
                {hackathons.map((hackathon) => (
                  <ElectricBorder key={hackathon.id} color="#1d6eeb" speed={1} chaos={0.12} borderRadius={24} style={{ height: '100%' }}>
                    <TiltCard maxTilt={10} className="h-full">
                      <Card className="group flex h-full flex-col justify-between transition hover:-translate-y-1 hover:shadow-card">
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
                              <span>{hackathon.mode} · {hackathon.location}</span>
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
                    </TiltCard>
                  </ElectricBorder>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
