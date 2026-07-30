import { useState, useEffect } from 'react';

export default function Spotlight({
  className = '',
  fill = 'rgba(29, 110, 235, 0.12)',
  radius = 600,
}) {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ${className}`}
      style={{
        background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${fill}, transparent 80%)`,
      }}
    />
  );
}
