import React from 'react';

export const Card = ({ children, title, subtitle, className = '', headerAction, style = {} }) => {
  return (
    <div className={`glass-card ${className}`} style={{ padding: '1.75rem', ...style }}>
      {(title || subtitle || headerAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: title ? '1rem' : 0,
            borderBottom: title ? '1px solid var(--border-color)' : 'none',
          }}
        >
          <div>
            {title && <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
