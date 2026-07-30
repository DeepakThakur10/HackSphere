import './StarBorder.css';

export default function StarBorder({
  children,
  color = '#f59e0b',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`star-border-container ${className}`}
      style={{ '--star-color': color, ...style }}
      {...props}
    >
      <div className="star-border-glow" />
      <div className="star-border-content">{children}</div>
    </div>
  );
}
