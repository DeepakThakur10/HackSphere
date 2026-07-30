export default function Badge({ className = '', children, ...props }) {
  const hasBg = className.includes('bg-');
  const hasText = className.includes('text-');
  const hasBorder = className.includes('border-');

  const defaultClasses = `${hasBorder ? '' : 'border border-brand-100'} ${hasBg ? '' : 'bg-brand-50'} ${hasText ? '' : 'text-brand-700'}`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${defaultClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
