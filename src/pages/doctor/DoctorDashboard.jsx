import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useClinic } from '../../context/ClinicContext';
import { queueApi } from '../../api/queueApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import {
  Stethoscope,
  Users,
  FileText,
  Settings,
  Calendar,
  Clock,
  PlusCircle,
  Building,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Play,
  CheckCircle2,
  Activity,
  Tv,
  RotateCcw,
  BookmarkPlus,
  Sparkles,
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { activeClinic, clinics, switchClinic } = useClinic();
  const navigate = useNavigate();

  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    if (!activeClinic?._id) return;
    try {
      setLoading(true);
      const res = await queueApi.getTodayQueue(activeClinic._id);
      setQueueData(res.data);
    } catch (err) {
      console.error('Failed to load doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeClinic]);

  const handleCallNext = async (tokenId) => {
    try {
      await queueApi.updateTokenStatus(tokenId, 'with_doctor');
      setSuccess('Patient called into consultation cabin.');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to call patient.');
    }
  };

  const handleCompleteConsultation = async (tokenId) => {
    try {
      await queueApi.updateTokenStatus(tokenId, 'completed');
      setSuccess('Consultation marked completed.');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to complete consultation.');
    }
  };

  const activePatient = queueData?.current_consultation;
  const waitingPatients = queueData?.queue?.waiting || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Header with Welcome & Active Clinic Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'var(--bg-card)',
          padding: '1.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              Doctor Consultation Suite
            </span>
            {activeClinic && (
              <span
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                Code: {activeClinic.code || 'DOC-01'}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>
            Welcome, Dr. {user?.name || 'Doctor'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
            {activeClinic?.name ? activeClinic.name : 'No active clinic selected. Please setup your clinic.'}
          </p>
        </div>

        {/* Clinic Switcher & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {clinics.length > 1 && (
            <select
              value={activeClinic?._id || ''}
              onChange={(e) => switchClinic(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  🏥 {c.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            icon={BookmarkPlus}
            onClick={() => navigate('/doctor/templates')}
          >
            Rx Templates
          </Button>

          {activeClinic && (
            <Button
              variant="secondary"
              icon={Tv}
              onClick={() => window.open(`/queue/tv-display/${activeClinic._id}`, '_blank')}
            >
              TV Display
            </Button>
          )}

          <Button
            variant="secondary"
            icon={Settings}
            onClick={() => navigate('/clinic/settings')}
          >
            Clinic Settings
          </Button>

          <Button
            variant="primary"
            icon={Stethoscope}
            onClick={() => navigate('/doctor/profile')}
          >
            Doctor Profile
          </Button>
        </div>
      </div>

      {/* CURRENT CONSULTATION CARD */}
      {activePatient ? (
        <Card
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '2px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'var(--primary)',
                  letterSpacing: '2px',
                  background: 'var(--bg-card)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary)',
                }}
              >
                {activePatient.token_code}
              </div>
              <div>
                <span
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Current Patient in Cabin
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 2px' }}>
                  {activePatient.patient_id?.name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {activePatient.patient_id?.gender}, {activePatient.patient_id?.age_years}y • Ph: {activePatient.patient_id?.phone} • UHID: {activePatient.patient_id?.uhid}
                </p>
                {activePatient.chief_complaint && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '4px 0 0' }}>
                    Chief Complaint: <strong>{activePatient.chief_complaint}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Vitals Summary & Rx Pad Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {activePatient.vitals_id && (
                <div style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <span>BP: <strong>{activePatient.vitals_id.bp_systolic}/{activePatient.vitals_id.bp_diastolic}</strong></span> •{' '}
                  <span>Pulse: <strong>{activePatient.vitals_id.pulse_rate}</strong></span> •{' '}
                  <span>Weight: <strong>{activePatient.vitals_id.weight_kg}kg</strong></span> •{' '}
                  <span>Temp: <strong>{activePatient.vitals_id.temperature_f}°F</strong></span>
                </div>
              )}

              <Button
                variant="primary"
                icon={FileText}
                onClick={() =>
                  navigate(`/doctor/prescription/patient/${activePatient.patient_id?._id || activePatient.patient_id}`)
                }
                style={{ padding: '10px 18px', fontWeight: '800' }}
              >
                Write Prescription (Rx Pad)
              </Button>

              <Button
                variant="secondary"
                icon={CheckCircle2}
                onClick={() => handleCompleteConsultation(activePatient._id)}
              >
                Finish
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        waitingPatients.length > 0 && (
          <Card
            style={{
              padding: '1.25rem 1.75rem',
              marginBottom: '2rem',
              background: 'var(--bg-input)',
              border: '1px dashed var(--primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
                NEXT PATIENT READY
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '2px 0' }}>
                {waitingPatients[0].token_code} — {waitingPatients[0].patient_id?.name} ({waitingPatients[0].patient_id?.gender}, {waitingPatients[0].patient_id?.age_years}y)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                icon={Play}
                onClick={() => handleCallNext(waitingPatients[0]._id)}
              >
                Call into Cabin
              </Button>
              <Button
                variant="primary"
                icon={FileText}
                onClick={() =>
                  navigate(`/doctor/prescription/patient/${waitingPatients[0].patient_id?._id || waitingPatients[0].patient_id}`)
                }
              >
                Write Rx
              </Button>
            </div>
          </Card>
        )
      )}

      {/* Quick KPI Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                WAITING IN OPD
              </p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#F59E0B' }}>
                {queueData?.counts?.waiting || 0} Patients
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '600' }}>
                Ready in waiting area
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                COMPLETED TODAY
              </p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#10B981' }}>
                {queueData?.counts?.completed || 0}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Prescriptions issued
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                CONSULTATION FEE
              </p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px' }}>
                ₹{activeClinic?.consultation_fee || 500}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Follow-up: ₹{activeClinic?.follow_up_fee || 300} ({activeClinic?.follow_up_validity_days || 7} days)
              </p>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* OPD Waiting Patients List */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
            Today's OPD Queue ({waitingPatients.length} Waiting)
          </h3>
          <Button variant="ghost" icon={RotateCcw} onClick={fetchQueue} loading={loading}>
            Refresh
          </Button>
        </div>

        {waitingPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p>No patients currently waiting in queue.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {waitingPatients.map((t) => (
              <div
                key={t._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                    {t.token_code}
                  </strong>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{t.patient_id?.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({t.patient_id?.gender}, {t.patient_id?.age_years}y) • {t.visit_type?.replace('_', ' ')}
                    </span>
                    {t.chief_complaint && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        Symptoms: {t.chief_complaint}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Play}
                    onClick={() => handleCallNext(t._id)}
                  >
                    Call
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={FileText}
                    onClick={() =>
                      navigate(`/doctor/prescription/patient/${t.patient_id?._id || t.patient_id}`)
                    }
                  >
                    Write Rx
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
