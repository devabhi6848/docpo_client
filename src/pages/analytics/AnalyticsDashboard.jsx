import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { analyticsApi } from '../../api/analyticsApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ShieldCheck,
  Stethoscope,
  Pill,
  Printer,
  Calendar,
  RotateCcw,
  Sparkles,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { activeClinic } = useClinic();
  const [timeframe, setTimeframe] = useState('last_7_days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!activeClinic?._id) return;
    try {
      setLoading(true);
      const res = await analyticsApi.getSummary(activeClinic._id, timeframe);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load clinic analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeClinic, timeframe]);

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading clinic analytics & intelligence dashboard...</p>
      </div>
    );
  }

  const { kpis, payment_distribution: payments, top_diagnoses, top_medicines, daily_trends } = data;

  const maxRevenue = Math.max(...daily_trends.map((d) => d.revenue), 1000);
  const maxFootfall = Math.max(...daily_trends.map((d) => d.footfall), 10);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Inter', sans-serif" }}>
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
        <div>
          <span
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
            }}
          >
            EXECUTIVE CLINIC INTELLIGENCE
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 0' }}>
            {activeClinic?.name || 'Clinic'} Analytics & Insights
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Live performance, revenue breakdown, diagnosis trends & drug patterns
          </p>
        </div>

        {/* Timeframe Selector & Print */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: 'last_7_days', label: '7 Days' },
              { id: 'this_month', label: 'Month' },
              { id: 'last_30_days', label: '30 Days' },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: timeframe === tf.id ? 'var(--primary)' : 'transparent',
                  color: timeframe === tf.id ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                GROSS REVENUE
              </p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', margin: '4px 0' }}>
                ₹{kpis.total_revenue.toLocaleString()}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                Avg ticket: ₹{kpis.avg_ticket_size}
              </span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <DollarSign size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                PATIENT FOOTFALL
              </p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', margin: '4px 0' }}>
                {kpis.total_footfall} Visits
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {kpis.new_patients} New • {kpis.follow_ups} Follow-ups
              </span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
              <Users size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                DIGITAL PAYMENT SHARE
              </p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#8B5CF6', margin: '4px 0' }}>
                {payments.upi_percentage}%
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ₹{payments.upi.toLocaleString()} via UPI QR
              </span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <CreditCard size={22} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                VACCINE COMPLIANCE
              </p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F59E0B', margin: '4px 0' }}>
                {kpis.vaccine_compliance_rate}%
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>
                High IAP Adherence Rate
              </span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* VISUAL REVENUE & FOOTFALL DUAL TRAJECTORY BAR PLOT */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--primary)" /> Daily Footfall & Revenue Trajectory
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Comparing daily patient volume and daily collections
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>■ Revenue (₹)</span>
            <span style={{ color: '#10B981', fontWeight: '700' }}>● Patient Footfall</span>
          </div>
        </div>

        {/* SVG Dual Bar / Line Chart */}
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-input)', borderRadius: '12px', padding: '1.25rem' }}>
          <svg viewBox="0 0 800 280" style={{ width: '100%', minWidth: '600px', height: '240px' }}>
            {/* Grid */}
            {[40, 90, 140, 190, 240].map((y) => (
              <line key={y} x1="40" y1={y} x2="780" y2={y} stroke="rgba(255,255,255,0.06)" />
            ))}

            {/* Daily Bars */}
            {daily_trends.map((item, idx) => {
              const x = 70 + idx * 100;
              const barHeight = Math.max(10, (item.revenue / maxRevenue) * 180);
              const barY = 240 - barHeight;

              const circleY = 240 - (item.footfall / maxFootfall) * 160;

              return (
                <g key={idx}>
                  {/* Revenue Bar */}
                  <rect
                    x={x - 18}
                    y={barY}
                    width="36"
                    height={barHeight}
                    rx="6"
                    fill="url(#revenueGradient)"
                  />
                  <text x={x} y={barY - 8} fill="var(--primary)" fontSize="11" fontWeight="800" textAnchor="middle">
                    ₹{item.revenue}
                  </text>

                  {/* Footfall Dot */}
                  <circle cx={x} cy={circleY} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={x} y={circleY - 8} fill="#10B981" fontSize="10" fontWeight="800" textAnchor="middle">
                    {item.footfall} pts
                  </text>

                  {/* Day Label */}
                  <text x={x} y="260" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">
                    {item.day}
                  </text>
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.25" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </Card>

      {/* Lower 2-Column Grid: Diagnoses & Prescribed Medicines Leaderboards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Top Diagnoses Card */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} color="var(--primary)" /> Top 5 Diagnoses Treated
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Morbidity Pattern</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {top_diagnoses.map((diag, idx) => {
              const maxCount = top_diagnoses[0]?.count || 1;
              const pct = Math.round((diag.count / maxCount) * 100);

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                    <strong>{idx + 1}. {diag.name}</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{diag.count} Cases</span>
                  </div>
                  <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Prescribed Medicines Card */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={20} color="#10B981" /> Top 5 Prescribed Medications
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pharmacy Dispense</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {top_medicines.map((med, idx) => {
              const maxCount = top_medicines[0]?.count || 1;
              const pct = Math.round((med.count / maxCount) * 100);

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                    <strong>{idx + 1}. {med.name}</strong>
                    <span style={{ color: '#10B981', fontWeight: '800' }}>{med.count} Rx</span>
                  </div>
                  <div style={{ background: 'var(--bg-input)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
