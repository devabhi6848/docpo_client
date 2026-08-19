import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../api/invoiceApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Printer, ArrowLeft, Share2, MessageCircle, CheckCircle2 } from 'lucide-react';

export const InvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceApi
      .getInvoiceById(invoiceId)
      .then((res) => setInvoice(res.data.invoice || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading || !invoice) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading invoice receipt...</p>
      </div>
    );
  }

  const { clinic_id: clinic, doctor_id: doctor, patient_id: patient, whatsapp_link } = invoice;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Action Toolbar */}
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
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/billing/desk')}>
          Back to Billing
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {whatsapp_link && (
            <Button
              variant="secondary"
              icon={MessageCircle}
              onClick={() => window.open(whatsapp_link, '_blank')}
              style={{ background: '#25D366', color: '#fff', border: 'none' }}
            >
              Share on WhatsApp
            </Button>
          )}

          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Print Receipt
          </Button>
        </div>
      </div>

      {/* PRINTABLE RECEIPT */}
      <div
        id="printable-rx"
        style={{
          background: '#FFFFFF',
          color: '#0F172A',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.12)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E3A8A', margin: 0 }}>
              {clinic?.name || 'Docpa Health Clinic'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>
              {clinic?.address?.street ? `${clinic.address.street}, ${clinic.address.city}` : 'Main Road, Sector 14'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '600', margin: 0 }}>
              Phone: {clinic?.phone || '9876543210'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '4px', fontWeight: '800', fontSize: '0.8rem' }}>
              PAID RECEIPT ✓
            </span>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '8px 0 2px' }}>
              {invoice.invoice_number}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', margin: '1rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div>
            Billed To: <strong>{patient?.name}</strong> ({patient?.gender}, {patient?.age_years}y) • Ph: {patient?.phone}
          </div>
          <div>
            UHID: <strong>{patient?.uhid}</strong>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', margin: '1.25rem 0' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '8px 4px', width: '5%' }}>#</th>
              <th style={{ padding: '8px 8px', width: '55%' }}>Service / Procedure</th>
              <th style={{ padding: '8px 8px', width: '15%', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '8px 8px', width: '25%', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 4px', fontWeight: '700' }}>{idx + 1}.</td>
                <td style={{ padding: '10px 8px' }}>
                  <strong>{item.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>
                    ({item.category})
                  </span>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700' }}>
                  ₹{item.total_amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>Subtotal:</span>
              <strong>₹{invoice.subtotal}</strong>
            </div>

            {invoice.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#EF4444' }}>
                <span>Discount:</span>
                <strong>- ₹{invoice.discount_amount}</strong>
              </div>
            )}

            <div style={{ borderTop: '2px solid #0F172A', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '900' }}>
              <span>Total Paid:</span>
              <span style={{ color: '#10B981' }}>₹{invoice.paid_amount}</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'right', margin: '4px 0 0' }}>
              Paid via <strong>{(invoice.payment_method || 'cash').toUpperCase()}</strong>
              {invoice.transaction_reference && <span> (Ref: {invoice.transaction_reference})</span>}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '2.5rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
          <p style={{ margin: 0 }}>This is a computer generated official payment receipt.</p>
          <p style={{ margin: '2px 0 0' }}>Thank you for visiting {clinic?.name}!</p>
        </div>
      </div>
    </div>
  );
};
