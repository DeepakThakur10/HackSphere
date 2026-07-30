import './Aurora.css';

export default function Aurora({ className = '' }) {
  return (
    <div className={`aurora-container ${className}`}>
      <div className="aurora-bg" />
    </div>
  );
}
