import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AnimationSettings as AnimationSettingsType, AnimationType } from '../lib/supabase';

const ANIMATION_TYPES: { value: AnimationType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No animation' },
  { value: 'fade', label: 'Fade In', description: 'Fade in smoothly' },
  { value: 'slideUp', label: 'Slide Up', description: 'Slide up from bottom' },
  { value: 'slideDown', label: 'Slide Down', description: 'Slide down from top' },
  { value: 'slideLeft', label: 'Slide Left', description: 'Slide in from right' },
  { value: 'slideRight', label: 'Slide Right', description: 'Slide in from left' },
];

type AnimationSettingsProps = {
  settings?: AnimationSettingsType;
  onChange: (settings: AnimationSettingsType) => void;
  label?: string;
};

export function AnimationSettings({
  settings = {
    enabled: false,
    type: 'fade',
    duration: 600,
    delay: 0,
  },
  onChange,
  label = 'Scroll Animation',
}: AnimationSettingsProps) {
  const updateSettings = (updates: Partial<AnimationSettingsType>) => {
    onChange({ ...settings, ...updates });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          {label}
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => updateSettings({ enabled: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600">Enable</span>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pl-2 border-l-2 border-purple-200">
          {/* Animation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateSettings({ type: type.value })}
                  className={`px-3 py-2 text-left text-sm rounded-lg border transition-colors ${
                    settings.type === type.value
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                  title={type.description}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration: {settings.duration}ms
            </label>
            <input
              type="range"
              min={200}
              max={2000}
              step={100}
              value={settings.duration}
              onChange={(e) => updateSettings({ duration: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fast (200ms)</span>
              <span>Slow (2000ms)</span>
            </div>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay: {settings.delay}ms
            </label>
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              value={settings.delay}
              onChange={(e) => updateSettings({ delay: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>No delay</span>
              <span>1 second</span>
            </div>
          </div>

          {/* Preview Note */}
          <div className="text-xs text-gray-500 italic p-2 bg-white rounded">
            💡 Animation will trigger when section enters viewport
          </div>
        </div>
      )}
    </div>
  );
}
