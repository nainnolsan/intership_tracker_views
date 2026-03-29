import { useState, useEffect } from 'react';

const PRESET_COLORS = [
  '#d84a1b', '#ff2714', '#d92671', '#8e44ad', '#6451a8', '#3d4ca4',
  '#2069a6', '#229fd7', '#0f95a0', '#0f8b83', '#15a814', '#8d9a0d',
  '#d97e00', '#f25f0b', '#e85d8e', '#626e7b',
];

interface AddStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, insertAfterId: string | null) => void;
  stageLayout: { id: string; label: string }[];
}

export default function AddStageModal({ isOpen, onClose, onSave, stageLayout }: AddStageModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[4]);
  // Default to selecting the last element in the stage array if any
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setName('');
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setColor(PRESET_COLORS[4]);
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setInsertAfterId(stageLayout.length > 0 ? stageLayout[stageLayout.length - 1].id : null);
    }
  }, [isOpen, stageLayout]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a stage name.");
      return;
    }
    onSave(name.trim(), color, insertAfterId);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1000 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: '450px', padding: '1.8rem', paddingBottom: '2.5rem' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>Create New Stage</h2>
        
        <div style={{ display: 'grid', gap: '1.4rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Stage Name</label>
            <input 
              autoFocus 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Phone Screen" 
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
              onKeyDown={(e) => {
                 if (e.key === 'Enter') handleSave();
                 if (e.key === 'Escape') onClose();
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Color Label</label>
            <div className="color-preset-row" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.6rem', marginBottom: '0.5rem' }}>
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={`color-swatch ${color === preset ? 'active' : ''}`}
                  style={{ backgroundColor: preset, borderRadius: '6px', border: color === preset ? '2px solid var(--ink)' : '2px solid transparent' }}
                  onClick={() => setColor(preset)}
                />
              ))}
              <label 
                 className={`color-swatch custom-color-swatch ${!PRESET_COLORS.includes(color) ? 'active' : ''}`}
                 style={{ backgroundColor: color, borderRadius: '6px', border: !PRESET_COLORS.includes(color) ? '2px solid var(--ink)' : '2px solid transparent' }}
              >
                 <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </label>
            </div>
            <p className="color-picker-label" style={{ marginTop: '0.4rem' }}>Click the (+) icon for a custom color picker.</p>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>Hierarchy Position</label>
            <select 
               value={insertAfterId || 'start'} 
               onChange={e => setInsertAfterId(e.target.value === 'start' ? null : e.target.value)}
               style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <option value="start">Insert at the very beginning</option>
              {stageLayout.map(stage => (
                <option key={stage.id} value={stage.id}>
                  Insert after {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '2.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button type="button" className="btn" onClick={handleSave} style={{ padding: '0.5rem 1.2rem' }}>Create Stage</button>
        </div>
      </div>
    </div>
  );
}
