export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white/90 p-6 shadow-soft backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
