import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portalApi } from '../../api/portalApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Activity,
  FileText,
  ShieldCheck,
  Receipt,
  Clock,
  Calendar,
  Building,
  User,
  Phone,
  Video,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const PatientPortal = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [loading, setLoading] = useState(true);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await portalApi.getPortalData(patientId);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load patient portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchPortalData();
    const interval = setInterval(fetchPortalData, 10000); // Auto-refresh queue every 10s
    return () => clearInterval(interval);
  }, [patientId]);

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading your digital health records...</p>
      </div>
    );
  }

  const { patient, clinic, live_queue_status: queue, prescriptions, vaccines, invoices } = data;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Clinic Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>
              {clinic?.name || 'Docpa Health Clinic'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Patient Digital Health Portal • Helpline: {clinic?.phone || '9876543210'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as</span>
          <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)' }}>
            {patient.name}
          </strong>
        </div>
      </div>

      {/* Patient Health ID Card */}
      <Card
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid var(--primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
              Digital Health ID
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '6px 0 2px' }}>
              {patient.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {patient.gender?.toUpperCase()}, {patient.age_years}y {patient.age_months ? `${patient.age_months}m` : ''} • Mobile: {patient.phone}
            </p>
          </div>

          <div style={{ textAlign: 'right', background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>UHID NUMBER</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px' }}>
              {patient.uhid}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Group: {patient.blood_group || 'Unknown'}</span>
          </div>
        </div>
      </Card>

      {/* LIVE OPD QUEUE TRACKER (DocOn Signature Live Tracking!) */}
      {queue && (
        <Card
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
            border: '2px solid #F59E0B',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  fontSize: '2.2rem',
                  fontWeight: '900',
                  color: '#F59E0B',
                  letterSpacing: '2px',
                  background: 'var(--bg-card)',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #F59E0B',
                }}
              >
                {queue.token_code}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: '800', textTransform: 'uppercase' }}>
                  Live OPD Consultation Status
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '2px 0' }}>
                  {queue.status === 'with_doctor'
                    ? '🎉 You are currently in Consultation Cabin!'
                    : queue.status === 'completed'
                    ? '✓ Consultation Completed for Today'
                    : `⏳ ${queue.patients_ahead} Patients Ahead of You`}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Doctor: Dr. {queue.doctor_name} • Current Token in Cabin: <strong>{queue.current_calling_token}</strong>
                </p>
              </div>
            </div>

            {queue.status === 'waiting' && (
              <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>ESTIMATED WAIT</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)' }}>
                  ~{queue.estimated_wait_minutes} mins
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { id: 'prescriptions', label: `📄 Prescriptions (${prescriptions.length})` },
          { id: 'vaccines', label: `💉 Vaccines (${vaccines.summary.given}/${vaccines.summary.total})` },
          { id: 'invoices', label: `🧾 Bills & Receipts (${invoices.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PRESCRIPTIONS TIMELINE */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {prescriptions.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontWeight: '600' }}>No past prescriptions found</p>
            </Card>
          ) : (
            prescriptions.map((rx) => (
              <Card key={rx._id} style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800' }}>
                      {rx.prescription_number}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '2px 0 6px' }}>
                      Consultation with Dr. {rx.doctor_id?.name || 'Doctor'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Date: {new Date(rx.createdAt).toLocaleDateString()} • Diagnosis:{' '}
                      <strong>{rx.diagnosis?.join(', ') || 'Clinical Evaluation'}</strong>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => navigate(`/doctor/prescription/view/${rx._id}`)}
                  >
                    View Digital Rx
                  </Button>
                </div>

                {/* Medicines Snapshot */}
                <div style={{ marginTop: '1rem', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <strong>Prescribed Medications ({rx.medicines?.length || 0}):</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '20px', color: 'var(--text-main)' }}>
                    {rx.medicines?.map((m, idx) => (
                      <li key={idx}>
                        <strong>{m.name}</strong> ({m.dosage_form}) — {m.frequency} ({m.timing}, {m.duration_days}d)
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: VACCINES */}
      {activeTab === 'vaccines' && (
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
              IAP Child Immunization Record
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => navigate(`/pediatric/immunization/${patient._id}`)}
            >
              Full Vaccine Schedule
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {vaccines.list?.slice(0, 8).map((v) => (
              <div
                key={v._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>{v.vaccine_name}</strong>{' '}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({v.age_milestone})</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.disease_covered}</div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: v.status === 'given' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: v.status === 'given' ? '#10B981' : '#F59E0B',
                  }}
                >
                  {v.status === 'given' ? '✓ Given' : 'Due / Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: INVOICES */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {invoices.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Receipt size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontWeight: '600' }}>No payment receipts recorded yet</p>
            </Card>
          ) : (
            invoices.map((inv) => (
              <Card key={inv._id} style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {inv.invoice_number}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '2px 0' }}>
                    Payment of ₹{inv.paid_amount} ({inv.payment_method?.toUpperCase()})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Date: {new Date(inv.createdAt).toLocaleDateString()} • Items: {inv.items?.length || 1} services
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => navigate(`/billing/view/${inv._id}`)}
                >
                  View Bill
                </Button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
