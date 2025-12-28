import React from 'react';
import { Type } from 'lucide-react';

// Top 10 Google Fonts for professional portfolios
export const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter', weights: '100,200,300,400,500,600,700,800,900' },
  { value: 'Roboto', label: 'Roboto', weights: '100,300,400,500,700,900' },
  { value: 'Poppins', label: 'Poppins', weights: '100,200,300,400,500,600,700,800,900' },
  { value: 'Montserrat', label: 'Montserrat', weights: '100,200,300,400,500,600,700,800,900' },
  { value: 'Open Sans', label: 'Open Sans', weights: '300,400,500,600,700,800' },
  { value: 'Lato', label: 'Lato', weights: '100,300,400,700,900' },
  { value: 'Raleway', label: 'Raleway', weights: '100,200,300,400,500,600,700,800,900' },
  { value: 'Playfair Display', label: 'Playfair Display', weights: '400,500,600,700,800,900' },
  { value: 'Merriweather', label: 'Merriweather', weights: '300,400,700,900' },
  { value: 'Nunito', label: 'Nunito', weights: '200,300,400,500,600,700,800,900' },
];

type FontSelectorProps = {
  value?: string;
  onChange: (font: string) => void;
  label?: string;
  showApplyOptions?: boolean;
  onApplyToSection?: () => void;
  onApplyGlobally?: () => void;
};

export function FontSelector({
  value = 'Inter',
  onChange,
  label = 'Font Family',
  showApplyOptions = false,
  onApplyToSection,
  onApplyGlobally,
}: FontSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = e.target.value;
    onChange(newFont);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Type className="inline w-4 h-4 mr-1" />
          {label}
        </label>
        {showApplyOptions && (
          <div className="flex gap-1">
            {onApplyToSection && (
              <button
                onClick={onApplyToSection}
                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Apply to all text in this section"
              >
                Apply to Section
              </button>
            )}
            {onApplyGlobally && (
              <button
                onClick={onApplyGlobally}
                className="text-xs px-2 py-1 text-purple-600 hover:bg-purple-50 rounded"
                title="Apply to all text globally"
              >
                Apply Globally
              </button>
            )}
          </div>
        )}
      </div>

      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        style={{ fontFamily: value }}
      >
        {AVAILABLE_FONTS.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div
        className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
        style={{ fontFamily: value }}
      >
        <p className="mb-1 font-normal">The quick brown fox jumps over the lazy dog</p>
        <p className="font-bold">The quick brown fox jumps over the lazy dog</p>
      </div>
    </div>
  );
}

// Helper function to load Google Fonts dynamically
// Note: Fonts are now preloaded in index.html, so this is a fallback
export function loadGoogleFont(fontFamily: string) {
  const font = AVAILABLE_FONTS.find((f) => f.value === fontFamily);
  if (!font) return;

  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;

  // Check if already loaded
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${font.weights}&display=swap`;
  document.head.appendChild(link);
}

// Load all fonts on app initialization
// Note: Fonts are now preloaded in index.html, so this is a fallback
export function loadAllFonts() {
  AVAILABLE_FONTS.forEach((font) => {
    loadGoogleFont(font.value);
  });
}
