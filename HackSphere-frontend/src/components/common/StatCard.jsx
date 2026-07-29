import Card from '../ui/Card';

export default function StatCard({
  icon: Icon,
  label,
  value,
  helpText,
  className = '',
}) {
  return (
    <Card className={`p-6 transition hover:shadow-card ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
      {helpText ? (
        <p className="mt-2 text-xs text-text-secondary">{helpText}</p>
      ) : null}
    </Card>
  );
}
