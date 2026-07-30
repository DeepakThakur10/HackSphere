import { useEffect, useState, useRef } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function DecryptedText({
  text = '',
  speed = 40,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover', // 'view' | 'hover' | 'both'
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  const getRandomChar = (targetChar) => {
    if (useOriginalCharsOnly && text) {
      return text[Math.floor(Math.random() * text.length)];
    }
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  };

  useEffect(() => {
    let intervalId;
    let iteration = 0;

    const shouldAnimate =
      (animateOn === 'hover' && isHovered) ||
      (animateOn === 'view' && hasAnimated) ||
      (animateOn === 'both' && (isHovered || hasAnimated));

    if (!shouldAnimate) {
      setDisplayText(text);
      return;
    }

    intervalId = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';

            if (sequential) {
              if (index < iteration / maxIterations) {
                return text[index];
              }
              return getRandomChar(char);
            } else {
              if (Math.random() < iteration / (maxIterations * text.length)) {
                return text[index];
              }
              return getRandomChar(char);
            }
          })
          .join('');
      });

      iteration++;

      if (iteration > maxIterations * text.length) {
        clearInterval(intervalId);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, maxIterations, sequential, isHovered, hasAnimated, animateOn]);

  useEffect(() => {
    if (animateOn === 'view' || animateOn === 'both') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
          }
        },
        { threshold: 0.2 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }
  }, [animateOn]);

  return (
    <span
      ref={containerRef}
      className={`inline-block cursor-default ${parentClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
}
