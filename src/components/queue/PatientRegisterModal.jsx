import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/patientApi';
import { queueApi } from '../../api/queueApi';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Ticket,
  UserCheck,
  Smartphone,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const PatientRegisterModal = ({ isOpen, onClose, onTokenCreated, defaultDoctorId }) => {
  const { activeClinic } = useClinic();
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // New Patient Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    gender: 'male',
    age_years: 25,
    age_months: 0,
    blood_group: 'unknown',
    guardian_name: '',
    guardian_relationship: 'Self',
    visit_type: 'new_visit',
    priority: 'normal',
    chief_complaint: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search as user types 10-digit phone
  useEffect(() => {
    if (searchPhone.length >= 3 && activeClinic?._id) {
      setIsSearching(true);
      patientApi
        .searchPatients(activeClinic._id, searchPhone)
        .then((res) => {
          setSearchResults(res.data?.patients || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [searchPhone, activeClinic]);

  if (!isOpen) return null;

  const handleSelectExistingPatient = (p) => {
    setSelectedPatient(p);
    setPatientForm((prev) => ({
      ...prev,
      name: p.name,
      phone: p.phone,
      gender: p.gender,
      age_years: p.age_years || 0,
      age_months: p.age_months || 0,
      blood_group: p.blood_group || 'unknown',
      guardian_name: p.guardian_name || '',
      guardian_relationship: p.guardian_relationship || 'Self',
      visit_type: 'follow_up',
    }));
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let patientId = selectedPatient?._id;

      // If new patient, register first
      if (!patientId) {
        const patientRes = await patientApi.createPatient({
          clinic_id: activeClinic._id,
          name: patientForm.name,
          phone: patientForm.phone,
          gender: patientForm.gender,
          age_years: Number(patientForm.age_years) || 0,
          age_months: Number(patientForm.age_months) || 0,
          blood_group: patientForm.blood_group,
          guardian_name: patientForm.guardian_name,
          guardian_relationship: patientForm.guardian_relationship,
        });
        patientId = patientRes.data.patient._id;
      }

      // Generate Token
      const tokenRes = await queueApi.generateToken({
        clinic_id: activeClinic._id,
        doctor_id: defaultDoctorId || activeClinic.owner_id?._id || activeClinic.owner_id,
        patient_id: patientId,
        visit_type: patientForm.visit_type,
        priority: patientForm.priority,
        chief_complaint: patientForm.chief_complaint,
      });

      if (onTokenCreated) {
        onTokenCreated(tokenRes.data.token);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register patient or generate token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Card style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ticket size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                  OPD Patient Check-in & Token Generator
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Search registered patient or enter walk-in patient details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />

          {/* Quick Search Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Quick Search by Mobile Phone or UHID"
              placeholder="Type 10-digit number (e.g. 9876543210)..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              icon={Search}
            />

            {/* Live Search Results Pill Box */}
            {searchResults.length > 0 && (
              <div
                style={{
                  marginTop: '8px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  border: '1px solid var(--border-color)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                  MATCHING REGISTERED PATIENTS:
                </p>
                {searchResults.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelectExistingPatient(p)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedPatient?._id === p._id ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-card)',
                      border: selectedPatient?._id === p._id ? '1px solid var(--primary)' : '1px solid transparent',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>{' '}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ({p.gender}, {p.age_years}y) • Ph: {p.phone} • {p.uhid}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                      {selectedPatient?._id === p._id ? 'Selected ✓' : 'Select Patient'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleGenerateToken}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input
                label="Patient Full Name"
                placeholder="e.g. Master Aarav Sharma"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                required
              />
              <Input
                label="Mobile Number"
                placeholder="10-digit phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Gender
                </label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                label="Age (Years)"
                type="number"
                value={patientForm.age_years}
                onChange={(e) => setPatientForm({ ...patientForm, age_years: Number(e.target.value) })}
                min={0}
                max={120}
              />

              <Input
                label="Age (Months, if child)"
                type="number"
                value={patientForm.age_months}
                onChange={(e) => setPatientForm({ ...patientForm, age_months: Number(e.target.value) })}
                min={0}
                max={11}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <Input
                label="Guardian / Parent Name (if child/elderly)"
                placeholder="Father/Mother name"
                value={patientForm.guardian_name}
                onChange={(e) => setPatientForm({ ...patientForm, guardian_name: e.target.value })}
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Blood Group
                </label>
                <select
                  value={patientForm.blood_group}
                  onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Visit Details & Symptoms */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                    Visit Type
                  </label>
                  <select
                    value={patientForm.visit_type}
                    onChange={(e) => setPatientForm({ ...patientForm, visit_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="new_visit">New OPD Visit</option>
                    <option value="follow_up">Follow-up Consultation</option>
                    <option value="vaccination">Vaccination / Immunization</option>
                    <option value="emergency">Emergency Priority</option>
                    <option value="report_review">Lab Report Review</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={patientForm.priority}
                    onChange={(e) => setPatientForm({ ...patientForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="normal">Normal Token</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency 🚨</option>
                  </select>
                </div>
              </div>

              <Input
                label="Chief Complaints / Symptoms"
                placeholder="e.g. High fever for 2 days, dry cough, vomiting"
                value={patientForm.chief_complaint}
                onChange={(e) => setPatientForm({ ...patientForm, chief_complaint: e.target.value })}
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={Ticket}>
                Generate Token ({activeClinic?.token_prefix || 'T'})
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
