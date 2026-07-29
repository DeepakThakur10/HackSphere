import Card from '../ui/Card';

export default function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <Card className={`p-6 sm:p-8 space-y-6 ${className}`}>
      {(Icon || title || description) ? (
        <div className="flex items-center gap-3 border-b border-border pb-4">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div>
            {title ? (
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-text-secondary">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div>{children}</div>
    </Card>
  );
}
