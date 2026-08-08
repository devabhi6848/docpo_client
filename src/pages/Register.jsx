import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Smartphone, Lock, User, KeyRound, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';

export const Register = () => {
  const { registerWithPassword, requestOtp, registerWithOtp } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('password');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Registration State
  const [passForm, setPassForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
  });

  // OTP Registration State
  const [otpForm, setOtpForm] = useState({
    name: '',
    identifier: '',
    otp: '',
    type: 'email',
    role: 'patient',
    password: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handlePasswordRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passForm.email && !passForm.phone) {
      setError('Please provide either an email or a phone number.');
      return;
    }

    if (passForm.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await registerWithPassword(passForm);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. User may already exist.');
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
      setSuccess(msg || `Verification code sent to ${otpForm.identifier}.`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpForm.otp || otpForm.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      await registerWithOtp(otpForm);
      setSuccess('Registration verified! Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to complete registration with OTP.');
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
        padding: '1.5rem 0',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }} className="animate-fade-in">
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
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create an Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Join Docpa platform as a Patient, Doctor, or Admin
            </p>
          </div>

          <Tabs
            tabs={[
              { id: 'password', label: 'Password Register', icon: KeyRound },
              { id: 'otp', label: 'OTP Register', icon: Smartphone },
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

          {/* TAB 1: PASSWORD REGISTER */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordRegister}>
              <Input
                label="Full Name"
                name="name"
                placeholder="Dr. John Doe"
                icon={User}
                value={passForm.name}
                onChange={(e) => setPassForm({ ...passForm, name: e.target.value })}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                icon={Mail}
                value={passForm.email}
                onChange={(e) => setPassForm({ ...passForm, email: e.target.value })}
              />

              <Input
                label="Mobile Phone Number"
                name="phone"
                placeholder="10-digit Indian phone (e.g. 9876543210)"
                icon={Smartphone}
                value={passForm.phone}
                onChange={(e) => setPassForm({ ...passForm, phone: e.target.value })}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                icon={Lock}
                value={passForm.password}
                onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
                required
              />

              {/* Role Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Account Role
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['patient', 'doctor', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPassForm({ ...passForm, role: r })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: `1px solid ${
                          passForm.role === r ? 'var(--primary)' : 'var(--border-color)'
                        }`,
                        borderRadius: 'var(--radius-sm)',
                        background:
                          passForm.role === r ? 'var(--primary-glow)' : 'var(--bg-input)',
                        color: passForm.role === r ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                style={{ marginTop: '0.5rem' }}
              >
                Create Account
              </Button>
            </form>
          )}

          {/* TAB 2: OTP REGISTER */}
          {activeTab === 'otp' && (
            <div>
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
                  Verify Email
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
                  Verify Phone
                </button>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="Jane Doe"
                    icon={User}
                    value={otpForm.name}
                    onChange={(e) => setOtpForm({ ...otpForm, name: e.target.value })}
                  />

                  <Input
                    label={otpForm.type === 'email' ? 'Email Address' : 'Mobile Phone'}
                    name="identifier"
                    placeholder={
                      otpForm.type === 'email' ? 'jane@example.com' : '10-digit phone number'
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
                    Send Registration OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpRegisterSubmit}>
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
                    <span>Target: <strong>{otpForm.identifier}</strong></span>
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
                      Change
                    </button>
                  </div>

                  <Input
                    label="6-Digit OTP Code"
                    name="otp"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                    required
                  />

                  <Input
                    label="Set Password (Optional)"
                    name="password"
                    type="password"
                    placeholder="Optional login password"
                    icon={Lock}
                    value={otpForm.password}
                    onChange={(e) => setOtpForm({ ...otpForm, password: e.target.value })}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    icon={ArrowRight}
                  >
                    Verify & Create Account
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
                      <span>Resend OTP in <strong>{timer}s</strong></span>
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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
