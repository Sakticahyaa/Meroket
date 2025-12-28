import React, { useState } from 'react';
import { Upload, Plus, X, Image as ImageIcon } from 'lucide-react';
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  ProjectsSection,
  TestimonialsSection,
  ContactSection,
  SkillCard,
  ExperienceCard,
  ProjectItem,
  TestimonialCard,
  AnimationSettings as AnimationSettingsType,
} from '../lib/supabase';
import { uploadImage, deleteImage, isSupabaseStorageUrl } from '../lib/storageUtils';
import { ImageCropperModal } from './ImageCropperModal';
import { FontSelector } from './FontSelector';
import { AnimationSettings } from './AnimationSettings';
import { BackgroundSettings } from './BackgroundSettings';

// Hero Section Editor
export function HeroEditor({
  section,
  onChange,
}: {
  section: HeroSection;
  onChange: (section: HeroSection) => void;
}) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState<string>('');
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingProfile(true);
    try {
      const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file, 'hero-profiles');
      onChange({ ...section, profileImage: url });
      setCropperOpen(false);
      setTempProfileImage('');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image');
    } finally {
      setIsUploadingProfile(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...section, backgroundType: 'color' })}
            className={`px-4 py-2 rounded-lg border ${
              section.backgroundType === 'color'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => onChange({ ...section, backgroundType: 'gradient' })}
            className={`px-4 py-2 rounded-lg border ${
              section.backgroundType === 'gradient'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Gradient
          </button>
          <button
            onClick={() => onChange({ ...section, backgroundType: 'image' })}
            className={`px-4 py-2 rounded-lg border ${
              section.backgroundType === 'image'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Image
          </button>
        </div>
      </div>

      {section.backgroundType === 'color' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <input
            type="color"
            value={section.backgroundColor || '#FFFFFF'}
            onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
      )}

      {section.backgroundType === 'gradient' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ ...section, gradientType: 'linear' })}
                className={`px-4 py-2 rounded-lg border ${
                  (section.gradientType || 'linear') === 'linear'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => onChange({ ...section, gradientType: 'radial' })}
                className={`px-4 py-2 rounded-lg border ${
                  section.gradientType === 'radial'
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
              value={section.gradientStart || '#667eea'}
              onChange={(e) => onChange({ ...section, gradientStart: e.target.value })}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Color</label>
            <input
              type="color"
              value={section.gradientEnd || '#764ba2'}
              onChange={(e) => onChange({ ...section, gradientEnd: e.target.value })}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
          {section.gradientType !== 'radial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChange({ ...section, gradientDirection: 'horizontal' })}
                className={`px-3 py-2 rounded-lg border ${
                  section.gradientDirection === 'horizontal'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Horizontal
              </button>
              <button
                onClick={() => onChange({ ...section, gradientDirection: 'vertical' })}
                className={`px-3 py-2 rounded-lg border ${
                  section.gradientDirection === 'vertical'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Vertical
              </button>
              <button
                onClick={() => onChange({ ...section, gradientDirection: 'diagonal' })}
                className={`px-3 py-2 rounded-lg border ${
                  section.gradientDirection === 'diagonal'
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

      {section.backgroundType === 'image' && (
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
                    onChange({ ...section, backgroundImage: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {section.backgroundImage && (
              <div className="relative w-full h-32 rounded border border-gray-300 overflow-hidden">
                <img
                  src={section.backgroundImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this image? This action cannot be undone.')) return;
                    if (section.backgroundImage && isSupabaseStorageUrl(section.backgroundImage)) {
                      await deleteImage(section.backgroundImage);
                    }
                    onChange({ ...section, backgroundImage: undefined });
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

      {/* Profile Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image (Optional)
        </label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageSelect}
            disabled={isUploadingProfile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {section.profileImage && (
            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden mx-auto">
              <img
                src={section.profileImage}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={async () => {
                  if (!window.confirm('Delete this image? This action cannot be undone.')) return;
                  if (section.profileImage && isSupabaseStorageUrl(section.profileImage)) {
                    await deleteImage(section.profileImage);
                  }
                  onChange({ ...section, profileImage: undefined });
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="Remove profile image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">
            Centered circular overlay on hero background
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
        <input
          type="text"
          value={section.subtitle}
          onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle Color</label>
        <input
          type="color"
          value={section.subtitleColor}
          onChange={(e) => onChange({ ...section, subtitleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      {/* Font Selectors */}
      <FontSelector
        value={section.titleFont || 'Inter'}
        onChange={(titleFont) => onChange({ ...section, titleFont })}
        label="Title Font"
      />

      <FontSelector
        value={section.subtitleFont || 'Inter'}
        onChange={(subtitleFont) => onChange({ ...section, subtitleFont })}
        label="Subtitle Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageUrl={tempProfileImage}
          onCropComplete={handleProfileCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setTempProfileImage('');
          }}
          defaultAspect={1}
          title="Crop Profile Image"
        />
      )}
    </div>
  );
}

// About Section Editor
export function AboutEditor({
  section,
  onChange,
}: {
  section: AboutSection;
  onChange: (section: AboutSection) => void;
}) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploadingImage(true);
      const file = new File([croppedBlob], 'about-profile.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file, 'about-profiles');
      onChange({ ...section, image: url });
      setCropperOpen(false);
      setTempImage('');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={section.description}
          onChange={(e) => onChange({ ...section, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description Color</label>
        <input
          type="color"
          value={section.descriptionColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, descriptionColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image {isUploadingImage && '(Uploading...)'}
        </label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={isUploadingImage}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {section.image && (
            <div className="relative w-32 h-32 mx-auto rounded border border-gray-300 overflow-hidden">
              <img
                src={section.image}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={async () => {
                  if (!window.confirm('Delete this image? This action cannot be undone.')) return;
                  if (section.image && isSupabaseStorageUrl(section.image)) {
                    await deleteImage(section.image);
                  }
                  onChange({ ...section, image: undefined });
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Shape</label>
        <div className="grid grid-cols-3 gap-2">
          {['circle', 'square', 'rounded', 'hexagon', 'triangle'].map((shape) => (
            <button
              key={shape}
              onClick={() =>
                onChange({
                  ...section,
                  imageShape: shape as 'circle' | 'square' | 'rounded' | 'hexagon' | 'triangle',
                })
              }
              className={`px-3 py-2 rounded-lg border capitalize ${
                section.imageShape === shape
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Size</label>
        <div className="grid grid-cols-3 gap-2">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() =>
                onChange({
                  ...section,
                  imageSize: size as 'small' | 'medium' | 'large',
                })
              }
              className={`px-3 py-2 rounded-lg border capitalize ${
                (section.imageSize || 'medium') === size
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="imageBorder"
          checked={section.imageBorder}
          onChange={(e) => onChange({ ...section, imageBorder: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="imageBorder" className="text-sm font-medium text-gray-700">
          Add Border
        </label>
      </div>

      {section.imageBorder && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
          <input
            type="color"
            value={section.borderColor || '#000000'}
            onChange={(e) => onChange({ ...section, borderColor: e.target.value })}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={section.backgroundColor || '#FFFFFF'}
          onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd })}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageUrl={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setTempImage('');
          }}
          title="Crop Profile Image"
        />
      )}
    </div>
  );
}

// Skills Section Editor
export function SkillsEditor({
  section,
  onChange,
}: {
  section: SkillsSection;
  onChange: (section: SkillsSection) => void;
}) {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempIconImage, setTempIconImage] = useState<string>('');
  const [iconCardId, setIconCardId] = useState<string>('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const addCard = () => {
    const newCard: SkillCard = {
      id: Date.now().toString(),
      title: 'New Skill',
      description: 'Description',
      iconType: 'lucide',
    };
    onChange({ ...section, cards: [...(section.cards || []), newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<SkillCard>) => {
    onChange({
      ...section,
      cards: (section.cards || []).map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: (section.cards || []).filter((card) => card.id !== id) });
  };

  const handleIconSelect = (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempIconImage(reader.result as string);
        setIconCardId(cardId);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingIcon(true);
    try {
      const file = new File([croppedBlob], 'skill-icon.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file, 'skill-icons');
      updateCard(iconCardId, { icon: url });
      setCropperOpen(false);
      setTempIconImage('');
      setIconCardId('');
    } catch (error) {
      console.error('Error uploading skill icon:', error);
      alert('Failed to upload icon');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Title Color</label>
        <input
          type="color"
          value={section.cardTitleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, cardTitleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Description Color</label>
        <input
          type="color"
          value={section.cardDescriptionColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, cardDescriptionColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Skills/Services</label>
          <button
            onClick={addCard}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {(section.cards || []).map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-3">
              {editingCard === card.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(card.id, { title: e.target.value })}
                    placeholder="Title"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <textarea
                    value={card.description}
                    onChange={(e) => updateCard(card.id, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Icon/Image (1:1 ratio)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconSelect(card.id, e)}
                      disabled={isUploadingIcon}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {card.icon && (
                      <div className="mt-2 w-12 h-12 rounded border border-gray-300 overflow-hidden bg-white relative">
                        <img src={card.icon} alt="Icon preview" className="w-full h-full object-contain" />
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this icon? This action cannot be undone.')) return;
                            if (card.icon && isSupabaseStorageUrl(card.icon)) {
                              await deleteImage(card.icon);
                            }
                            updateCard(card.id, { icon: undefined });
                          }}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove icon"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    )}
                    {isUploadingIcon && iconCardId === card.id && (
                      <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Card Background Color</label>
                    <input
                      type="color"
                      value={card.backgroundColor || '#FFFFFF'}
                      onChange={(e) => updateCard(card.id, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Background Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateCard(card.id, { backgroundStyle: 'solid' })}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          (card.backgroundStyle || 'solid') === 'solid'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCard(card.id, { backgroundStyle: 'blur' })}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          card.backgroundStyle === 'blur'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Blur
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingCard(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{card.title}</p>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCard(card.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd })}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageUrl={tempIconImage}
          onCropComplete={handleIconCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setTempIconImage('');
            setIconCardId('');
          }}
          defaultAspect={1}
          title="Crop Skill Icon (1:1)"
        />
      )}
    </div>
  );
}

// Experience Section Editor (renamed from Projects)
export function ExperienceEditor({
  section,
  onChange,
  currentProjectCount = 0,
  maxProjects = 100,
}: {
  section: ExperienceSection;
  onChange: (section: ExperienceSection) => void;
  currentProjectCount?: number;
  maxProjects?: number;
}) {
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const addCard = () => {
    // Check project limit
    if (currentProjectCount >= maxProjects) {
      alert(`You've reached your experience card limit (${maxProjects}). Please upgrade your plan to add more.`);
      return;
    }

    const newCard: ExperienceCard = {
      id: Date.now().toString(),
      title: 'New Experience',
      shortDescription: 'Short description',
      fullDescription: 'Full description of the experience...',
      tags: [],
    };
    onChange({ ...section, cards: [...(section.cards || []), newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<ExperienceCard>) => {
    onChange({
      ...section,
      cards: (section.cards || []).map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: (section.cards || []).filter((card) => card.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="My Experience / Work History"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Title Color</label>
        <input
          type="color"
          value={section.cardTitleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, cardTitleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Description Color</label>
        <input
          type="color"
          value={section.cardDescriptionColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, cardDescriptionColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={section.backgroundColor || '#FFFFFF'}
          onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Experience Items</label>
          <button
            onClick={addCard}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {(section.cards || []).map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-3">
              {editingCard === card.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(card.id, { title: e.target.value })}
                    placeholder="Project Title"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <textarea
                    value={card.shortDescription}
                    onChange={(e) => updateCard(card.id, { shortDescription: e.target.value })}
                    placeholder="Short description"
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <textarea
                    value={card.fullDescription}
                    onChange={(e) => updateCard(card.id, { fullDescription: e.target.value })}
                    placeholder="Full description"
                    rows={4}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Project Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateCard(card.id, { image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {card.image && (
                      <div className="mt-2 w-full h-24 rounded border border-gray-300 overflow-hidden">
                        <img src={card.image} alt="Project preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingCard(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{card.title}</p>
                    <p className="text-xs text-gray-500">{card.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCard(card.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd })}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />
    </div>
  );
}

// Projects Section Editor (New - Referred Design)
export function ProjectsEditor({
  section,
  onChange,
}: {
  section: ProjectsSection;
  onChange: (section: ProjectsSection) => void;
}) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const addItem = () => {
    const newItem: ProjectItem = {
      id: Date.now().toString(),
      title: 'Senior UX Design Lead',
      description: 'Led the design team to enhance the end-to-end platform, driving adoption and flexibility while strengthening competitive edge through improved user experiences.',
      skills: ['LEAD DESIGNER', 'DESIGN STRATEGY', 'EXPERIENCE VISION', 'STAKEHOLDER MANAGEMENT'],
      learnMoreURL: '',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
      imagePosition: 'top',
    };
    onChange({ ...section, items: [...(section.items || []), newItem] });
    setEditingItem(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<ProjectItem>) => {
    onChange({
      ...section,
      items: (section.items || []).map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  };

  const deleteItem = (id: string) => {
    onChange({ ...section, items: (section.items || []).filter((item) => item.id !== id) });
  };

  const updateSkills = (id: string, skillsString: string) => {
    const skills = skillsString.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    updateItem(id, { skills });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Featured Projects"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Item Title Color</label>
        <input
          type="color"
          value={section.itemTitleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, itemTitleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Item Description Color</label>
        <input
          type="color"
          value={section.itemDescriptionColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, itemDescriptionColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={section.backgroundColor || '#FFFFFF'}
          onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Projects (One per row)</label>
          <button
            onClick={addItem}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        <div className="space-y-3">
          {(section.items || []).map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {editingItem === item.id ? (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateItem(item.id, { image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {item.image && (
                      <div className="mt-2 w-full h-32 rounded border border-gray-300 overflow-hidden">
                        <img src={item.image} alt="Project preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Image Position */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Image Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { imagePosition: 'top' })}
                        className={`px-3 py-2 text-xs rounded-lg border ${
                          (item.imagePosition || 'top') === 'top'
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Top (Large)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { imagePosition: 'left' })}
                        className={`px-3 py-2 text-xs rounded-lg border ${
                          item.imagePosition === 'left'
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Left (Small)
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder="Role/Position Title"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-medium"
                  />

                  {/* Description */}
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Description of work..."
                    rows={4}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />

                  {/* Skills */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Skills (comma-separated, will be UPPERCASE)
                    </label>
                    <input
                      type="text"
                      value={item.skills.join(', ')}
                      onChange={(e) => updateSkills(item.id, e.target.value)}
                      placeholder="LEADERSHIP, DESIGN STRATEGY, UX"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(item.skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Learn More URL */}
                  <input
                    type="url"
                    value={item.learnMoreURL || ''}
                    onChange={(e) => updateItem(item.id, { learnMoreURL: e.target.value })}
                    placeholder="https://example.com (optional)"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Card Background Color</label>
                    <input
                      type="color"
                      value={item.backgroundColor || '#FFFFFF'}
                      onChange={(e) => updateItem(item.id, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Background Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { backgroundStyle: 'solid' })}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          (item.backgroundStyle || 'solid') === 'solid'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { backgroundStyle: 'blur' })}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          item.backgroundStyle === 'blur'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Blur
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.logo && (
                        <img src={item.logo} alt="Logo" className="w-8 h-8 object-contain" />
                      )}
                      <p className="font-semibold text-sm">{item.title}</p>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{item.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1">
                      {(item.skills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {(item.skills || []).length > 3 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">+{(item.skills || []).length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd })}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />
    </div>
  );
}

// Testimonials Section Editor
export function TestimonialsEditor({
  section,
  onChange,
}: {
  section: TestimonialsSection;
  onChange: (section: TestimonialsSection) => void;
}) {
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const addCard = () => {
    const newCard: TestimonialCard = {
      id: Date.now().toString(),
      text: 'Great experience working together!',
      author: 'Client Name',
      role: 'CEO, Company',
    };
    onChange({ ...section, cards: [...(section.cards || []), newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<TestimonialCard>) => {
    onChange({
      ...section,
      cards: (section.cards || []).map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: (section.cards || []).filter((card) => card.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Text Color</label>
        <input
          type="color"
          value={section.cardTextColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, cardTextColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Author Color</label>
        <input
          type="color"
          value={section.cardAuthorColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, cardAuthorColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={section.backgroundColor || '#F8FAFC'}
          onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Testimonials</label>
          <button
            onClick={addCard}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {(section.cards || []).map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-3">
              {editingCard === card.id ? (
                <div className="space-y-2">
                  <textarea
                    value={card.text}
                    onChange={(e) => updateCard(card.id, { text: e.target.value })}
                    placeholder="Testimonial text"
                    rows={3}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={card.author}
                    onChange={(e) => updateCard(card.id, { author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={card.role || ''}
                    onChange={(e) => updateCard(card.id, { role: e.target.value })}
                    placeholder="Role/Company (optional)"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => setEditingCard(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm italic">&quot;{card.text}&quot;</p>
                    <p className="text-xs text-gray-500 mt-1">
                      - {card.author}
                      {card.role && `, ${card.role}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCard(card.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd })}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />
    </div>
  );
}

// Contact Section Editor
export function ContactEditor({
  section,
  onChange,
}: {
  section: ContactSection;
  onChange: (section: ContactSection) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
        <input
          type="color"
          value={section.titleColor || '#1F2937'}
          onChange={(e) => onChange({ ...section, titleColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title Alignment</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'center' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              (section.titleAlignment || 'center') === 'center'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...section, titleAlignment: 'left' })}
            className={`px-3 py-2 text-sm rounded-lg border ${
              section.titleAlignment === 'left'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Left
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description Color</label>
        <input
          type="color"
          value={section.descriptionColor || '#6B7280'}
          onChange={(e) => onChange({ ...section, descriptionColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <input
          type="color"
          value={section.backgroundColor || '#FFFFFF'}
          onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...section, method: 'email' })}
            className={`px-4 py-2 rounded-lg border ${
              section.method === 'email'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => onChange({ ...section, method: 'whatsapp' })}
            className={`px-4 py-2 rounded-lg border ${
              section.method === 'whatsapp'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            WhatsApp
          </button>
        </div>
      </div>

      {section.method === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
          <input
            type="email"
            value={section.email || ''}
            onChange={(e) => onChange({ ...section, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {section.method === 'whatsapp' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
          <input
            type="tel"
            value={section.whatsappNumber || ''}
            onChange={(e) => onChange({ ...section, whatsappNumber: e.target.value })}
            placeholder="628123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 628123456789 (without + or spaces)</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showForm"
          checked={section.showForm}
          onChange={(e) => onChange({ ...section, showForm: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="showForm" className="text-sm font-medium text-gray-700">
          Show contact form
        </label>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={section.font || 'Inter'}
        onChange={(font) => onChange({ ...section, font: font })}
        label="Section Font"
      />

      {/* Animation Settings */}
      <AnimationSettings
        value={section.animation || 'none'}
        onChange={(animation) => onChange({ ...section, animation })}
      />

      {/* Background Settings */}
      <BackgroundSettings
        backgroundType={section.backgroundType || 'color'}
        backgroundColor={section.backgroundColor}
        gradientType={section.gradientType}
        gradientStart={section.gradientStart}
        gradientEnd={section.gradientEnd}
        gradientDirection={section.gradientDirection}
        backgroundImage={section.backgroundImage}
        onBackgroundTypeChange={(backgroundType) => onChange({ ...section, backgroundType })}
        onBackgroundColorChange={(backgroundColor) => onChange({ ...section, backgroundColor })}
        onGradientTypeChange={(gradientType) => onChange({ ...section, gradientType })}
        onGradientStartChange={(gradientStart) => onChange({ ...section, gradientStart })}
        onGradientEndChange={(gradientEnd) => onChange({ ...section, gradientEnd})}
        onGradientDirectionChange={(gradientDirection) => onChange({ ...section, gradientDirection })}
        onBackgroundImageChange={(backgroundImage) => onChange({ ...section, backgroundImage })}
      />
    </div>
  );
}
