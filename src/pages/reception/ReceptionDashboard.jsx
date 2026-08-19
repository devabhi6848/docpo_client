import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useClinic } from '../../context/ClinicContext';
import { queueApi } from '../../api/queueApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { PatientRegisterModal } from '../../components/queue/PatientRegisterModal';
import { RecordVitalsModal } from '../../components/queue/RecordVitalsModal';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Activity,
  Tv,
  PhoneCall,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ReceptionDashboard = () => {
  const { activeClinic } = useClinic();
  const [queueData, setQueueData] = useState(null);
  const [activeTab, setActiveTab] = useState('waiting');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [vitalsModalData, setVitalsModalData] = useState({ isOpen: false, patient: null, appointmentId: null });

  const fetchQueue = async () => {
    if (!activeClinic?._id) return;
    try {
      setLoading(true);
      const res = await queueApi.getTodayQueue(activeClinic._id);
      setQueueData(res.data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeClinic]);

  const handleUpdateStatus = async (tokenId, status) => {
    try {
      await queueApi.updateTokenStatus(tokenId, status);
      setSuccess(`Token status updated to ${status}`);
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to update token status.');
    }
  };

  const currentList =
    activeTab === 'waiting'
      ? queueData?.queue?.waiting || []
      : activeTab === 'with_doctor'
      ? queueData?.queue?.with_doctor || []
      : activeTab === 'completed'
      ? queueData?.queue?.completed || []
      : queueData?.queue?.all || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
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
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              Reception & OPD Counter
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
                {activeClinic.name} ({activeClinic.code})
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>
            Live Patient Queue & Token Desk
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeClinic && (
            <Button
              variant="secondary"
              icon={Tv}
              onClick={() => window.open(`/queue/tv-display/${activeClinic._id}`, '_blank')}
            >
              Open TV Display
            </Button>
          )}

          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsRegisterOpen(true)}
          >
            New Patient Token
          </Button>
        </div>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* KPI Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #F59E0B',
            cursor: 'pointer',
            background: activeTab === 'waiting' ? 'var(--bg-input)' : 'var(--bg-card)',
          }}
          onClick={() => setActiveTab('waiting')}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            WAITING IN OPD
          </p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#F59E0B' }}>
            {queueData?.counts?.waiting || 0}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for doctor</p>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--primary)',
            cursor: 'pointer',
            background: activeTab === 'with_doctor' ? 'var(--bg-input)' : 'var(--bg-card)',
          }}
          onClick={() => setActiveTab('with_doctor')}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            IN CONSULTATION
          </p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--primary)' }}>
            {queueData?.counts?.with_doctor || 0}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently with doctor</p>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #10B981',
            cursor: 'pointer',
            background: activeTab === 'completed' ? 'var(--bg-input)' : 'var(--bg-card)',
          }}
          onClick={() => setActiveTab('completed')}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            COMPLETED TODAY
          </p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#10B981' }}>
            {queueData?.counts?.completed || 0}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation completed</p>
        </Card>
      </div>

      {/* Queue Table */}
      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, textTransform: 'capitalize' }}>
            {activeTab.replace('_', ' ')} Queue ({currentList.length})
          </h3>
          <Button variant="ghost" icon={RotateCcw} onClick={fetchQueue} loading={loading}>
            Refresh Queue
          </Button>
        </div>

        {currentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p style={{ fontWeight: '600' }}>No tokens in this category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentList.map((token) => (
              <div
                key={token._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 18px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: token.status === 'with_doctor' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                }}
              >
                {/* Token Number & Patient Demographics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: '900',
                      color: token.status === 'with_doctor' ? 'var(--primary)' : 'var(--text-main)',
                      letterSpacing: '2px',
                      background: 'var(--bg-card)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {token.token_code}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {token.patient_id?.name}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {token.patient_id?.gender}, {token.patient_id?.age_years}y • Ph: {token.patient_id?.phone} •{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        {token.visit_type?.replace('_', ' ')}
                      </span>
                    </div>
                    {token.chief_complaint && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '4px 0 0' }}>
                        Symptoms: <em>{token.chief_complaint}</em>
                      </p>
                    )}
                  </div>
                </div>

                {/* Vitals Summary Pill & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {token.vitals_id ? (
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      ✓ Vitals Recorded (BP {token.vitals_id.bp_systolic}/{token.vitals_id.bp_diastolic}, {token.vitals_id.weight_kg}kg)
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Activity}
                      onClick={() =>
                        setVitalsModalData({ isOpen: true, patient: token.patient_id, appointmentId: token._id })
                      }
                    >
                      Record Vitals
                    </Button>
                  )}

                  {token.status === 'waiting' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Play}
                      onClick={() => handleUpdateStatus(token._id, 'with_doctor')}
                    >
                      Call to Doctor
                    </Button>
                  )}

                  {token.status === 'with_doctor' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleUpdateStatus(token._id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}

                  {token.status !== 'completed' && token.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(token._id, 'cancelled')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error, #EF4444)',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                      title="Cancel Token"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <PatientRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onTokenCreated={() => {
          setSuccess('Token generated successfully!');
          fetchQueue();
        }}
      />

      <RecordVitalsModal
        isOpen={vitalsModalData.isOpen}
        patient={vitalsModalData.patient}
        appointmentId={vitalsModalData.appointmentId}
        onClose={() => setVitalsModalData({ isOpen: false, patient: null, appointmentId: null })}
        onVitalsSaved={() => {
          setSuccess('Vitals recorded successfully!');
          fetchQueue();
        }}
      />
    </div>
  );
};
