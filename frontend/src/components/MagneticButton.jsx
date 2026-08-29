import React, { useRef, useState } from 'react';
import { soundManager } from '../lib/soundFx';

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.25,
  playSound = true,
  disabled = false,
  ...props
}) {
  const btnRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || !btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled) return;
    if (playSound) {
      try {
        soundManager.playClick();
      } catch (_) {}
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 
          ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
          : 'transform 0.1s ease-out',
      }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
