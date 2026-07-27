export default function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignmentClasses = align === 'center' ? 'mx-auto text-center' : 'text-left';

  return (
    <div className={`${alignmentClasses} max-w-2xl`}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-text-secondary">{description}</p> : null}
    </div>
  );
}
