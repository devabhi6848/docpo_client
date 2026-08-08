import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home as HomeIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 150px)',
      }}
    >
      <Card style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>404 - Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.75rem', fontSize: '0.9rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={HomeIcon} fullWidth>
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};
