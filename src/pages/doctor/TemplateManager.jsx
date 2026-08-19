import React, { useState, useEffect } from 'react';
import { templateApi } from '../../api/templateApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { BookmarkPlus, Plus, Trash2, Edit2, CheckCircle2, Sparkles, Stethoscope } from 'lucide-react';

export const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    specialization: 'General Medicine',
    chief_complaints: [],
    diagnosis: [],
    medicines: [],
    investigations: [],
    advice: '',
  });

  const [complaintInput, setComplaintInput] = useState('');
  const [diagInput, setDiagInput] = useState('');
  const [medInput, setMedInput] = useState({
    name: '',
    dosage_form: 'Tablet',
    dose: '1 Tab',
    frequency: '1-0-1',
    timing: 'After Food',
    duration_days: 5,
    instructions: '',
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateApi.getTemplates();
      setTemplates(res.data?.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddMedicine = () => {
    if (!medInput.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { ...medInput }],
    }));
    setMedInput({
      name: '',
      dosage_form: 'Tablet',
      dose: '1 Tab',
      frequency: '1-0-1',
      timing: 'After Food',
      duration_days: 5,
      instructions: '',
    });
  };

  const handleRemoveMedicine = (idx) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      if (editingId) {
        await templateApi.updateTemplate(editingId, formData);
        setSuccess('Template updated successfully!');
      } else {
        await templateApi.createTemplate(formData);
        setSuccess('New Rx template saved!');
      }
      setIsCreating(false);
      setEditingId(null);
      setFormData({
        title: '',
        specialization: 'General Medicine',
        chief_complaints: [],
        diagnosis: [],
        medicines: [],
        investigations: [],
        advice: '',
      });
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to save template.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await templateApi.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      setSuccess('Template deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete template.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookmarkPlus size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                Custom Prescription (Rx) Templates
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Save pre-configured drug sets for 1-click 30-second prescription writing.
              </p>
            </div>
          </div>

          {!isCreating && (
            <Button variant="primary" icon={Plus} onClick={() => setIsCreating(true)}>
              New Template
            </Button>
          )}
        </div>

        <Alert type="success" message={success} onClose={() => setSuccess('')} />
        <Alert type="error" message={error} onClose={() => setError('')} />

        {isCreating ? (
          <form onSubmit={handleSaveTemplate} style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
              {editingId ? 'Edit Rx Template' : 'Create New Rx Template'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input
                label="Template Title"
                placeholder="e.g. Pediatric Viral Fever Kit"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Specialization / Category"
                placeholder="Pediatrics"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            {/* Added Medicines in Template */}
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>
                Medicines in this Protocol ({formData.medicines.length})
              </h4>

              {formData.medicines.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>{m.name}</strong> ({m.dosage_form}) — <span>{m.dose}</span> •{' '}
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{m.frequency}</span> •{' '}
                    <span>{m.timing}</span> ({m.duration_days} Days)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Add Drug Sub-form */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '8px', marginTop: '10px', alignItems: 'flex-end' }}>
                <Input
                  label="Medicine Name"
                  placeholder="e.g. Calpol 250 Syrup"
                  value={medInput.name}
                  onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Form</label>
                  <select
                    value={medInput.dosage_form}
                    onChange={(e) => setMedInput({ ...medInput, dosage_form: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Tablet">Tab</option>
                    <option value="Syrup">Syp</option>
                    <option value="Capsule">Cap</option>
                    <option value="Drops">Drops</option>
                    <option value="Injection">Inj</option>
                    <option value="Sachet">Sachet</option>
                  </select>
                </div>
                <Input
                  label="Frequency"
                  placeholder="1-0-1"
                  value={medInput.frequency}
                  onChange={(e) => setMedInput({ ...medInput, frequency: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Timing</label>
                  <select
                    value={medInput.timing}
                    onChange={(e) => setMedInput({ ...medInput, timing: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                    <option value="At Bedtime">Bedtime</option>
                    <option value="As Needed (SOS)">SOS</option>
                  </select>
                </div>
                <Input
                  label="Days"
                  type="number"
                  value={medInput.duration_days}
                  onChange={(e) => setMedInput({ ...medInput, duration_days: Number(e.target.value) })}
                  min={1}
                />
                <Button type="button" variant="secondary" onClick={handleAddMedicine} style={{ marginBottom: '2px' }}>
                  + Add
                </Button>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Default Advice & Diet Notes
              </label>
              <textarea
                rows={2}
                value={formData.advice}
                onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={CheckCircle2}>
                Save Template
              </Button>
            </div>
          </form>
        ) : null}

        {/* Existing Templates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {templates.map((tpl) => (
            <Card key={tpl._id} style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: '700', textTransform: 'uppercase' }}>
                    {tpl.specialization}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '2px 0 6px' }}>
                    {tpl.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(tpl._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ margin: '8px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Medicines ({tpl.medicines?.length || 0}):</strong>
                <ul style={{ paddingLeft: '18px', margin: '4px 0' }}>
                  {tpl.medicines?.slice(0, 3).map((m, idx) => (
                    <li key={idx}>
                      {m.name} — <span style={{ color: 'var(--primary)' }}>{m.frequency}</span> ({m.duration_days}d)
                    </li>
                  ))}
                  {tpl.medicines?.length > 3 && <li>+{tpl.medicines.length - 3} more...</li>}
                </ul>
              </div>

              {tpl.advice && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-input)', padding: '6px 10px', borderRadius: '4px', margin: '8px 0 0' }}>
                  💡 {tpl.advice}
                </p>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
