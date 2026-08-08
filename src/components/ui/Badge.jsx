import React from 'react';

export const Badge = ({ children, variant = 'info', size = 'md', className = '' }) => {
  const badgeStyles = {
    patient: { bg: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8', border: '1px solid rgba(14, 165, 233, 0.3)' },
    doctor: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' },
    admin: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' },
    success: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', border: '1px solid rgba(99, 102, 241, 0.3)' },
  };

  const styleConfig = badgeStyles[variant] || badgeStyles.info;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: '600',
        borderRadius: 'var(--radius-full)',
        backgroundColor: styleConfig.bg,
        color: styleConfig.color,
        border: styleConfig.border,
        textTransform: 'capitalize',
      }}
      className={className}
    >
      {children}
    </span>
  );
};
