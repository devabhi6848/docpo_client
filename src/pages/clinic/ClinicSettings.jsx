import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { clinicApi } from '../../api/clinicApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Tabs } from '../../components/ui/Tabs';
import {
  Building,
  FileText,
  Users,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Sparkles,
} from 'lucide-react';

export const ClinicSettings = () => {
  const { activeClinic, updateClinic, createClinic } = useClinic();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // General & Pricing Form
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    phone: '',
    email: '',
    emergency_phone: '',
    consultation_fee: 500,
    follow_up_fee: 300,
    follow_up_validity_days: 7,
    token_prefix: 'T',
    address: {
      street: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    letterhead_settings: {
      show_header: true,
      header_title: '',
      header_subtitle: '',
      logo_url: '',
      footer_text: 'Valid for medical record. Please bring this prescription for follow-up.',
      paper_size: 'A4',
      header_space_mm: 0,
    },
  });

  // Staff Management State
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({
    identifier: '',
    role: 'receptionist',
    designation: 'Front Desk Receptionist',
  });

  useEffect(() => {
    if (activeClinic) {
      setFormData({
        name: activeClinic.name || '',
        tagline: activeClinic.tagline || '',
        phone: activeClinic.phone || '',
        email: activeClinic.email || '',
        emergency_phone: activeClinic.emergency_phone || '',
        consultation_fee: activeClinic.consultation_fee || 500,
        follow_up_fee: activeClinic.follow_up_fee || 300,
        follow_up_validity_days: activeClinic.follow_up_validity_days || 7,
        token_prefix: activeClinic.token_prefix || 'T',
        address: activeClinic.address || {
          street: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
        letterhead_settings: activeClinic.letterhead_settings || {
          show_header: true,
          header_title: activeClinic.name || '',
          header_subtitle: activeClinic.tagline || '',
          logo_url: '',
          footer_text: 'Valid for medical record. Please bring this prescription for follow-up.',
          paper_size: 'A4',
          header_space_mm: 0,
        },
      });

      // Fetch clinic staff
      clinicApi.getClinicStaff(activeClinic._id)
        .then((res) => setStaffList(res.data?.staff || []))
        .catch((err) => console.error('Failed to load clinic staff:', err));
    }
  }, [activeClinic]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      if (activeClinic?._id) {
        await updateClinic(activeClinic._id, formData);
        setSuccess('Clinic settings and letterhead updated successfully!');
      } else {
        await createClinic(formData);
        setSuccess('New clinic created successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!activeClinic?._id) {
      setError('Please save clinic first before adding staff.');
      return;
    }
    setError('');
    try {
      setLoading(true);
      const res = await clinicApi.addStaff(activeClinic._id, newStaff);
      setStaffList((prev) => [...prev, res.data.staff]);
      setNewStaff({ identifier: '', role: 'receptionist', designation: 'Front Desk Receptionist' });
      setSuccess('Staff member added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add staff member.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      await clinicApi.removeStaff(activeClinic._id, staffId);
      setStaffList((prev) => prev.filter((s) => s._id !== staffId));
      setSuccess('Staff member removed.');
    } catch (err) {
      setError(err.message || 'Failed to remove staff.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Clinic Profile & Practice Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Configure clinic address, letterhead print layout, consultation pricing, and staff roles.
            </p>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'general', label: 'General & Pricing', icon: Building },
            { id: 'letterhead', label: 'Letterhead & Print', icon: Printer },
            { id: 'staff', label: 'Staff & Receptionists', icon: Users },
          ]}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setError('');
            setSuccess('');
          }}
        />

        <Alert type="success" message={success} onClose={() => setSuccess('')} />
        <Alert type="error" message={error} onClose={() => setError('')} />

        {/* TAB 1: GENERAL & PRICING */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input
                label="Clinic / Hospital Name"
                placeholder="e.g. Docpa Child & Family Health Clinic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Token Prefix"
                placeholder="T"
                value={formData.token_prefix}
                onChange={(e) => setFormData({ ...formData, token_prefix: e.target.value })}
              />
            </div>

            <Input
              label="Tagline / Speciality Subtitle"
              placeholder="e.g. Advanced Pediatric & Multispeciality Center"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input
                label="Clinic Phone / Helpline"
                placeholder="e.g. 011-28941200"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Emergency Contact"
                placeholder="e.g. 9876543210"
                value={formData.emergency_phone}
                onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
              />
              <Input
                label="Official Email"
                placeholder="clinic@docpa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>
                Consultation Fees & Follow-up Rules
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Input
                  label="OPD Consultation Fee (₹)"
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                  min={0}
                />
                <Input
                  label="Follow-up Fee (₹)"
                  type="number"
                  value={formData.follow_up_fee}
                  onChange={(e) => setFormData({ ...formData, follow_up_fee: Number(e.target.value) })}
                  min={0}
                />
                <Input
                  label="Follow-up Validity (Days)"
                  type="number"
                  value={formData.follow_up_validity_days}
                  onChange={(e) => setFormData({ ...formData, follow_up_validity_days: Number(e.target.value) })}
                  min={1}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Clinic Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <Input
                  label="Street Address / Building"
                  placeholder="Plot 42, Sector 14"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })
                  }
                />
                <Input
                  label="Landmark"
                  placeholder="Near Metro Station"
                  value={formData.address.landmark}
                  onChange={(e) =>
                    setFormData({ ...formData, address: { ...formData.address, landmark: e.target.value } })
                  }
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Input
                  label="City"
                  placeholder="New Delhi"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })
                  }
                />
                <Input
                  label="State"
                  placeholder="Delhi"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })
                  }
                />
                <Input
                  label="Pincode"
                  placeholder="110001"
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={CheckCircle2}
              style={{ marginTop: '1.5rem' }}
            >
              Save Clinic Information
            </Button>
          </form>
        )}

        {/* TAB 2: LETTERHEAD DESIGNER */}
        {activeTab === 'letterhead' && (
          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
                  Letterhead Layout Controls
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.letterhead_settings.show_header}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          letterhead_settings: { ...formData.letterhead_settings, show_header: e.target.checked },
                        })
                      }
                    />
                    Print Digital Header on Plain A4/A5 Paper
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '24px' }}>
                    Uncheck if you print on pre-printed doctor stationery pads.
                  </p>
                </div>

                <Input
                  label="Header Top Line / Clinic Title"
                  placeholder={formData.name || 'DR. SHARMA CHILD CLINIC'}
                  value={formData.letterhead_settings.header_title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      letterhead_settings: { ...formData.letterhead_settings, header_title: e.target.value },
                    })
                  }
                />

                <Input
                  label="Header Subtitle / Degrees"
                  placeholder="MBBS, MD (Pediatrics) | Reg: MCI-58291"
                  value={formData.letterhead_settings.header_subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      letterhead_settings: { ...formData.letterhead_settings, header_subtitle: e.target.value },
                    })
                  }
                />

                <Input
                  label="Prescription Footer Note"
                  value={formData.letterhead_settings.footer_text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      letterhead_settings: { ...formData.letterhead_settings, footer_text: e.target.value },
                    })
                  }
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                      Paper Size
                    </label>
                    <select
                      value={formData.letterhead_settings.paper_size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          letterhead_settings: { ...formData.letterhead_settings, paper_size: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                      }}
                    >
                      <option value="A4">Standard A4 Sheet</option>
                      <option value="A5">Compact A5 Pad</option>
                      <option value="thermal">Thermal 3-inch</option>
                    </select>
                  </div>

                  <Input
                    label="Pre-printed Top Gap (mm)"
                    type="number"
                    value={formData.letterhead_settings.header_space_mm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        letterhead_settings: { ...formData.letterhead_settings, header_space_mm: Number(e.target.value) },
                      })
                    }
                    min={0}
                  />
                </div>
              </div>

              {/* LIVE RX PREVIEW */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" /> Live Rx Letterhead Preview
                </h3>

                <div
                  style={{
                    background: '#FFFFFF',
                    color: '#1E293B',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    minHeight: '340px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Header Area */}
                  {formData.letterhead_settings.show_header ? (
                    <div style={{ borderBottom: '2px solid #2563EB', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>
                          {formData.letterhead_settings.header_title || formData.name || 'DOCPA HEALTH CLINIC'}
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '2px 0' }}>
                          {formData.letterhead_settings.header_subtitle || formData.tagline || 'MBBS, MD - Senior Consultant'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                          {formData.address.street ? `${formData.address.street}, ${formData.address.city}` : 'Sector 14, Health City'} | Ph: {formData.phone || '9876543210'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B' }}>
                        <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          Rx
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: `${formData.letterhead_settings.header_space_mm || 35}px`, borderBottom: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
                      [ Pre-printed Letterhead Margin: {formData.letterhead_settings.header_space_mm || 35}mm ]
                    </div>
                  )}

                  {/* Body Sample */}
                  <div style={{ padding: '1rem 0', flex: 1, fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                      <span>Patient: <strong>Master Aarav Sharma (4y / M)</strong></span>
                      <span>Date: <strong>19-Aug-2026</strong></span>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontWeight: '700', color: '#1E293B' }}>Rx:</p>
                      <p style={{ margin: '4px 0' }}>1. <strong>Tab Paracetamol 250mg</strong> — 1-0-1 (3 Days)</p>
                      <p style={{ margin: '4px 0' }}>2. <strong>Syp Amoxicillin 125mg</strong> — 5ml Twice Daily (5 Days)</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '0.7rem', color: '#94A3B8', textAlign: 'center' }}>
                    {formData.letterhead_settings.footer_text}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={CheckCircle2}
              style={{ marginTop: '1.5rem' }}
            >
              Save Letterhead Template
            </Button>
          </form>
        )}

        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div>
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>
                Add New Staff Member (Receptionist / Doctor / Nurse)
              </h3>
              <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <Input
                  label="Email or Mobile Phone"
                  placeholder="receptionist@clinic.com or 9876543210"
                  value={newStaff.identifier}
                  onChange={(e) => setNewStaff({ ...newStaff, identifier: e.target.value })}
                  required
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                    Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        role: e.target.value,
                        designation: e.target.value === 'doctor' ? 'Associate Doctor' : 'Front Desk Receptionist',
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="clinic_admin">Clinic Admin</option>
                  </select>
                </div>
                <Input
                  label="Designation"
                  placeholder="e.g. Senior Receptionist"
                  value={newStaff.designation}
                  onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                />
                <Button type="submit" variant="primary" loading={loading} icon={Plus}>
                  Add Staff
                </Button>
              </form>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Active Clinic Staff</h3>
            {staffList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No staff members added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {staffList.map((st) => (
                  <div
                    key={st._id}
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
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{st.user_id?.name || 'Staff Member'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {st.user_id?.email || st.user_id?.phone || 'No contact'} |{' '}
                        <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: '600' }}>
                          {st.role}
                        </span>{' '}
                        ({st.designation || st.role})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(st._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error, #EF4444)',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                      title="Remove Staff"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
