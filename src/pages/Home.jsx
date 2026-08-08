import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Edit3,
  Calendar,
  Lock,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

export const Home = () => {
  const { user, updateProfile, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar_url: user?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }} className="animate-fade-in">
      {/* Hero Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background:
            'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '800',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                Welcome back, {user?.name || 'User'}!
              </h1>
              <Badge variant={user?.role || 'patient'}>{user?.role || 'patient'}</Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.95rem' }}>
              Logged in securely via Docpa Health Authentication System
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={Edit3}
          onClick={() => {
            setIsEditing(!isEditing);
            setFormData({ name: user?.name || '', avatar_url: user?.avatar_url || '' });
          }}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Edit Profile Form Card */}
      {isEditing && (
        <Card
          title="Edit Profile Information"
          subtitle="Update your display name or profile image URL"
          style={{ marginBottom: '2rem' }}
        >
          <form onSubmit={handleUpdateProfile}>
            <div className="grid-2">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={User}
                placeholder="Dr. John Doe"
              />
              <Input
                label="Avatar Image URL"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                icon={Sparkles}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="grid-3">
        {/* Profile Card */}
        <Card title="Account Overview" subtitle="User credentials and verified identity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--primary)',
                }}
              >
                <Mail size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                  Email Address
                </span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {user?.email || 'Not provided'}
                </span>
              </div>
              {user?.is_email_verified ? (
                <Badge variant="success" size="sm">
                  <CheckCircle2 size={12} /> Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Unverified
                </Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--secondary)',
                }}
              >
                <Phone size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                  Mobile Phone
                </span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {user?.phone || 'Not provided'}
                </span>
              </div>
              {user?.is_phone_verified ? (
                <Badge variant="success" size="sm">
                  <CheckCircle2 size={12} /> Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Unverified
                </Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--accent)',
                }}
              >
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                  Member Since
                </span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Authentication Providers */}
        <Card title="Security & Authentication" subtitle="Enabled login methods & token health">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '8px' }}>
                Active Auth Providers
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user?.auth_providers?.map((provider) => (
                  <Badge key={provider} variant="info" size="sm">
                    {provider}
                  </Badge>
                )) || <Badge variant="info" size="sm">Password</Badge>}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldCheck size={20} style={{ color: '#34D399' }} />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34D399', display: 'block' }}>
                  JWT Security Active
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Auto-refreshes tokens & guards session
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Role Portal Overview */}
        <Card
          title={`${(user?.role || 'patient').toUpperCase()} Workspace`}
          subtitle="Quick access portal features"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Activity size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>
              {user?.role === 'doctor'
                ? 'Doctor Portal Ready'
                : user?.role === 'admin'
                ? 'Admin Console Active'
                : 'Patient Care Hub'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {user?.role === 'doctor'
                ? 'Manage appointments, patient consultations, and clinical records.'
                : user?.role === 'admin'
                ? 'System administration, user access policies, and platform metrics.'
                : 'Book medical appointments, check lab reports, and manage health records.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
