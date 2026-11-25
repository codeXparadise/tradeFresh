import { Moon, Sun } from 'lucide-react';

interface ThemeSliderToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeSliderToggle({ theme, onToggle }: ThemeSliderToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-mode={theme}
      onClick={onToggle}
      className="tf-theme-slider"
      title={isDark ? 'Dark mode active' : 'Light mode active'}
    >
      <span
        aria-hidden="true"
        style={{
          marginLeft: '4px',
          display: 'inline-flex',
          color: isDark ? '#708475' : '#D97706',
          opacity: isDark ? 0.55 : 0,
          transition: 'opacity 200ms ease',
        }}
      >
        <Sun size={13} strokeWidth={2} />
      </span>
      <span
        aria-hidden="true"
        style={{
          marginRight: '4px',
          display: 'inline-flex',
          color: isDark ? '#82CC6C' : '#565B53',
          opacity: isDark ? 0 : 0.65,
          transition: 'opacity 200ms ease',
        }}
      >
        <Moon size={13} strokeWidth={2} />
      </span>
      <span className="tf-theme-thumb" aria-hidden="true">
        {isDark ? <Moon size={14} strokeWidth={2.2} /> : <Sun size={14} strokeWidth={2.2} />}
      </span>
    </button>
  );
}
