import { useState } from 'react';
import { CreditCard, Upload, Users, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { uploadImageRequest } from '../../services/api';

export default function RegistrationModal({ hackathon, isOpen, onClose, onSubmit, submitting }) {
  const [teamName, setTeamName] = useState('');
  const [memberEmailsInput, setMemberEmailsInput] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !hackathon) {
    return null;
  }

  const isTeamEvent = hackathon.teamType === 'team';
  const isPaidEvent = hackathon.entryFee && Number(hackathon.entryFee) > 0;

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImageRequest(formData);
      setPaymentProof(res.data.url);
    } catch (err) {
      // If upload fails, fallback to direct text input
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const memberEmails = memberEmailsInput
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    onSubmit({
      teamName,
      memberEmails,
      paymentProof,
    });
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
          <Badge>Registration</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{hackathon.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {isTeamEvent
              ? `Team Hackathon (${hackathon.minTeamSize} - ${hackathon.maxTeamSize} members). Enter team name and teammate emails below.`
              : 'Individual Hackathon. Confirm below to complete your registration.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Team Name Input */}
          {isTeamEvent ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-1.5">
                Team Name {isTeamEvent ? '*' : '(Optional)'}
              </label>
              <input
                type="text"
                placeholder="e.g. CyberKnights"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required={isTeamEvent}
                disabled={submitting}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
              />
            </div>
          ) : null}

          {/* Member Emails Input */}
          {isTeamEvent ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-1.5">
                Teammate Emails (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="colleague1@gmail.com, colleague2@gmail.com"
                value={memberEmailsInput}
                onChange={(e) => setMemberEmailsInput(e.target.value)}
                disabled={submitting}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-300"
              />
            </div>
          ) : null}

          {/* Payment Section for Paid Events */}
          {isPaidEvent ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Paid Entry Fee: ${hackathon.entryFee} USD</span>
              </div>
              <p className="text-xs text-text-secondary">
                Upload payment receipt screenshot or enter transaction reference number/URL below.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary mb-1">
                  Payment Proof / Receipt Reference *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Transaction ID / UTR or Receipt Link"
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                    required
                    disabled={submitting || uploading}
                    className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-text-primary cursor-pointer hover:bg-brand-50">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Uploading...' : 'File'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Button type="submit" size="lg" disabled={submitting || uploading} className="flex-1 justify-center">
              {submitting ? 'Registering...' : 'Confirm Registration'}
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