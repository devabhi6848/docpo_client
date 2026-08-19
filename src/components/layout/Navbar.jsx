import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useClinic } from '../../context/ClinicContext';
import { Button } from '../ui/Button';
import {
  Activity,
  LogOut,
  User,
  Stethoscope,
  Users,
  Settings,
  Tv,
  Receipt,
  FileText,
  TrendingUp,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeClinic } = useClinic();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';
  const isReception =
    user?.role === 'receptionist' ||
    user?.role === 'doctor' ||
    user?.role === 'admin' ||
    user?.role === 'nurse';

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--text-main)',
            fontWeight: '800',
            fontSize: '1.25rem',
            letterSpacing: '-0.025em',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={20} />
          </div>
          <span>Docpa</span>
          <span
            style={{
              fontSize: '0.65rem',
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '700',
            }}
          >
            DOCON PRO
          </span>
        </Link>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Quick Navigation Links */}
            {isDoctor && (
              <Link
                to="/doctor/dashboard"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Stethoscope size={16} /> Doctor Suite
              </Link>
            )}

            {isReception && (
              <Link
                to="/reception/dashboard"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Users size={16} /> Reception Desk
              </Link>
            )}

            {isReception && (
              <Link
                to="/billing/desk"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Receipt size={16} /> Billing POS
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/analytics"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <TrendingUp size={16} /> Analytics
              </Link>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderLeft: '1px solid var(--border-color)',
                paddingLeft: '1rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <User size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {user?.name}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
            >
              Register Clinic
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
