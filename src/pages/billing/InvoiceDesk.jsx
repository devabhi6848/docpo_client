import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { patientApi } from '../../api/patientApi';
import { invoiceApi } from '../../api/invoiceApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Receipt,
  Search,
  Sparkles,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

const COMMON_SERVICES = [
  { name: 'Doctor Consultation Fee', category: 'consultation', price: 500 },
  { name: 'Pediatric Follow-up Visit', category: 'consultation', price: 300 },
  { name: 'Hexaxim 6-in-1 Vaccine', category: 'vaccine', price: 3800 },
  { name: 'Prevenar 13 (PCV) Vaccine', category: 'vaccine', price: 3400 },
  { name: 'Rotavac Rotavirus Vaccine', category: 'vaccine', price: 1200 },
  { name: 'Nebulization Procedure', category: 'procedure', price: 200 },
  { name: 'Wound Dressing & Bandage', category: 'procedure', price: 250 },
  { name: 'Random Blood Sugar (RBS)', category: 'lab_test', price: 60 },
  { name: '12-Lead ECG', category: 'lab_test', price: 350 },
];

export const InvoiceDesk = () => {
  const { activeClinic } = useClinic();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Patient
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Billing Items
  const [items, setItems] = useState([
    {
      name: 'Doctor Consultation Fee',
      category: 'consultation',
      quantity: 1,
      unit_price: activeClinic?.consultation_fee || 500,
      total_amount: activeClinic?.consultation_fee || 500,
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'procedure',
    quantity: 1,
    unit_price: 200,
  });

  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionRef, setTransactionRef] = useState('');

  // Daily Summary Stats
  const [dailyStats, setDailyStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchDailyCollection = async () => {
    if (!activeClinic?._id) return;
    try {
      const res = await invoiceApi.getDailyCollection(activeClinic._id);
      setDailyStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDailyCollection();
  }, [activeClinic]);

  // Patient Auto-search
  useEffect(() => {
    if (patientSearch.length >= 3 && activeClinic?._id) {
      patientApi
        .searchPatients(activeClinic._id, patientSearch)
        .then((res) => setPatientResults(res.data?.patients || []))
        .catch((err) => console.error(err));
    } else {
      setPatientResults([]);
    }
  }, [patientSearch, activeClinic]);

  const handleAddItemFromPreset = (preset) => {
    setItems((prev) => [
      ...prev,
      {
        name: preset.name,
        category: preset.category,
        quantity: 1,
        unit_price: preset.price,
        total_amount: preset.price,
      },
    ]);
  };

  const handleAddCustomItem = () => {
    if (!newItem.name.trim()) return;
    const total = (Number(newItem.quantity) || 1) * (Number(newItem.unit_price) || 0);
    setItems((prev) => [
      ...prev,
      {
        ...newItem,
        quantity: Number(newItem.quantity) || 1,
        unit_price: Number(newItem.unit_price) || 0,
        total_amount: total,
      },
    ]);
    setNewItem({ name: '', category: 'procedure', quantity: 1, unit_price: 200 });
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total_amount, 0);
  const totalPayable = Math.max(0, subtotal - Number(discountAmount || 0));

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please search and select a patient first.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item to the invoice.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        clinic_id: activeClinic._id,
        patient_id: selectedPatient._id,
        doctor_id: activeClinic.owner_id?._id || activeClinic.owner_id,
        items,
        subtotal,
        discount_amount: Number(discountAmount) || 0,
        tax_amount: 0,
        total_payable: totalPayable,
        paid_amount: totalPayable,
        payment_status: 'paid',
        payment_method: paymentMethod,
        transaction_reference: transactionRef,
      };

      const res = await invoiceApi.createInvoice(payload);
      navigate(`/billing/view/${res.data.invoice._id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate invoice.');
    } finally {
      setLoading(false);
    }
  };

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
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
            }}
          >
            CLINIC POS & INVOICING DESK
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 0' }}>
            Instant Billing & Receipts
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {activeClinic?.name} • Multi-mode payments (Cash, UPI QR, Card)
          </p>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Daily Revenue KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            TODAY'S TOTAL REVENUE
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', margin: '4px 0' }}>
            ₹{dailyStats?.stats?.total_revenue || 0}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {dailyStats?.stats?.total_invoices || 0} Invoices generated
          </p>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            UPI DIGITAL PAYMENTS
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', margin: '4px 0' }}>
            ₹{dailyStats?.stats?.upi_total || 0}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>PhonePe / GPay / Paytm</p>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            CASH COLLECTIONS
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F59E0B', margin: '4px 0' }}>
            ₹{dailyStats?.stats?.cash_total || 0}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Front desk cash drawer</p>
        </Card>
      </div>

      {/* Main Billing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Patient Selector + Items Table */}
        <div>
          {/* Patient Selector Card */}
          <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
              1. Select Patient
            </h3>

            {selectedPatient ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedPatient.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedPatient.gender}, {selectedPatient.age_years}y • Ph: {selectedPatient.phone} • UHID: {selectedPatient.uhid}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                  Change Patient
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  placeholder="Search patient by mobile number or name..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  icon={Search}
                />
                {patientResults.length > 0 && (
                  <div
                    style={{
                      marginTop: '8px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px',
                      border: '1px solid var(--border-color)',
                      maxHeight: '160px',
                      overflowY: 'auto',
                    }}
                  >
                    {patientResults.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientSearch('');
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          background: 'var(--bg-card)',
                          cursor: 'pointer',
                          marginBottom: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          <strong>{p.name}</strong> ({p.gender}, {p.age_years}y) • Ph: {p.phone}
                        </span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem' }}>
                          Select ✓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Presets Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              ⚡ 1-CLICK QUICK ADD PRESETS:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {COMMON_SERVICES.map((srv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddItemFromPreset(srv)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  + {srv.name} (₹{srv.price})
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Items Table */}
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
              2. Itemized Services & Charges ({items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.88rem',
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({item.category})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      ₹{item.total_amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Item Adder */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginTop: '14px', alignItems: 'flex-end' }}>
              <Input
                label="Custom Service Name"
                placeholder="e.g. Ear Wax Cleaning"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <Input
                label="Qty"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                min={1}
              />
              <Input
                label="Price (₹)"
                type="number"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                min={0}
              />
              <Button type="button" variant="secondary" onClick={handleAddCustomItem} style={{ marginBottom: '2px' }}>
                + Add
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Payment Mode & Totals */}
        <div>
          <Card style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem' }}>
              Payment Breakdown
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <strong>₹{subtotal}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Discount (₹):</span>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                min={0}
                style={{ width: '90px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', textAlign: 'right', fontWeight: '700' }}
              />
            </div>

            <div
              style={{
                borderTop: '2px dashed var(--border-color)',
                paddingTop: '12px',
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Total Payable:</span>
              <strong style={{ fontSize: '1.6rem', color: '#10B981' }}>₹{totalPayable}</strong>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>
                Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'cash', label: '💵 Cash' },
                  { id: 'upi', label: '📱 UPI QR' },
                  { id: 'card', label: '💳 Card' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMethod(mode.id)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: paymentMethod === mode.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: paymentMethod === mode.id ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-input)',
                      color: paymentMethod === mode.id ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod !== 'cash' && (
              <Input
                label="Transaction / UTR Reference No"
                placeholder="e.g. UPI Ref: 3892189281"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                style={{ marginTop: '1rem' }}
              />
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              icon={Receipt}
              onClick={handleGenerateInvoice}
              style={{ marginTop: '1.75rem', padding: '14px', fontSize: '1.05rem', fontWeight: '800' }}
            >
              Collect ₹{totalPayable} & Print Bill
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
