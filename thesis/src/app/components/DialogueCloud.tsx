import React from 'react';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  tailDirection?: 'bottom' | 'top' | 'left' | 'right';
};

export default function DialogueCloud({ children, style, tailDirection = 'bottom' }: Props) {
  const bubble: React.CSSProperties = {
    background: '#ffffff',
    color: '#111827',
    padding: '10px 14px',
    borderRadius: 14,
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
    display: 'inline-block',
    maxWidth: 220,
    fontSize: 15,
    lineHeight: '1.2',
  };

  const wrapper: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  // Tail position styles (default bottom)
  const tailCommon: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  };

  const tailStyleBottom: React.CSSProperties = {
    ...tailCommon,
    bottom: -6,
  };
  const tailStyleTop: React.CSSProperties = {
    ...tailCommon,
    top: -6,
    transform: 'translateX(-50%) rotate(180deg)'
  };

  // For left/right tails we could extend later; keep bottom and top for now
  const chosenTailStyle = tailDirection === 'top' ? tailStyleTop : tailStyleBottom;

  return (
    <div style={wrapper}>
      <div style={{ ...bubble, ...style }}>{children}</div>
      {/* simple triangular tail using SVG so it matches bubble background */}
      <svg width="28" height="12" viewBox="0 0 28 12" style={chosenTailStyle} aria-hidden>
        <path d="M0,0 L14,12 L28,0" fill="#ffffff" />
      </svg>
    </div>
  );
}
