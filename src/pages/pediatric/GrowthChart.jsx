import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { growthApi } from '../../api/growthApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import {
  TrendingUp,
  Activity,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const GrowthChart = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    age_in_months: 6,
    weight_kg: 7.5,
    height_cm: 68,
    head_circumference_cm: 43,
    developmental_milestones: ['Head holding', 'Social smile'],
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchGrowth = async () => {
    try {
      setLoading(true);
      const res = await growthApi.getGrowthHistory(patientId);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load child growth data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchGrowth();
  }, [patientId]);

  const handleSaveGrowth = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await growthApi.recordGrowth(patientId, form);
      setSuccess('Child growth measurement recorded!');
      setIsAdding(false);
      await fetchGrowth();
    } catch (err) {
      setError(err.message || 'Failed to record growth.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading WHO Growth Chart...</p>
      </div>
    );
  }

  const { patient, history, who_reference } = data;
  const latestRecord = history[history.length - 1];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
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
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              WHO GROWTH STANDARDS (0-5 YEARS)
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '4px 0 0' }}>
              {patient.name}'s Growth & Milestone Curves
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Gender: {patient.gender?.toUpperCase()} • Age: {patient.age_years}y {patient.age_months ? `${patient.age_months}m` : ''}
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAdding(true)}>
          Record Measurement
        </Button>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Latest Nutritional Status Banner */}
      {latestRecord && (
        <Card
          style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%)',
            border: '1px solid #10B981',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800', textTransform: 'uppercase' }}>
              Current Nutritional Status
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '2px 0' }}>
              {latestRecord.nutritional_status}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Recorded at age {latestRecord.age_in_months} months
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              Weight: <strong>{latestRecord.weight_kg} kg</strong>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              Height: <strong>{latestRecord.height_cm} cm</strong>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              Head Circ: <strong>{latestRecord.head_circumference_cm} cm</strong>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              BMI: <strong>{latestRecord.bmi}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* SVG WHO WEIGHT-FOR-AGE PERCENTILE CHART */}
      <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" /> WHO Weight-for-Age Growth Curve (Boys 0-60 Months)
        </h3>

        {/* SVG Curve Plot */}
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-input)', borderRadius: '12px', padding: '1rem' }}>
          <svg viewBox="0 0 800 350" style={{ width: '100%', minWidth: '600px', height: '300px' }}>
            {/* Grid Lines */}
            {[50, 100, 150, 200, 250, 300].map((y) => (
              <line key={y} x1="50" y1={y} x2="780" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            ))}

            {/* WHO 97th Percentile Curve (Red / Overweight Upper Limit) */}
            <path
              d="M 50,300 Q 200,180 400,120 T 780,60"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <text x="730" y="55" fill="#EF4444" fontSize="11" fontWeight="700">97th Percentile</text>

            {/* WHO 50th Percentile Curve (Green / Median Standard) */}
            <path
              d="M 50,310 Q 200,210 400,150 T 780,100"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
            />
            <text x="730" y="95" fill="#10B981" fontSize="11" fontWeight="700">50th (Median)</text>

            {/* WHO 3rd Percentile Curve (Amber / Underweight Lower Limit) */}
            <path
              d="M 50,320 Q 200,240 400,190 T 780,140"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <text x="730" y="145" fill="#F59E0B" fontSize="11" fontWeight="700">3rd Percentile</text>

            {/* Patient Actual Growth Plot Dots */}
            {history.map((rec, i) => {
              const cx = 50 + (rec.age_in_months / 60) * 700;
              const cy = 340 - (rec.weight_kg / 25) * 280;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={cx - 10} y={cy - 10} fill="#38BDF8" fontSize="11" fontWeight="800">
                    {rec.weight_kg}kg ({rec.age_in_months}m)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ color: '#10B981' }}>━━ 50th Percentile (Ideal Standard)</span>
          <span style={{ color: '#EF4444' }}>┈ 97th Percentile (Overweight Threshold)</span>
          <span style={{ color: '#F59E0B' }}>┈ 3rd Percentile (Underweight Threshold)</span>
          <span style={{ color: '#38BDF8' }}>● Patient Measured Weight</span>
        </div>
      </Card>

      {/* Historical Measurements Table */}
      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem' }}>
          Historical Growth Records ({history.length})
        </h3>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No growth records entered yet. Click "Record Measurement" to start tracking.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((h, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>Age {h.age_in_months} Months</strong> •{' '}
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.recorded_date).toLocaleDateString()}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    Weight: <strong>{h.weight_kg} kg</strong> | Height: <strong>{h.height_cm} cm</strong> | Head: <strong>{h.head_circumference_cm} cm</strong> | BMI: <strong>{h.bmi}</strong>
                  </div>
                </div>

                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                  }}
                >
                  {h.nutritional_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Record Measurement Modal */}
      {isAdding && (
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
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <Card style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                  Record Child Growth Measurement
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveGrowth}>
                <Input
                  label="Age in Months"
                  type="number"
                  value={form.age_in_months}
                  onChange={(e) => setForm({ ...form, age_in_months: Number(e.target.value) })}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '0.75rem' }}>
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                    required
                  />
                  <Input
                    label="Height / Length (cm)"
                    type="number"
                    value={form.height_cm}
                    onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                    required
                  />
                </div>
                <Input
                  label="Head Circumference (cm)"
                  type="number"
                  step="0.1"
                  value={form.head_circumference_cm}
                  onChange={(e) => setForm({ ...form, head_circumference_cm: Number(e.target.value) })}
                  style={{ marginTop: '0.75rem' }}
                />
                <Input
                  label="Doctor / Clinical Notes"
                  placeholder="e.g. Active, good muscle tone"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ marginTop: '0.75rem' }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting} icon={CheckCircle2}>
                    Save Measurement
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
