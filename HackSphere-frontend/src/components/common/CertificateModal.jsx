import { useRef } from 'react';
import { Award, Download, Printer, ShieldCheck, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function CertificateModal({
  isOpen,
  onClose,
  participantName,
  hackathonTitle,
  awardTitle = 'Certificate of Achievement',
  rankLabel = 'Official Participant',
  issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
}) {
  const certificateRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative w-full max-w-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-text-primary">Verified Certificate</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-surfaceMuted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Certificate Printable Area */}
        <div
          ref={certificateRef}
          className="printable-certificate relative overflow-hidden rounded-2xl border-8 border-brand-100 bg-gradient-to-br from-brand-50/40 via-white to-brand-50/20 p-8 sm:p-12 text-center space-y-6 shadow-inner"
        >
          {/* Subtle Watermark */}
          <Award className="absolute -right-12 -bottom-12 h-64 w-64 text-brand-200/20 pointer-events-none" />

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">HackSphere Platform</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">{awardTitle}</h1>
            <Badge className="mt-2 bg-brand-100 text-brand-800 border-brand-300 px-4 py-1 text-sm font-semibold">
              {rankLabel}
            </Badge>
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.18em] text-text-muted">This is proudly presented to</p>

          <div className="py-2 border-b-2 border-brand-600 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-text-primary sm:text-3xl font-serif tracking-wide">{participantName}</h3>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
            For outstanding performance and successful project completion in <strong>{hackathonTitle}</strong>.
          </p>

          <div className="pt-8 flex items-end justify-between border-t border-border/80">
            <div className="text-left space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Date Issued</p>
              <p className="text-xs font-medium text-text-primary">{issueDate}</p>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Verified Certificate
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">HackSphere Board</p>
              <p className="text-xs font-serif font-bold text-brand-700">HackSphere Verification</p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
