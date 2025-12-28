import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AnimationType } from '../lib/supabase';

const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade In' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
];

type AnimationSettingsProps = {
  value?: AnimationType;
  onChange: (type: AnimationType) => void;
  label?: string;
};

export function AnimationSettings({
  value = 'none',
  onChange,
  label = 'Scroll Animation',
}: AnimationSettingsProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Sparkles className="w-4 h-4 text-purple-600" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AnimationType)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
      >
        {ANIMATION_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
