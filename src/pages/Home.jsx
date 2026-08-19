import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Edit2,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Building,
  Users,
  ArrowRight,
} from 'lucide-react';

export const Home = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar_url: user?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'clinic_admin' || user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist' || user?.role === 'nurse';

  return (
    <div className="home-container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />

      {/* Hero Welcome Banner with Role Quick Launch */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant={user?.role || 'patient'} size="md">
              {user?.role?.toUpperCase() || 'PATIENT'}
            </Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              DocOn Medical System
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '6px' }}>
            Hello, {user?.name || (isDoctor ? 'Doctor' : 'Welcome!')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px', maxWidth: '600px' }}>
            {isDoctor
              ? 'Access your clinical suite, OPD live token caller, prescription generator, and clinic configurations.'
              : isReceptionist
              ? 'Front-desk counter ready for patient token generation and vitals recording.'
              : 'Your personal health portal for prescriptions, appointments, and diagnostic records.'}
          </p>
        </div>

        {/* Quick Launch Button based on role */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isDoctor && (
            <>
              <Button
                variant="primary"
                icon={Stethoscope}
                onClick={() => navigate('/doctor/dashboard')}
              >
                Open Doctor Suite
              </Button>
              <Button
                variant="secondary"
                icon={Building}
                onClick={() => navigate('/clinic/settings')}
              >
                Clinic Settings
              </Button>
            </>
          )}

          {isReceptionist && (
            <Button
              variant="primary"
              icon={Users}
              onClick={() => navigate('/reception/dashboard')}
            >
              Open Reception Desk
            </Button>
          )}

          <Button
            variant="ghost"
            icon={Edit2}
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {isEditing && (
        <Card
          title="Update Account Info"
          subtitle="Modify your name and display avatar"
          style={{ marginBottom: '2rem' }}
        >
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

      {/* Account Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card title="Contact & Identity" subtitle="Verified communication channels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
                <strong style={{ fontSize: '0.85rem' }}>{user?.email || 'Not set'}</strong>
              </div>
              <Badge variant={user?.is_email_verified ? 'success' : 'warning'} size="sm">
                {user?.is_email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} color="#10B981" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone</span>
                <strong style={{ fontSize: '0.85rem' }}>{user?.phone || 'Not set'}</strong>
              </div>
              <Badge variant={user?.is_phone_verified ? 'success' : 'warning'} size="sm">
                {user?.is_phone_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card title="DocOn Security & RBAC" subtitle="Role-Based Access Control status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Role: {user?.role?.toUpperCase()}</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Multi-clinic session and permissions active
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
