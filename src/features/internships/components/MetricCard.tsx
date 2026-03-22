import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  color: string;
  onColorChange?: (value: string) => void;
  onRename?: (newLabel: string) => void;
  onDelete?: () => void;
  transparent?: boolean;
}

const PRESET_COLORS = [
  '#d84a1b',
  '#ff2714',
  '#d92671',
  '#8e44ad',
  '#6451a8',
  '#3d4ca4',
  '#2069a6',
  '#229fd7',
  '#0f95a0',
  '#0f8b83',
  '#15a814',
  '#8d9a0d',
  '#d97e00',
  '#f25f0b',
  '#e85d8e',
  '#626e7b',
];

const getTextColor = (hex: string): string => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return '#ffffff';
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 160 ? '#111111' : '#ffffff';
};

export default function MetricCard({ label, value, color, onColorChange, onRename, onDelete, transparent = false }: MetricCardProps) {
  const normalizedColor = color.toLowerCase();
  const isPresetColor = PRESET_COLORS.includes(normalizedColor);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(label);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const textColor = useMemo(() => getTextColor(color), [color]);
  const cardStyle = useMemo(
    () => ({ '--metric-solid-bg': color, '--metric-solid-ink': textColor } as CSSProperties),
    [color, textColor],
  );

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const root = detailsRef.current;
      if (!root) {
        return;
      }

      if (!root.contains(event.target as Node)) {
        root.removeAttribute('open');
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      const root = detailsRef.current;
      if (!root) {
        return;
      }

      root.removeAttribute('open');
      setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <article className={`metric-card ${transparent ? 'metric-card-transparent' : 'metric-card-solid'}`} style={cardStyle}>
      {onColorChange ? (
        <details
          ref={detailsRef}
          className="metric-color-menu"
          onToggle={(event) => setMenuOpen((event.currentTarget as HTMLDetailsElement).open)}
        >
          <summary className="metric-color-trigger" aria-label={`Customize ${label} color`}>
            ...
          </summary>
          <div className="metric-color-popover">
            <div className="metric-popover-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {isRenaming && onRename ? (
                <input
                  autoFocus
                  className="inline-edit-input"
                  style={{ fontSize: '0.9rem', padding: '2px 4px', width: '140px' }}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    if (renameValue.trim() && renameValue.trim() !== label) {
                         onRename(renameValue.trim());
                    } else {
                         setRenameValue(label);
                    }
                    setIsRenaming(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (renameValue.trim() && renameValue.trim() !== label) onRename(renameValue.trim());
                      else setRenameValue(label);
                      setIsRenaming(false);
                    }
                    if (e.key === 'Escape') {
                         setRenameValue(label);
                         setIsRenaming(false);
                    }
                  }}
                />
              ) : (
                <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
              )}
              {onRename && !isRenaming && (
                <button type="button" className="edit-icon-btn" style={{ opacity: 1 }} onClick={() => setIsRenaming(true)}>
                  ✎
                </button>
              )}
            </div>
            
            {!!onColorChange && (
            <div className="color-preset-row">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`color-swatch ${normalizedColor === preset ? 'active' : ''}`}
                  style={{ backgroundColor: preset }}
                  onClick={() => onColorChange(preset)}
                  aria-label={`Select color ${preset}`}
                />
              ))}

              <label
                className={`color-swatch custom-color-swatch ${!isPresetColor ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select custom color for ${label}`}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(event) => onColorChange(event.target.value)}
                />
              </label>
            </div>
            )}
            {!!onColorChange && <p className="color-picker-label">Custom color</p>}
            
            {onDelete && (
              <button 
                type="button" 
                className="danger-btn" 
                style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '6px', cursor: 'pointer', marginTop: '4px' }}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                🗑️ Delete Stage
              </button>
            )}
          </div>
        </details>
      ) : null}
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
