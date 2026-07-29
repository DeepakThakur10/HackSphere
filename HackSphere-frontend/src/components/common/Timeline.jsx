import { CheckCircle2 } from 'lucide-react';

export default function Timeline({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <div className="w-full py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        {steps.map((step, index) => {
          const isDone = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div
              key={step.key || index}
              className="flex-1 flex items-start sm:flex-col sm:items-center text-left sm:text-center gap-3 relative"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 ? (
                <div
                  className={`hidden sm:block absolute top-5 left-1/2 w-full h-0.5 -z-0 transition ${
                    isDone ? 'bg-brand-600' : 'bg-border'
                  }`}
                />
              ) : null}

              {/* Step indicator circle */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition font-semibold text-sm shadow-soft ${
                  isDone
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : isCurrent
                    ? 'border-brand-600 bg-white text-brand-700 ring-4 ring-brand-500/20'
                    : 'border-border bg-white text-text-muted'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Label & Subtext */}
              <div className="space-y-0.5">
                <p
                  className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDone || isCurrent ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="text-[11px] text-text-secondary leading-snug max-w-[140px]">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
