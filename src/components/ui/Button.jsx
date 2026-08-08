import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)',
    opacity: disabled || loading ? 0.65 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
  };

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '0.85rem' },
    md: { padding: '10px 20px', fontSize: '0.95rem' },
    lg: { padding: '14px 28px', fontSize: '1.05rem' },
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px var(--primary-glow)',
      '&:hover': { backgroundColor: 'var(--primary-hover)' },
    },
    secondary: {
      backgroundColor: 'var(--secondary)',
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--border-color)',
      color: 'var(--text-main)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px var(--danger-glow)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-muted)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizes[size],
    ...variants[variant],
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={combinedStyles}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 18} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : 18} />
      ) : null}
      {children}
    </button>
  );
};
