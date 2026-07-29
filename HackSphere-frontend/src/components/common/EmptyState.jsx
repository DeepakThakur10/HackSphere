import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionTo,
  onActionClick,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-dashed border-border bg-brand-50/40 px-6 py-12 text-center ${className}`}>
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 shadow-soft">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}

      <h3 className="mt-4 text-base font-semibold text-text-primary">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">{description}</p>
      ) : null}

      {actionText ? (
        <div className="mt-5">
          {actionTo ? (
            <Button as={Link} to={actionTo}>
              {actionText}
            </Button>
          ) : (
            <Button type="button" onClick={onActionClick}>
              {actionText}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
