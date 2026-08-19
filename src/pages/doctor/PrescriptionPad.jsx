import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { patientApi } from '../../api/patientApi';
import { medicineApi } from '../../api/medicineApi';
import { templateApi } from '../../api/templateApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import {
  Stethoscope,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Calendar,
  CheckCircle2,
  Activity,
  BookmarkPlus,
  FileText,
  Search,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const PrescriptionPad = () => {
  const { appointmentId, patientId } = useParams();
  const { activeClinic } = useClinic();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Drug Search State
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [isSearchingDrugs, setIsSearchingDrugs] = useState(false);

  // Prescription Form
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [chiefComplaints, setChiefComplaints] = useState(['Fever', 'Dry cough']);
  const [complaintInput, setComplaintInput] = useState('');
  const [diagnosisList, setDiagnosisList] = useState(['Acute Viral Upper Respiratory Infection']);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [investigations, setInvestigations] = useState([]);
  const [investigationInput, setInvestigationInput] = useState('');
  const [generalAdvice, setGeneralAdvice] = useState('Take medications on time. Drink plenty of warm water and rest well.');
  const [followUpDays, setFollowUpDays] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Load: Patient Demographics + Templates
  useEffect(() => {
    const init = async () => {
      try {
        if (patientId) {
          const res = await patientApi.getPatientById(patientId);
          setPatient(res.data.patient);
        }
        const tplRes = await templateApi.getTemplates();
        setTemplates(tplRes.data?.templates || []);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [patientId]);

  // Real-time Drug Autocomplete
  useEffect(() => {
    if (drugSearchQuery.length >= 2) {
      setIsSearchingDrugs(true);
      medicineApi
        .searchMedicines(drugSearchQuery)
        .then((res) => setDrugSuggestions(res.data?.medicines || []))
        .catch((err) => console.error(err))
        .finally(() => setIsSearchingDrugs(false));
    } else {
      setDrugSuggestions([]);
    }
  }, [drugSearchQuery]);

  // Apply Template 1-Click
  const handleApplyTemplate = (tplId) => {
    const tpl = templates.find((t) => t._id === tplId);
    if (!tpl) return;

    if (tpl.chief_complaints?.length) setChiefComplaints(tpl.chief_complaints);
    if (tpl.diagnosis?.length) setDiagnosisList(tpl.diagnosis);
    if (tpl.medicines?.length) setPrescribedMedicines(tpl.medicines);
    if (tpl.investigations?.length) setInvestigations(tpl.investigations);
    if (tpl.advice) setGeneralAdvice(tpl.advice);
    setSelectedTemplate(tplId);
  };

  const handleAddMedicineFromSuggestion = (med) => {
    const newMed = {
      name: med.name,
      generic_name: med.generic_name || '',
      dosage_form: med.dosage_form || 'Tablet',
      dose: med.dosage_form === 'Syrup' ? '5 ml' : '1 Tab',
      frequency: med.default_frequency || '1-0-1',
      timing: med.default_timing || 'After Food',
      duration_days: med.default_duration_days || 5,
      instructions: med.instructions || '',
    };

    setPrescribedMedicines((prev) => [...prev, newMed]);
    setDrugSearchQuery('');
    setDrugSuggestions([]);
  };

  const handleAddCustomDrug = () => {
    if (!drugSearchQuery.trim()) return;
    setPrescribedMedicines((prev) => [
      ...prev,
      {
        name: drugSearchQuery.trim(),
        generic_name: '',
        dosage_form: 'Tablet',
        dose: '1 Tab',
        frequency: '1-0-1',
        timing: 'After Food',
        duration_days: 5,
        instructions: '',
      },
    ]);
    setDrugSearchQuery('');
    setDrugSuggestions([]);
  };

  const handleRemoveMedicine = (idx) => {
    setPrescribedMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicineField = (idx, field, val) => {
    setPrescribedMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleIssuePrescription = async () => {
    if (prescribedMedicines.length === 0) {
      setError('Please add at least one medication to the prescription.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + followUpDays);

      const payload = {
        clinic_id: activeClinic._id,
        patient_id: patient?._id || patientId,
        appointment_id: appointmentId || undefined,
        vitals_snapshot: patient?.latest_vitals || {},
        chief_complaints: chiefComplaints,
        diagnosis: diagnosisList,
        clinical_notes: clinicalNotes,
        medicines: prescribedMedicines,
        investigations: investigations,
        general_advice: generalAdvice,
        follow_up_date: followUpDate.toISOString(),
      };

      const res = await prescriptionApi.issuePrescription(payload);
      navigate(`/doctor/prescription/view/${res.data.prescription._id}`);
    } catch (err) {
      setError(err.message || 'Failed to issue prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Patient Demographics Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.2rem',
            }}
          >
            {patient?.name ? patient.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
              {patient?.name || 'Patient'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {patient?.gender?.toUpperCase()}, {patient?.age_years}y {patient?.age_months ? `${patient.age_months}m` : ''} • Ph: {patient?.phone} • UHID: {patient?.uhid}
            </p>
          </div>
        </div>

        {/* Pediatric Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => window.open('/pediatric/immunization/' + (patient?._id || patientId), '_blank')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #10B981',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            💉 Vaccine Schedule
          </button>
          <button
            type="button"
            onClick={() => window.open('/pediatric/growth/' + (patient?._id || patientId), '_blank')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38BDF8',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📈 Growth Curve
          </button>
        </div>

        {/* Vitals Summary Pill */}
        {patient?.latest_vitals && (
          <div
            style={{
              background: 'var(--bg-card)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              display: 'flex',
              gap: '12px',
            }}
          >
            <span>BP: <strong>{patient.latest_vitals.bp_systolic || 120}/{patient.latest_vitals.bp_diastolic || 80}</strong></span>
            <span>Pulse: <strong>{patient.latest_vitals.pulse_rate || 72}</strong></span>
            <span>Wt: <strong>{patient.latest_vitals.weight_kg}kg</strong></span>
            <span>Temp: <strong>{patient.latest_vitals.temperature_f || 98.6}°F</strong></span>
          </div>
        )}
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* 1-Click Template Loader Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-card)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <Sparkles size={18} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Apply 1-Click Rx Template:</span>
        <select
          value={selectedTemplate}
          onChange={(e) => handleApplyTemplate(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '360px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <option value="">Select a ready clinical kit (e.g. Viral Fever, AGE)...</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              ⚡ {t.title} ({t.medicines?.length || 0} drugs)
            </option>
          ))}
        </select>
      </div>

      {/* Main 2-Column Rx Builder */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Medicines Engine */}
        <div>
          <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>℞</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Prescribed Medications ({prescribedMedicines.length})
                </h3>
              </div>
            </div>

            {/* Instant Drug Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Input
                    placeholder="Search 50,000+ Indian drugs (e.g. Augmentin, Calpol, Montair, Azithral)..."
                    value={drugSearchQuery}
                    onChange={(e) => setDrugSearchQuery(e.target.value)}
                    icon={Search}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleAddCustomDrug}>
                  + Add Custom
                </Button>
              </div>

              {/* Live Drug Suggestions Dropdown */}
              {drugSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                    zIndex: 100,
                    maxHeight: '280px',
                    overflowY: 'auto',
                    marginTop: '4px',
                  }}
                >
                  {drugSuggestions.map((med) => (
                    <div
                      key={med._id}
                      onClick={() => handleAddMedicineFromSuggestion(med)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          {med.name}
                        </strong>{' '}
                        <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {med.dosage_form}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {med.generic_name}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                        + Add to Rx
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescribed Medicines List */}
            {prescribedMedicines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Stethoscope size={40} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                <p style={{ fontWeight: '600' }}>No medicines added yet</p>
                <p style={{ fontSize: '0.8rem' }}>Type in the search bar above or apply a 1-click template.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {prescribedMedicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                          {idx + 1}. {m.name}
                        </span>{' '}
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {m.dosage_form}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quick Dosage, Frequency, Timing Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Dose (1 Tab/5ml)"
                        value={m.dose}
                        onChange={(e) => handleUpdateMedicineField(idx, 'dose', e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                      />

                      {/* Frequency Selector Buttons */}
                      <select
                        value={m.frequency}
                        onChange={(e) => handleUpdateMedicineField(idx, 'frequency', e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '700' }}
                      >
                        <option value="1-0-1">1-0-1 (Twice Daily)</option>
                        <option value="1-0-0">1-0-0 (Morning Only)</option>
                        <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                        <option value="0-0-1">0-0-1 (Night Only)</option>
                        <option value="SOS">SOS (As Needed)</option>
                        <option value="1-1-1-1">1-1-1-1 (4 Times)</option>
                      </select>

                      <select
                        value={m.timing}
                        onChange={(e) => handleUpdateMedicineField(idx, 'timing', e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                        <option value="At Bedtime">At Bedtime</option>
                        <option value="With Food">With Food</option>
                      </select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={m.duration_days}
                          onChange={(e) => handleUpdateMedicineField(idx, 'duration_days', Number(e.target.value))}
                          min={1}
                          style={{ width: '50px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Diagnosis, Complaints & Advice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Provisional Diagnosis */}
          <Card style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>
              Diagnosis & Clinical Findings
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {diagnosisList.map((d, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  {d}{' '}
                  <button
                    type="button"
                    onClick={() => setDiagnosisList(diagnosisList.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="+ Add diagnosis (e.g. Acute Pharyngitis)"
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && diagnosisInput.trim()) {
                  e.preventDefault();
                  setDiagnosisList([...diagnosisList, diagnosisInput.trim()]);
                  setDiagnosisInput('');
                }
              }}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.8rem' }}
            />
          </Card>

          {/* General Advice & Follow-up */}
          <Card style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>
              Patient Advice & Dietary Instructions
            </h4>
            <textarea
              rows={3}
              value={generalAdvice}
              onChange={(e) => setGeneralAdvice(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.8rem' }}
            />

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                Follow-up Consultation After:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[3, 5, 7, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFollowUpDays(d)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '4px',
                      border: followUpDays === d ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: followUpDays === d ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-input)',
                      color: followUpDays === d ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    +{d} Days
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Issue Rx Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            icon={Printer}
            onClick={handleIssuePrescription}
            style={{ padding: '14px', fontSize: '1rem', fontWeight: '800' }}
          >
            Issue & Generate Printable Rx (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
};
