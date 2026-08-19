import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Stethoscope, Award, FileText, CheckCircle2 } from 'lucide-react';

export const DoctorProfile = () => {
  const [profile, setProfile] = useState({
    title: 'Dr.',
    qualifications: ['MBBS'],
    specializations: ['General Physician'],
    medical_registration_number: '',
    state_medical_council: '',
    experience_years: 5,
    bio: '',
    signature_url: '',
    default_rx_notes: 'Take medicines on time. Drink plenty of water and rest well.',
  });

  const [qualInput, setQualInput] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await doctorApi.getProfile();
        if (res.data?.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddQualification = () => {
    if (qualInput.trim() && !profile.qualifications.includes(qualInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, qualInput.trim()],
      }));
      setQualInput('');
    }
  };

  const handleRemoveQualification = (item) => {
    setProfile((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q !== item),
    }));
  };

  const handleAddSpecialization = () => {
    if (specInput.trim() && !profile.specializations.includes(specInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        specializations: [...prev.specializations, specInput.trim()],
      }));
      setSpecInput('');
    }
  };

  const handleRemoveSpecialization = (item) => {
    setProfile((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== item),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await doctorApi.updateProfile(profile);
      setSuccess('Doctor clinical profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Doctor Clinical Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              These credentials appear automatically on all digital prescriptions (Rx) & patient invoices.
            </p>
          </div>
        </div>

        <Alert type="success" message={success} onClose={() => setSuccess('')} />
        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <Input
              label="Title"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="Dr."
              required
            />
            <Input
              label="Years of Clinical Experience"
              type="number"
              value={profile.experience_years}
              onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
              min={0}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <Input
              label="Medical Reg Number (MCI / State Council)"
              placeholder="e.g. MCI-54892"
              value={profile.medical_registration_number}
              onChange={(e) => setProfile({ ...profile, medical_registration_number: e.target.value })}
              required
            />
            <Input
              label="State Medical Council"
              placeholder="e.g. Delhi Medical Council"
              value={profile.state_medical_council}
              onChange={(e) => setProfile({ ...profile, state_medical_council: e.target.value })}
            />
          </div>

          {/* Qualifications Tag Manager */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
              Medical Degrees & Qualifications (e.g. MBBS, MD, DCH, DNB)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add qualification (e.g. MD - Pediatrics)"
                value={qualInput}
                onChange={(e) => setQualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQualification();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddQualification}>
                Add Degree
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.qualifications.map((q) => (
                <span
                  key={q}
                  style={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {q}
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(q)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Specializations Tag Manager */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
              Specializations (e.g. Pediatrician, Neonatologist, General Physician)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add specialization"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialization();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddSpecialization}>
                Add Specialty
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.specializations.map((s) => (
                <span
                  key={s}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(s)}
                    style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', fontWeight: '700' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
              Default Prescription (Rx) Advice & Notes
            </label>
            <textarea
              rows={3}
              value={profile.default_rx_notes}
              onChange={(e) => setProfile({ ...profile, default_rx_notes: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={CheckCircle2}
            style={{ marginTop: '1.5rem' }}
          >
            Save Doctor Credentials
          </Button>
        </form>
      </Card>
    </div>
  );
};
