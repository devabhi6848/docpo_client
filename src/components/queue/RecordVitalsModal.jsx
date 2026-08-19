import React, { useState } from 'react';
import { patientApi } from '../../api/patientApi';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Activity, Heart, Thermometer, Wind, Weight, CheckCircle2 } from 'lucide-react';

export const RecordVitalsModal = ({ isOpen, onClose, patient, appointmentId, onVitalsSaved }) => {
  const [vitals, setVitals] = useState({
    bp_systolic: 120,
    bp_diastolic: 80,
    pulse_rate: 72,
    temperature_f: 98.6,
    spo2_percent: 98,
    respiratory_rate: 18,
    weight_kg: 15,
    height_cm: 100,
    head_circumference_cm: 48,
    rbs_mg_dl: 100,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  // Live BMI calculation
  const heightM = vitals.height_cm ? vitals.height_cm / 100 : 0;
  const bmi = heightM > 0 && vitals.weight_kg ? (vitals.weight_kg / (heightM * heightM)).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await patientApi.recordVitals(patient._id, {
        ...vitals,
        appointment_id: appointmentId || undefined,
      });

      if (onVitalsSaved) {
        onVitalsSaved(res.data.vitals);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record vitals.');
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
      <div style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Card style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                  Record Patient Vitals
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Patient: <strong>{patient.name}</strong> ({patient.gender}, {patient.age_years}y)
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

          <form onSubmit={handleSubmit}>
            {/* Blood Pressure & Pulse */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input
                label="BP Systolic (mmHg)"
                type="number"
                value={vitals.bp_systolic}
                onChange={(e) => setVitals({ ...vitals, bp_systolic: Number(e.target.value) })}
                placeholder="120"
              />
              <Input
                label="BP Diastolic (mmHg)"
                type="number"
                value={vitals.bp_diastolic}
                onChange={(e) => setVitals({ ...vitals, bp_diastolic: Number(e.target.value) })}
                placeholder="80"
              />
              <Input
                label="Pulse Rate (bpm)"
                type="number"
                value={vitals.pulse_rate}
                onChange={(e) => setVitals({ ...vitals, pulse_rate: Number(e.target.value) })}
                placeholder="72"
              />
            </div>

            {/* Temp & SpO2 & Respiratory Rate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <Input
                label="Temperature (°F)"
                type="number"
                step="0.1"
                value={vitals.temperature_f}
                onChange={(e) => setVitals({ ...vitals, temperature_f: Number(e.target.value) })}
                placeholder="98.6"
              />
              <Input
                label="SpO2 (%)"
                type="number"
                value={vitals.spo2_percent}
                onChange={(e) => setVitals({ ...vitals, spo2_percent: Number(e.target.value) })}
                placeholder="98"
              />
              <Input
                label="Resp Rate (breaths/min)"
                type="number"
                value={vitals.respiratory_rate}
                onChange={(e) => setVitals({ ...vitals, respiratory_rate: Number(e.target.value) })}
                placeholder="18"
              />
            </div>

            {/* Growth Parameters: Weight, Height, Head Circumference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                value={vitals.weight_kg}
                onChange={(e) => setVitals({ ...vitals, weight_kg: Number(e.target.value) })}
                placeholder="14.5"
              />
              <Input
                label="Height (cm)"
                type="number"
                value={vitals.height_cm}
                onChange={(e) => setVitals({ ...vitals, height_cm: Number(e.target.value) })}
                placeholder="100"
              />
              <Input
                label="Head Circ (cm - Pedia)"
                type="number"
                step="0.1"
                value={vitals.head_circumference_cm}
                onChange={(e) => setVitals({ ...vitals, head_circumference_cm: Number(e.target.value) })}
                placeholder="48"
              />
            </div>

            {/* Computed BMI Banner */}
            <div
              style={{
                marginTop: '1rem',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>
                Auto-calculated Body Mass Index (BMI):
              </span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                {bmi} kg/m²
              </strong>
            </div>

            <Input
              label="Triage / Clinical Notes"
              placeholder="e.g. Mild dehydration observed, alert and active"
              value={vitals.notes}
              onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
              style={{ marginTop: '0.75rem' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={CheckCircle2}>
                Save Vitals Record
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
