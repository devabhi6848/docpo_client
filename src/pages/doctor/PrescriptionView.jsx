import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { prescriptionApi } from '../../api/prescriptionApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Printer, ArrowLeft, Share2, MessageCircle, CheckCircle2 } from 'lucide-react';

export const PrescriptionView = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionApi
      .getPrescriptionById(prescriptionId)
      .then((res) => setPrescription(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [prescriptionId]);

  if (loading || !prescription) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading prescription...</p>
      </div>
    );
  }

  const { clinic_id: clinic, doctor_id: doctor, doctor_profile: docProfile, patient_id: patient } = prescription;

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Message Composer
  const handleShareWhatsApp = () => {
    if (!patient?.phone) return;
    const phone = patient.phone.replace(/\D/g, '').slice(-10);
    const msg =
      `*Hello ${patient.name || 'Patient'},*\n\n` +
      `Thank you for visiting *${clinic?.name || 'our clinic'}* today.\n\n` +
      `👨‍⚕️ *Consultant:* Dr. ${doctor?.name || 'Doctor'}\n` +
      `📄 *Rx No:* ${prescription.prescription_number}\n` +
      (prescription.follow_up_date ? `🗓️ *Follow-up Date:* ${new Date(prescription.follow_up_date).toLocaleDateString()}\n` : '') +
      `\n🔗 *View Digital Prescription:* ${window.location.href}\n` +
      `\n_Please take your medications on time. Wishing you a speedy recovery!_ 🩺✨`;

    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Action Toolbar (Hidden during browser printing) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/doctor/dashboard')}>
          Back to Suite
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon={MessageCircle}
            onClick={handleShareWhatsApp}
            style={{ background: '#25D366', color: '#fff', border: 'none' }}
          >
            Share on WhatsApp
          </Button>

          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print Prescription (A4)
          </Button>
        </div>
      </div>

      {/* PRINTABLE RX SHEET */}
      <div
        id="printable-rx"
        style={{
          background: '#FFFFFF',
          color: '#0F172A',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
          fontFamily: "'Inter', sans-serif",
          minHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* DOCTOR & CLINIC HEADER */}
          <div
            style={{
              borderBottom: '3px solid #2563EB',
              paddingBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1E3A8A', margin: 0 }}>
                {clinic?.letterhead_settings?.header_title || `DR. ${doctor?.name?.toUpperCase() || 'DOCTOR'}`}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700', margin: '4px 0 2px' }}>
                {docProfile?.qualifications?.join(', ') || 'MBBS, MD'} | {docProfile?.specializations?.join(', ') || 'Consultant Physician'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Reg. No: <strong>{docProfile?.medical_registration_number || 'MCI-REG-PENDING'}</strong> ({docProfile?.state_medical_council || 'Medical Council of India'})
              </p>
            </div>

            <div style={{ textAlign: 'right', maxWidth: '320px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {clinic?.name || 'Docpa Health Clinic'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0' }}>
                {clinic?.address?.street ? `${clinic.address.street}, ${clinic.address.city}` : 'Sector 14, Main Road'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '600', margin: 0 }}>
                Helpline: {clinic?.phone || '9876543210'}
              </p>
            </div>
          </div>

          {/* PATIENT INFO & VITALS BAR */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 16px',
              margin: '1.25rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#334155',
            }}
          >
            <div>
              Patient: <strong>{patient?.name}</strong> ({patient?.gender?.toUpperCase()}, {patient?.age_years}y)
            </div>
            <div>
              UHID: <strong>{patient?.uhid}</strong>
            </div>
            <div>
              Rx No: <strong>{prescription.prescription_number}</strong>
            </div>
            <div>
              Date: <strong>{new Date(prescription.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* VITALS SNAPSHOT */}
          {prescription.vitals_snapshot?.weight_kg && (
            <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', paddingLeft: '6px' }}>
              <strong>Vitals:</strong> Wt: {prescription.vitals_snapshot.weight_kg} kg | BP: {prescription.vitals_snapshot.bp_systolic}/{prescription.vitals_snapshot.bp_diastolic} mmHg | Pulse: {prescription.vitals_snapshot.pulse_rate} bpm | Temp: {prescription.vitals_snapshot.temperature_f}°F
            </div>
          )}

          {/* DIAGNOSIS */}
          {prescription.diagnosis?.length > 0 && (
            <div style={{ marginBottom: '1.25rem', paddingLeft: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>Diagnosis: </span>
              <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: '600' }}>
                {prescription.diagnosis.join(', ')}
              </span>
            </div>
          )}

          {/* RX MEDICINES TABLE */}
          <div style={{ margin: '1.5rem 0' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563EB', marginBottom: '8px' }}>
              ℞
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '8px 4px', width: '5%' }}>#</th>
                  <th style={{ padding: '8px 8px', width: '45%' }}>Medicine & Composition</th>
                  <th style={{ padding: '8px 8px', width: '20%' }}>Dosage & Frequency</th>
                  <th style={{ padding: '8px 8px', width: '15%' }}>Timing</th>
                  <th style={{ padding: '8px 8px', width: '15%' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines?.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 4px', fontWeight: '700' }}>{idx + 1}.</td>
                    <td style={{ padding: '10px 8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{m.name}</strong>
                      {m.generic_name && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>({m.generic_name})</div>
                      )}
                      {m.instructions && (
                        <div style={{ fontSize: '0.75rem', color: '#2563EB', fontStyle: 'italic' }}>
                          💡 {m.instructions}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <strong style={{ color: '#2563EB', fontSize: '0.95rem' }}>{m.frequency}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.dose}</div>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#334155' }}>{m.timing}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{m.duration_days} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GENERAL ADVICE */}
          {prescription.general_advice && (
            <div style={{ marginTop: '1.5rem', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #CBD5E1', fontSize: '0.85rem' }}>
              <strong>Advice & Precautions:</strong>
              <p style={{ margin: '4px 0 0', color: '#475569' }}>{prescription.general_advice}</p>
            </div>
          )}
        </div>

        {/* FOOTER & SIGNATURE */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
            <div>
              {prescription.follow_up_date && (
                <div style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                  Next Follow-up Date:{' '}
                  <strong>{new Date(prescription.follow_up_date).toLocaleDateString()}</strong>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  [ Digitally Signed by Dr. {doctor?.name} ]
                </span>
              </div>
              <div style={{ borderTop: '1px solid #0F172A', paddingTop: '4px', fontSize: '0.85rem', fontWeight: '800' }}>
                Dr. {doctor?.name}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.7rem', color: '#94A3B8', textAlign: 'center', margin: '8px 0 0' }}>
            {clinic?.letterhead_settings?.footer_text || 'Valid for clinical reference. Please bring this prescription on next visit.'}
          </p>
        </div>
      </div>
    </div>
  );
};
