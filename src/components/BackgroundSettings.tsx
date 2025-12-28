import React from 'react';
import { X } from 'lucide-react';
import { deleteImage, isSupabaseStorageUrl } from '../lib/storageUtils';

type BackgroundType = 'color' | 'gradient' | 'image';
type GradientType = 'linear' | 'radial';
type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';

type BackgroundSettingsProps = {
  backgroundType: BackgroundType;
  backgroundColor?: string;
  gradientType?: GradientType;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: GradientDirection;
  backgroundImage?: string;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  onBackgroundColorChange: (color: string) => void;
  onGradientTypeChange: (type: GradientType) => void;
  onGradientStartChange: (color: string) => void;
  onGradientEndChange: (color: string) => void;
  onGradientDirectionChange: (direction: GradientDirection) => void;
  onBackgroundImageChange: (image: string | undefined) => void;
};

export function BackgroundSettings({
  backgroundType,
  backgroundColor,
  gradientType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  backgroundImage,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onGradientTypeChange,
  onGradientStartChange,
  onGradientEndChange,
  onGradientDirectionChange,
  onBackgroundImageChange,
}: BackgroundSettingsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-900">Background Settings</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => onBackgroundTypeChange('color')}
            className={`px-4 py-2 rounded-lg border ${
              backgroundType === 'color'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => onBackgroundTypeChange('gradient')}
            className={`px-4 py-2 rounded-lg border ${
              backgroundType === 'gradient'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Gradient
          </button>
          <button
            onClick={() => onBackgroundTypeChange('image')}
            className={`px-4 py-2 rounded-lg border ${
              backgroundType === 'image'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Image
          </button>
        </div>
      </div>

      {backgroundType === 'color' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <input
            type="color"
            value={backgroundColor || '#FFFFFF'}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
      )}

      {backgroundType === 'gradient' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => onGradientTypeChange('linear')}
                className={`px-4 py-2 rounded-lg border ${
                  (gradientType || 'linear') === 'linear'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => onGradientTypeChange('radial')}
                className={`px-4 py-2 rounded-lg border ${
                  gradientType === 'radial'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Radial
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Color</label>
            <input
              type="color"
              value={gradientStart || '#667eea'}
              onChange={(e) => onGradientStartChange(e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Color</label>
            <input
              type="color"
              value={gradientEnd || '#764ba2'}
              onChange={(e) => onGradientEndChange(e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
          {gradientType !== 'radial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onGradientDirectionChange('horizontal')}
                  className={`px-3 py-2 rounded-lg border ${
                    gradientDirection === 'horizontal'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => onGradientDirectionChange('vertical')}
                  className={`px-3 py-2 rounded-lg border ${
                    gradientDirection === 'vertical'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Vertical
                </button>
                <button
                  onClick={() => onGradientDirectionChange('diagonal')}
                  className={`px-3 py-2 rounded-lg border ${
                    gradientDirection === 'diagonal'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Diagonal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {backgroundType === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onBackgroundImageChange(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {backgroundImage && (
              <div className="relative w-full h-32 rounded border border-gray-300 overflow-hidden">
                <img
                  src={backgroundImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this image? This action cannot be undone.')) return;
                    if (backgroundImage && isSupabaseStorageUrl(backgroundImage)) {
                      await deleteImage(backgroundImage);
                    }
                    onBackgroundImageChange(undefined);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove background image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
