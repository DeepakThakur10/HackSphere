import { X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function RegistrationModal({ hackathon, isOpen, onClose, onSubmit, submitting }) {
  if (!isOpen) {
    return null;
  }

  const isTeamEvent = hackathon.teamType === 'team';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
      />

      <Card className="relative w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-card">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition hover:border-brand-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Close registration form"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <Badge>Register</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{hackathon.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {isTeamEvent
              ? `This is a team hackathon (${hackathon.minTeamSize} - ${hackathon.maxTeamSize} members). Confirm below to register. You can create a team or join one via invite code after registering.`
              : 'This is an individual hackathon. Confirm below to complete your registration.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Button type="submit" size="lg" disabled={submitting} className="flex-1 justify-center">
              {submitting ? 'Registering...' : 'Confirm registration'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}