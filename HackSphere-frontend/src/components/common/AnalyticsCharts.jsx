import Card from '../ui/Card';

export function SimpleBarChart({ title, data = [], height = 180 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className="p-6 space-y-4">
      {title ? <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3> : null}
      <div className="flex items-end justify-between gap-2 pt-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const percentage = Math.round((item.value / maxValue) * 100);
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-semibold text-text-muted opacity-0 group-hover:opacity-100 transition">
                {item.value}
              </div>
              <div className="w-full bg-brand-50 rounded-t-xl overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full bg-brand-600 rounded-t-xl transition-all duration-500 group-hover:bg-brand-700"
                  style={{ height: `${percentage}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-text-secondary truncate max-w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function DistributionProgressList({ title, items = [] }) {
  if (!items || items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Card className="p-6 space-y-4">
      {title ? <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3> : null}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-text-primary">{item.label}</span>
                <span className="text-text-secondary">{item.value} ({pct}%)</span>
              </div>
              <div className="h-2 w-full bg-surfaceMuted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.color || 'bg-brand-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
