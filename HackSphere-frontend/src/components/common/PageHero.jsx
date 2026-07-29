import PageContainer from './PageContainer';

export default function PageHero({
  badge,
  title,
  description,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50/50 via-transparent to-transparent py-12 sm:py-16 ${className}`}>
      <PageContainer>
        <div className="mx-auto max-w-4xl">
          {badge ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
              {badge}
            </div>
          ) : null}

          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              {description}
            </p>
          ) : null}

          {actions ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          ) : null}

          {children}
        </div>
      </PageContainer>
    </div>
  );
}
