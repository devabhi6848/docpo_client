import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queueApi } from '../../api/queueApi';
import { Activity, Volume2, Users, Clock, ArrowRight } from 'lucide-react';

export const TvDisplay = () => {
  const { clinicId } = useParams();
  const [displayData, setDisplayData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchQueue = async () => {
    if (!clinicId) return;
    try {
      const res = await queueApi.getTvDisplay(clinicId);
      setDisplayData(res.data);
    } catch (err) {
      console.error('Failed to load TV display queue:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Auto-refresh every 5s
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [clinicId]);

  const activeToken = displayData?.calling_now?.[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0F19',
        color: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Clinic Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Activity size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
              {displayData?.clinic?.name || 'Docpa Medical Clinic'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: '2px 0 0' }}>
              {displayData?.clinic?.tagline || 'Live OPD Consultation Queue'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#38BDF8', letterSpacing: '1px' }}>
            {currentTime.toLocaleTimeString()}
          </h2>
          <p style={{ color: '#94A3B8', margin: '2px 0 0', fontSize: '0.95rem' }}>
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Grid: Calling Token & Upcoming Queue */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '2.5rem',
          margin: '2rem 0',
          flex: 1,
        }}
      >
        {/* BIG NOW CALLING CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: '2px solid #2563EB',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(37, 99, 235, 0.25)',
          }}
        >
          <span
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              padding: '6px 18px',
              borderRadius: '999px',
              fontSize: '1.1rem',
              fontWeight: '800',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            🔊 NOW CALLING
          </span>

          {activeToken ? (
            <>
              <h1
                style={{
                  fontSize: '6.5rem',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  margin: '0.5rem 0',
                  letterSpacing: '4px',
                  textShadow: '0 0 30px rgba(56, 189, 248, 0.6)',
                }}
              >
                {activeToken.token_code}
              </h1>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#F1F5F9', margin: '0 0 1rem' }}>
                {activeToken.patient_id?.name || 'Patient'}
              </h2>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#38BDF8',
                }}
              >
                Consulting with: <strong>Dr. {activeToken.doctor_id?.name || 'Doctor'}</strong> (Cabin 1)
              </div>
            </>
          ) : (
            <div style={{ padding: '3rem 0', color: '#64748B' }}>
              <Users size={64} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.8rem', color: '#94A3B8' }}>Doctor Ready for Next Patient</h3>
              <p style={{ fontSize: '1.1rem' }}>Please wait for your token announcement</p>
            </div>
          )}
        </div>

        {/* UPCOMING TOKENS LIST */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              color: '#94A3B8',
              margin: '0 0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Clock size={24} color="#38BDF8" /> UPCOMING IN QUEUE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {displayData?.upcoming?.length > 0 ? (
              displayData.upcoming.map((t, idx) => (
                <div
                  key={t._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: idx === 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: idx === 0 ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: '900',
                        color: idx === 0 ? '#38BDF8' : '#F1F5F9',
                        letterSpacing: '2px',
                      }}
                    >
                      {t.token_code}
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#E2E8F0' }}>
                      {t.patient_id?.name}
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: idx === 0 ? '#38BDF8' : '#64748B',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    {idx === 0 ? 'NEXT UP' : `WAITING #${idx + 1}`}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>
                No more patients waiting in queue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1rem',
          color: '#64748B',
          fontSize: '0.9rem',
        }}
      >
        <span>🏥 Docpa Clinic Management System • Real-Time OPD Queue</span>
        <span>Please maintain silence in the consultation lobby</span>
      </div>
    </div>
  );
};
