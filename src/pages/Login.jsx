import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Smartphone, Mail, Lock, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';

export const Login = () => {
  const { loginWithPassword, requestOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [activeTab, setActiveTab] = useState('password');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    identifier: '',
    password: '',
  });

  // OTP Form State
  const [otpForm, setOtpForm] = useState({
    identifier: '',
    otp: '',
    type: 'email',
    role: 'patient',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordForm.identifier || !passwordForm.password) {
      setError('Please enter both identifier and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword({
        identifier: passwordForm.identifier,
        password: passwordForm.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpForm.identifier) {
      setError(`Please enter your ${otpForm.type}.`);
      return;
    }

    try {
      setLoading(true);
      const msg = await requestOtp({
        identifier: otpForm.identifier,
        type: otpForm.type,
      });
      setOtpSent(true);
      setTimer(60);
      setSuccess(msg || `OTP sent to your ${otpForm.type}. Please check your inbox.`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpForm.otp || otpForm.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      await loginWithOtp({
        identifier: otpForm.identifier,
        otp: otpForm.otp,
        type: otpForm.type,
        role: otpForm.role,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '1rem 0',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
        <Card style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: '1px solid var(--primary)',
              }}
            >
              <Lock size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Sign in to access your Docpa portal
            </p>
          </div>

          <Tabs
            tabs={[
              { id: 'password', label: 'Password Login', icon: KeyRound },
              { id: 'otp', label: 'OTP Login', icon: Smartphone },
            ]}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setError('');
              setSuccess('');
            }}
          />

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} onClose={() => setSuccess('')} />

          {/* TAB 1: PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <Input
                label="Email or Mobile Phone"
                name="identifier"
                placeholder="e.g., name@example.com or 9876543210"
                icon={Mail}
                value={passwordForm.identifier}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, identifier: e.target.value })
                }
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                icon={Lock}
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                style={{ marginTop: '0.5rem' }}
              >
                Sign In with Password
              </Button>
            </form>
          )}

          {/* TAB 2: OTP LOGIN */}
          {activeTab === 'otp' && (
            <div>
              {/* Type Switcher (Email vs Phone) */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '1rem',
                  background: 'var(--bg-input)',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOtpForm({ ...otpForm, type: 'email', identifier: '' });
                    setOtpSent(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: otpForm.type === 'email' ? 'var(--primary)' : 'transparent',
                    color: otpForm.type === 'email' ? '#FFF' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpForm({ ...otpForm, type: 'phone', identifier: '' });
                    setOtpSent(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: otpForm.type === 'phone' ? 'var(--primary)' : 'transparent',
                    color: otpForm.type === 'phone' ? '#FFF' : 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Mobile OTP
                </button>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <Input
                    label={otpForm.type === 'email' ? 'Email Address' : 'Mobile Phone'}
                    name="identifier"
                    placeholder={
                      otpForm.type === 'email' ? 'you@example.com' : '10-digit mobile number'
                    }
                    icon={otpForm.type === 'email' ? Mail : Smartphone}
                    value={otpForm.identifier}
                    onChange={(e) => setOtpForm({ ...otpForm, identifier: e.target.value })}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    icon={Shield}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Send One-Time Password
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpSubmit}>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Sent to: <strong>{otpForm.identifier}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                      }}
                    >
                      Edit
                    </button>
                  </div>

                  <Input
                    label="6-Digit Verification Code"
                    name="otp"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    icon={ArrowRight}
                  >
                    Verify OTP & Sign In
                  </Button>

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {timer > 0 ? (
                      <span>Resend code in <strong>{timer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RefreshCw size={14} /> Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
            >
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
