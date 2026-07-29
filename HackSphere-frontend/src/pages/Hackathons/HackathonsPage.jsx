import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Layers3, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
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

  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
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
  if (status === 'registration_closed') {
    return 'Registration closed';
  }

  if (status === 'ongoing') {
    return 'Ongoing';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

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

  const summary = useMemo(() => {
    const modeCounts = hackathons.reduce(
      (accumulator, hackathon) => {
        const normalizedMode = hackathon.mode || 'hybrid';
        accumulator.total += 1;
        accumulator.modes.add(normalizedMode);
        accumulator.prize += Number(hackathon.prizePool || 0);
        return accumulator;
      },
      {
        total: 0,
        modes: new Set(),
        prize: 0,
      }
    );

    return [
      { label: 'Published hackathons', value: modeCounts.total.toString().padStart(2, '0') },
      { label: 'Active modes', value: modeCounts.modes.size.toString().padStart(2, '0') },
      { label: 'Total prize pool', value: formatCurrency(modeCounts.prize) },
      { label: 'Tracks covered', value: trackOptions.length > 1 ? String(trackOptions.length - 1).padStart(2, '0') : '00' },
    ];
  }, [hackathons, trackOptions]);

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

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedMode !== 'all' || selectedTrack !== 'all' || sortValue !== 'latest';

  return (
    <section className="relative overflow-hidden bg-slate-950 py-10 text-slate-100 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <PageContainer className="relative">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Discover hackathons
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Find your next build-worthy hackathon</h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Browse live opportunities from the backend, refine by track and mode, and move into the event details flow when you are ready to register.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summary.map((item) => (
                <Card key={item.label} className="border-white/10 bg-white/5 p-5 text-slate-100 shadow-none backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Search className="h-4 w-4" />
                  Search
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 focus-within:border-cyan-400/40">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search title, organizer, track, or location"
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Filter className="h-4 w-4" />
                  Mode
                </span>
                <select
                  value={selectedMode}
                  onChange={(event) => setSelectedMode(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                >
                  {modeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Layers3 className="h-4 w-4" />
                  Track
                </span>
                <select
                  value={selectedTrack}
                  onChange={(event) => setSelectedTrack(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
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
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort by
                </span>
                <select
                  value={sortValue}
                  onChange={(event) => setSortValue(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
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
                className="border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                Clear
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-white/10 bg-white/5 p-0 text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                  <div className="space-y-5 p-6">
                    <div className="h-6 w-24 rounded-full bg-white/10" />
                    <div className="h-7 w-4/5 rounded-xl bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-5/6 rounded-full bg-white/10" />
                    <div className="grid gap-3 pt-3 sm:grid-cols-2">
                      <div className="h-12 rounded-2xl bg-white/10" />
                      <div className="h-12 rounded-2xl bg-white/10" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Could not load hackathons</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Try again
                </Button>
              </div>
            </Card>
          ) : filteredHackathons.length === 0 ? (
            <Card className="border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">No hackathons match your filters</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Try a wider search, switch the mode filter back to all, or clear the track filter to discover more events.
              </p>
              <div className="mt-6 flex justify-center">
                <Button type="button" onClick={clearFilters} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Reset filters
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {visibleHackathons.map((hackathon) => (
                  <Card
                    key={hackathon.id}
                    className="group flex h-full flex-col border-white/10 bg-white/5 p-0 text-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                  >
                    <div className="flex h-full flex-col justify-between p-6">
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">{getStatusLabel(hackathon.status)}</Badge>
                              <Badge className="border-white/10 bg-white/10 text-slate-200">{capitalize(hackathon.mode)}</Badge>
                            </div>
                            <h2 className="text-xl font-semibold tracking-tight text-white">{hackathon.title}</h2>
                            <p className="text-sm leading-6 text-slate-300">{hackathon.description}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Organizer</p>
                            <p className="mt-2 text-slate-100">{hackathon.organizer}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Location</p>
                            <p className="mt-2 text-slate-100">{hackathon.location}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Registration</p>
                            <p className="mt-2 text-slate-100">{formatDateRange(hackathon.registrationStart, hackathon.registrationEnd)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Event dates</p>
                            <p className="mt-2 text-slate-100">{formatDateRange(hackathon.hackathonStart, hackathon.hackathonEnd)}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prize pool</p>
                            <p className="text-lg font-semibold text-white">{formatCurrency(hackathon.prizePool)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hackathon.tracks.length > 0 ? (
                              hackathon.tracks.map((track) => (
                                <span
                                  key={track}
                                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                                >
                                  {track}
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                                General
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                          </span>
                          <div>
                            <p className="font-medium text-slate-100">Live from backend</p>
                            <p>Updated on {dateFormatter.format(new Date(hackathon.createdAt || Date.now()))}</p>
                          </div>
                        </div>

                        <Button
                          as={Link}
                          to={`/hackathons/${hackathon.id}`}
                          className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        >
                          View details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-300">
                  Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-white">{Math.min(startIndex + pageSize, filteredHackathons.length)}</span> of{' '}
                  <span className="font-semibold text-white">{filteredHackathons.length}</span> hackathons
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-slate-100">
                      Page {safeCurrentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}