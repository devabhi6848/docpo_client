import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vaccineApi } from '../../api/vaccineApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Syringe,
  Printer,
  ArrowLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ImmunizationTracker = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Administer Modal State
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [administerForm, setAdministerForm] = useState({
    given_date: new Date().toISOString().slice(0, 10),
    brand_name: '',
    batch_number: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await vaccineApi.getSchedule(patientId);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load immunization schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchSchedule();
  }, [patientId]);

  const handleOpenAdminister = (v) => {
    setSelectedVaccine(v);
    setAdministerForm({
      given_date: new Date().toISOString().slice(0, 10),
      brand_name: v.brand_name || '',
      batch_number: v.batch_number || '',
      notes: v.notes || '',
    });
  };

  const handleSaveAdminister = async (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    try {
      setSubmitting(true);
      await vaccineApi.markGiven(selectedVaccine._id, administerForm);
      setSuccess(`${selectedVaccine.vaccine_name} marked as given!`);
      setSelectedVaccine(null);
      await fetchSchedule();
    } catch (err) {
      setError(err.message || 'Failed to record vaccine dose.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading IAP Immunization schedule...</p>
      </div>
    );
  }

  const { patient, summary, schedule } = data;

  // Group vaccines by milestone
  const milestones = {};
  schedule.forEach((v) => {
    if (!milestones[v.age_milestone]) {
      milestones[v.age_milestone] = [];
    }
    milestones[v.age_milestone].push(v);
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                }}
              >
                IAP VACCINATION PROTOCOL
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '4px 0 0' }}>
              {patient.name} ({patient.gender?.toUpperCase()}, {patient.age_years}y {patient.age_months ? `${patient.age_months}m` : ''})
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Estimated'} • UHID: {patient.uhid}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Vaccine Card
          </Button>
        </div>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Progress & KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            IMMUNIZATION PROGRESS
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', margin: '4px 0' }}>
            {summary.completion_percentage}%
          </h2>
          <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${summary.completion_percentage}%`, background: '#10B981', height: '100%' }} />
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DOSES GIVEN</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', margin: '4px 0' }}>
            {summary.given} / {summary.total}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Protected against diseases</p>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DUE NOW</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#F59E0B', margin: '4px 0' }}>
            {summary.due}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Eligible for dose</p>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>UPCOMING</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#3B82F6', margin: '4px 0' }}>
            {summary.upcoming}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Future milestones</p>
        </Card>
      </div>

      {/* MILESTONE TIMELINE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(milestones).map(([milestone, vaccines]) => (
          <Card key={milestone} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                  }}
                >
                  📅
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Age Milestone: {milestone}
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Due Date approx: <strong>{new Date(vaccines[0]?.due_date).toLocaleDateString()}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {vaccines.map((v) => (
                <div
                  key={v._id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border:
                      v.status === 'given'
                        ? '1px solid #10B981'
                        : v.status === 'due'
                        ? '1px solid #F59E0B'
                        : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                        {v.vaccine_name}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          background:
                            v.status === 'given'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : v.status === 'due'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(59, 130, 246, 0.15)',
                          color:
                            v.status === 'given'
                              ? '#10B981'
                              : v.status === 'due'
                              ? '#F59E0B'
                              : '#3B82F6',
                        }}
                      >
                        {v.status === 'given' ? '✓ Given' : v.status === 'due' ? 'Due Now' : 'Upcoming'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      Protects against: <em>{v.disease_covered}</em>
                    </p>

                    {v.status === 'given' && (
                      <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '6px', fontWeight: '600' }}>
                        Given on {new Date(v.given_date).toLocaleDateString()}
                        {v.brand_name && <span> ({v.brand_name})</span>}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    {v.status !== 'given' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={Syringe}
                        onClick={() => handleOpenAdminister(v)}
                      >
                        Record Vaccine Dose
                      </Button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Batch: {v.batch_number || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Administer Vaccine Modal */}
      {selectedVaccine && (
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
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <Card style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Syringe size={22} color="#10B981" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    Administer {selectedVaccine.vaccine_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVaccine(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveAdminister}>
                <Input
                  label="Date of Administration"
                  type="date"
                  value={administerForm.given_date}
                  onChange={(e) => setAdministerForm({ ...administerForm, given_date: e.target.value })}
                  required
                />
                <Input
                  label="Brand Name (e.g. Hexaxim, Rotavac, Priorix)"
                  placeholder="Brand name"
                  value={administerForm.brand_name}
                  onChange={(e) => setAdministerForm({ ...administerForm, brand_name: e.target.value })}
                  style={{ marginTop: '0.75rem' }}
                />
                <Input
                  label="Batch Number"
                  placeholder="e.g. BATCH-8921"
                  value={administerForm.batch_number}
                  onChange={(e) => setAdministerForm({ ...administerForm, batch_number: e.target.value })}
                  style={{ marginTop: '0.75rem' }}
                />
                <Input
                  label="Adverse effects / Clinical Notes"
                  placeholder="e.g. Well tolerated, mild swelling observed"
                  value={administerForm.notes}
                  onChange={(e) => setAdministerForm({ ...administerForm, notes: e.target.value })}
                  style={{ marginTop: '0.75rem' }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <Button type="button" variant="ghost" onClick={() => setSelectedVaccine(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting} icon={CheckCircle2}>
                    Save Dose
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
