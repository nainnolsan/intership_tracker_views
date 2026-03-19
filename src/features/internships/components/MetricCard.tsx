import { useMemo } from 'react';
import type { CSSProperties } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  color: string;
  onColorChange?: (value: string) => void;
}

const PRESET_COLORS = ['#1e3a8a', '#0f766e', '#6d28d9', '#166534', '#b45309', '#be123c'];

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

export default function MetricCard({ label, value, color, onColorChange }: MetricCardProps) {
  const textColor = useMemo(() => getTextColor(color), [color]);
  const cardStyle = useMemo(
    () => ({ '--metric-solid-bg': color, '--metric-solid-ink': textColor } as CSSProperties),
    [color, textColor],
  );

  return (
    <article className="metric-card metric-card-solid" style={cardStyle}>
      <details className="metric-color-menu">
        {onColorChange ? (
          <>
            <summary className="metric-color-trigger" aria-label={`Customize ${label} color`}>
              ...
            </summary>
            <div className="metric-color-popover">
              <p>{label}</p>
              <div className="color-preset-row">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`color-swatch ${color.toLowerCase() === preset ? 'active' : ''}`}
                    style={{ backgroundColor: preset }}
                    onClick={() => onColorChange(preset)}
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
              <label className="color-picker-label">
                Custom
                <input
                  type="color"
                  value={color}
                  onChange={(event) => onColorChange(event.target.value)}
                />
              </label>
            </div>
          </>
        ) : null}
      </details>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
