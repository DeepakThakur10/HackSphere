import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function RegistrationModal({ hackathon, isOpen, onClose, onSubmit, submitting }) {
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTeamName('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isTeamEvent = hackathon.teamType === 'team';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    onSubmit({
      // TODO: no Registration model exists yet, so this payload shape is
      // provisional. Extend/adjust once the backend defines what a
      // registration actually stores.
      teamName: isTeamEvent ? teamName.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
      />

      <Card className="relative w-full max-w-lg border-white/10 bg-slate-900/95 p-6 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Close registration form"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Register</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{hackathon.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {isTeamEvent
            ? `This is a team hackathon (${hackathon.minTeamSize} - ${hackathon.maxTeamSize} members). Enter your team name to continue.`
            : 'This is an individual hackathon. Confirm below to register.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isTeamEvent ? (
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
              placeholder="Team name"
              name="teamName"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              required
            />
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={submitting} className="flex-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              {submitting ? 'Registering...' : 'Confirm registration'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}