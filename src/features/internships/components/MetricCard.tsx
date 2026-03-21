import { useMemo } from 'react';
import type { CSSProperties } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  color: string;
  onColorChange?: (value: string) => void;
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

export default function MetricCard({ label, value, color, onColorChange }: MetricCardProps) {
  const normalizedColor = color.toLowerCase();
  const isPresetColor = PRESET_COLORS.includes(normalizedColor);
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
              <p className="color-picker-label">Custom color</p>
            </div>
          </>
        ) : null}
      </details>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
