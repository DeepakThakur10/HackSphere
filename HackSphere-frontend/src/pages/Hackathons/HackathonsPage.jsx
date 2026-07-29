import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Layers3, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import PageHero from '../../components/common/PageHero';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getHackathonsRequest } from '../../services/api';

const pageSize = 6;

const modeOptions = [
  { label: 'All modes', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Hybrid', value: 'hybrid' },
];

const sortOptions = [
  { label: 'Newest first', value: 'latest' },
  { label: 'Prize high to low', value: 'prize-desc' },
  { label: 'Prize low to high', value: 'prize-asc' },
  { label: 'Start date soonest', value: 'start-asc' },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCurrency(value) {
  if (!value) {
    return 'Free';
  }
  return currencyFormatter.format(value);
}

function formatDateRange(start, end) {
  if (!start || !end) {
    return 'Dates coming soon';
  }
  return `${dateFormatter.format(new Date(start))} - ${dateFormatter.format(new Date(end))}`;
}

function getOrganizerName(createdBy) {
  if (!createdBy) {
    return 'HackSphere Organizer';
  }
  const fullName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ');
  return fullName || createdBy.email || 'HackSphere Organizer';
}

function mapHackathon(hackathon) {
  return {
    id: hackathon._id,
    title: hackathon.title,
    description: hackathon.description,
    banner: hackathon.banner,
    mode: hackathon.mode,
    location: hackathon.location || 'Location TBA',
    prizePool: hackathon.prizePool,
    status: hackathon.status,
    organizer: getOrganizerName(hackathon.createdBy),
    tracks: Array.isArray(hackathon.techStack) ? hackathon.techStack.filter(Boolean) : [],
    registrationStart: hackathon.registrationStart,
    registrationEnd: hackathon.registrationEnd,
    hackathonStart: hackathon.hackathonStart,
    hackathonEnd: hackathon.hackathonEnd,
    createdAt: hackathon.createdAt,
  };
}

function getStatusLabel(status) {
  if (status === 'registration_closed') return 'Registration closed';
  if (status === 'ongoing') return 'Ongoing';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Published';
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [sortValue, setSortValue] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    const loadHackathons = async () => {
      try {
        setLoading(true);
        const response = await getHackathonsRequest({ limit: 100 });

        if (active) {
          setHackathons((response.data.data || []).map(mapHackathon));
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load hackathons');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHackathons();

    return () => {
      active = false;
    };
  }, []);

  const trackOptions = useMemo(() => {
    const trackSet = new Set();
    hackathons.forEach((hackathon) => {
      hackathon.tracks.forEach((track) => trackSet.add(track));
    });
    return ['all', ...Array.from(trackSet).sort((left, right) => left.localeCompare(right))];
  }, [hackathons]);

  const filteredHackathons = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const items = hackathons.filter((hackathon) => {
      const searchableText = [
        hackathon.title,
        hackathon.description,
        hackathon.organizer,
        hackathon.location,
        hackathon.mode,
        ...(hackathon.tracks || []),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearchTerm || searchableText.includes(normalizedSearchTerm);
      const matchesMode = selectedMode === 'all' || hackathon.mode === selectedMode;
      const matchesTrack = selectedTrack === 'all' || hackathon.tracks.includes(selectedTrack);

      return matchesSearch && matchesMode && matchesTrack;
    });

    const sortedItems = [...items].sort((left, right) => {
      if (sortValue === 'prize-desc') {
        return Number(right.prizePool || 0) - Number(left.prizePool || 0);
      }
      if (sortValue === 'prize-asc') {
        return Number(left.prizePool || 0) - Number(right.prizePool || 0);
      }
      if (sortValue === 'start-asc') {
        return new Date(left.hackathonStart || left.createdAt).getTime() - new Date(right.hackathonStart || right.createdAt).getTime();
      }
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

    return sortedItems;
  }, [hackathons, searchTerm, selectedMode, selectedTrack, sortValue]);

  const totalPages = Math.max(1, Math.ceil(filteredHackathons.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleHackathons = filteredHackathons.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMode, selectedTrack, sortValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMode('all');
    setSelectedTrack('all');
    setSortValue('latest');
  };

  return (
    <section className="pb-16 text-text-primary">
      {/* Compact Page Hero */}
      <PageHero
        badge="Discover Hackathons"
        title="Find your next build-worthy hackathon"
        description="Browse live opportunities, refine by track or mode, and move into the event details flow when you are ready to register."
        className="py-8 sm:py-10"
      />

      {/* Main Discovery Container */}
      <PageContainer className="pt-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Filters Bar - Immediately Visible */}
          <Card className="p-6">
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  <Search className="h-4 w-4" />
                  Search
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-text-primary focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <Search className="h-4 w-4 shrink-0 text-text-muted" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search title, organizer, track, or location"
                    className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  <Filter className="h-4 w-4" />
                  Mode
                </span>
                <select
                  value={selectedMode}
                  onChange={(event) => setSelectedMode(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                >
                  {modeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  <Layers3 className="h-4 w-4" />
                  Track
                </span>
                <select
                  value={selectedTrack}
                  onChange={(event) => setSelectedTrack(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="all">All tracks</option>
                  {trackOptions
                    .filter((track) => track !== 'all')
                    .map((track) => (
                      <option key={track} value={track}>
                        {track}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort by
                </span>
                <select
                  value={sortValue}
                  onChange={(event) => setSortValue(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                type="button"
                variant="secondary"
                onClick={clearFilters}
                className="h-[46px]"
              >
                Clear
              </Button>
            </div>
          </Card>

          {/* Hackathon List Grid */}
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-64 animate-pulse bg-surfaceMuted" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={Sparkles}
              title="Could not load hackathons"
              description={error}
              actionText="Try again"
              onActionClick={() => window.location.reload()}
            />
          ) : filteredHackathons.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No hackathons match your filters"
              description="Try a wider search, switch the mode filter back to all, or clear the track filter to discover more events."
              actionText="Reset filters"
              onActionClick={clearFilters}
            />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {visibleHackathons.map((hackathon) => (
                  <Card
                    key={hackathon.id}
                    className="group flex h-full flex-col justify-between transition hover:-translate-y-1 hover:shadow-card p-6"
                  >
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{getStatusLabel(hackathon.status)}</Badge>
                        <Badge className="bg-surfaceMuted text-text-secondary border-border">{capitalize(hackathon.mode)}</Badge>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-text-primary">{hackathon.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-text-secondary line-clamp-2">{hackathon.description}</p>
                      </div>

                      <div className="grid gap-3 rounded-2xl border border-border bg-brand-50/30 p-4 text-sm text-text-secondary sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Organizer</p>
                          <p className="mt-1 font-medium text-text-primary">{hackathon.organizer}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Location</p>
                          <p className="mt-1 font-medium text-text-primary">{hackathon.location}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Registration</p>
                          <p className="mt-1 font-medium text-text-primary">{formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Event dates</p>
                          <p className="mt-1 font-medium text-text-primary">{formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Prize pool</p>
                          <p className="text-lg font-semibold text-text-primary">{formatCurrency(hackathon.prizePool)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.tracks.length > 0 ? (
                            hackathon.tracks.map((track) => (
                              <span
                                key={track}
                                className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                              >
                                {track}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                              General
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-text-muted">
                        Updated {dateFormatter.format(new Date(hackathon.createdAt || Date.now()))}
                      </div>

                      <Button
                        as={Link}
                        to={`/hackathons/${hackathon.id}`}
                        size="sm"
                      >
                        View details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Bar */}
              <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">
                  Showing <span className="font-semibold text-text-primary">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-text-primary">{Math.min(startIndex + pageSize, filteredHackathons.length)}</span> of{' '}
                  <span className="font-semibold text-text-primary">{filteredHackathons.length}</span> hackathons
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <span className="text-sm font-medium text-text-secondary">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}