export default function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 ${className}`}
    >
      {children}
    </span>
  );
}
