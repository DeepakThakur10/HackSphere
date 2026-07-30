export default function SkeletonLoader({
  type = 'card',
  count = 3,
  className = '',
}) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`grid gap-6 lg:grid-cols-3 ${className}`}>
        {items.map((_, index) => (
          <div
            key={index}
            className="flex h-72 flex-col justify-between rounded-2xl border border-border bg-gradient-to-r from-surfaceMuted via-white to-surfaceMuted bg-[length:200%_100%] p-6 animate-pulse"
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-8 w-24 rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 rounded-2xl border border-border bg-white p-6 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-3 border-b border-border/50 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="space-y-1">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`h-32 w-full animate-pulse rounded-2xl bg-surfaceMuted ${className}`} />
  );
}
