import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Palette } from 'lucide-react';

type ColorPalettePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const colorPalettes = [
  {
    name: 'Classic Dark',
    colors: ['#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666']
  },
  {
    name: 'Ocean Blue',
    colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b']
  },
  {
    name: 'Forest Green',
    colors: ['#022c22', '#064e3b', '#065f46', '#047857', '#059669']
  },
  {
    name: 'Warm Brown',
    colors: ['#451a03', '#7c2d12', '#9a3412', '#c2410c', '#ea580c']
  },
  {
    name: 'Royal Purple',
    colors: ['#2e1065', '#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6']
  },
  {
    name: 'Modern Gray',
    colors: ['#0f0f23', '#18181b', '#27272a', '#3f3f46', '#52525b']
  }
];

const backgroundPalettes = [
  {
    name: 'Clean White',
    value: '#ffffff'
  },
  {
    name: 'Soft Gray',
    value: '#f8fafc'
  },
  {
    name: 'Warm Cream',
    value: '#fefce8'
  },
  {
    name: 'Cool Blue',
    value: '#f0f9ff'
  },
  {
    name: 'Modern Dark',
    value: '#0f172a'
  },
  {
    name: 'Gradient Ocean',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'Gradient Sunset',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    name: 'Gradient Forest',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
];

export function ColorPalettePicker({ value, onChange, label }: ColorPalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');
  const containerRef = useRef<HTMLDivElement>(null);

  const isBackground = label.toLowerCase().includes('background');

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        <Palette className="w-4 h-4 inline mr-2" />
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded border border-slate-300"
              style={{
                background: value.startsWith('linear-gradient') ? value : value,
                backgroundColor: !value.startsWith('linear-gradient') ? value : undefined
              }}
            />
            <span className="text-sm text-slate-700">{value}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('palette')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'palette'
                      ? 'bg-red-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Palettes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'custom'
                      ? 'bg-red-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Custom
                </button>
              </div>

              {activeTab === 'palette' && (
                <div className="space-y-3">
                  {isBackground ? (
                    backgroundPalettes.map((palette, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorSelect(palette.value)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-slate-50"
                      >
                        <div
                          className="w-8 h-8 rounded border border-slate-300"
                          style={{
                            background: palette.value.startsWith('linear-gradient') ? palette.value : undefined,
                            backgroundColor: !palette.value.startsWith('linear-gradient') ? palette.value : undefined
                          }}
                        />
                        <span className="text-sm text-slate-700">{palette.name}</span>
                      </button>
                    ))
                  ) : (
                    colorPalettes.map((palette, idx) => (
                      <div key={idx} className="space-y-2">
                        <span className="text-xs font-medium text-slate-600">{palette.name}</span>
                        <div className="flex gap-2">
                          {palette.colors.map((color, colorIdx) => (
                            <button
                              key={colorIdx}
                              type="button"
                              onClick={() => handleColorSelect(color)}
                              className="w-8 h-8 rounded border border-slate-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-3">
                  <input
                    type="color"
                    value={value.startsWith('#') ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-10 rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={isBackground ? "#ffffff or linear-gradient(...)" : "#000000"}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                  {isBackground && (
                    <div className="text-xs text-slate-500">
                      You can use hex colors (#ffffff) or CSS gradients (linear-gradient(...))
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}