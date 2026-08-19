import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { teleconsultationApi } from '../../api/teleconsultationApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { medicineApi } from '../../api/medicineApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Stethoscope,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const VideoRoom = () => {
  const { meetingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctor Split Screen Rx Pad State
  const [prescribedMedicines, setPrescribedMedicines] = useState([
    {
      name: 'Calpol 650',
      generic_name: 'Paracetamol (650mg)',
      dosage_form: 'Tablet',
      dose: '1 Tab',
      frequency: '1-0-1',
      timing: 'After Food',
      duration_days: 3,
      instructions: 'For fever',
    },
  ]);
  const [drugQuery, setDrugQuery] = useState('');
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [diagnosis, setDiagnosis] = useState('Online Teleconsultation Evaluation');
  const [advice, setAdvice] = useState('Drink plenty of water and rest well.');
  const [rxSaving, setRxSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    teleconsultationApi
      .getSession(meetingId)
      .then((res) => {
        setSession(res.data.session);
        // Mark session as in_progress
        teleconsultationApi.updateStatus(meetingId, { status: 'in_progress' });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [meetingId]);

  // Drug autocomplete
  useEffect(() => {
    if (drugQuery.length >= 2) {
      medicineApi
        .searchMedicines(drugQuery)
        .then((res) => setDrugSuggestions(res.data?.medicines || []))
        .catch((err) => console.error(err));
    } else {
      setDrugSuggestions([]);
    }
  }, [drugQuery]);

  const handleAddMedicine = (med) => {
    setPrescribedMedicines((prev) => [
      ...prev,
      {
        name: med.name,
        generic_name: med.generic_name || '',
        dosage_form: med.dosage_form || 'Tablet',
        dose: '1 Tab',
        frequency: med.default_frequency || '1-0-1',
        timing: med.default_timing || 'After Food',
        duration_days: med.default_duration_days || 5,
        instructions: '',
      },
    ]);
    setDrugQuery('');
    setDrugSuggestions([]);
  };

  const handleIssueTeleRx = async () => {
    if (!session) return;
    try {
      setRxSaving(true);
      const payload = {
        clinic_id: session.clinic_id?._id || session.clinic_id,
        patient_id: session.patient_id?._id || session.patient_id,
        appointment_id: session.appointment_id?._id || session.appointment_id || undefined,
        diagnosis: [diagnosis],
        medicines: prescribedMedicines,
        general_advice: advice,
      };

      const res = await prescriptionApi.issuePrescription(payload);
      setSuccess('Prescription issued successfully!');
      // Update teleconsultation to completed
      await teleconsultationApi.updateStatus(meetingId, { status: 'completed' });
      window.open(`/doctor/prescription/view/${res.data.prescription._id}`, '_blank');
    } catch (err) {
      setError(err.message || 'Failed to issue prescription.');
    } finally {
      setRxSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Connecting to secure teleconsultation room...</p>
      </div>
    );
  }

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0F19',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Video Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
              Live Teleconsultation Room
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
              Patient: <strong>{session.patient_id?.name}</strong> • Dr. {session.doctor_id?.name}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={PhoneOff}
          onClick={() => navigate('/doctor/dashboard')}
          style={{ background: '#EF4444', color: '#fff', border: 'none' }}
        >
          Leave Call
        </Button>
      </div>

      {/* Main Split Screen Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDoctor ? '1.3fr 1fr' : '1fr',
          flex: 1,
          height: 'calc(100vh - 65px)',
        }}
      >
        {/* Left Side: WebRTC / Jitsi Video Call iframe */}
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
          <iframe
            src={session.room_url}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Teleconsultation Stream"
          />
        </div>

        {/* Right Side: Doctor Smart Rx Pad (Visible to doctor only) */}
        {isDoctor && (
          <div
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              padding: '1.5rem',
              overflowY: 'auto',
              borderLeft: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Stethoscope size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Side-by-Side Rx Consultation Pad
                </h3>
              </div>

              <Alert type="success" message={success} onClose={() => setSuccess('')} />
              <Alert type="error" message={error} onClose={() => setError('')} />

              {/* Diagnosis */}
              <div style={{ marginBottom: '1rem' }}>
                <Input
                  label="Provisional Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* Medicine Search */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Input
                  label="Search & Add Medicines (50,000+ DB)"
                  placeholder="Type Calpol, Augmentin, Azithral..."
                  value={drugQuery}
                  onChange={(e) => setDrugQuery(e.target.value)}
                />

                {drugSuggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      zIndex: 50,
                      maxHeight: '180px',
                      overflowY: 'auto',
                    }}
                  >
                    {drugSuggestions.map((med) => (
                      <div
                        key={med._id}
                        onClick={() => handleAddMedicine(med)}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                        }}
                      >
                        <strong>{med.name}</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>+ Add</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Added Medicines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                {prescribedMedicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <strong>{m.name}</strong> — {m.frequency} ({m.timing}, {m.duration_days}d)
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                  Doctor's Advice
                </label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={rxSaving}
              icon={CheckCircle2}
              onClick={handleIssueTeleRx}
              style={{ padding: '14px', fontSize: '1rem', fontWeight: '800' }}
            >
              Issue Digital Prescription & Complete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
