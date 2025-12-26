import { useState } from 'react';
import { NewPortfolioData } from '../lib/supabase';
import { uploadImage } from '../lib/storageUtils';
import { ImageCropperModal } from './ImageCropperModal';
import { X } from 'lucide-react';

type NavbarEditorProps = {
  portfolioData: NewPortfolioData;
  onUpdate: (data: NewPortfolioData) => void;
  userFullName?: string;
};

export function NavbarEditor({ portfolioData, onUpdate, userFullName }: NavbarEditorProps) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempLogoImage, setTempLogoImage] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const updateNavbar = (updates: Partial<NewPortfolioData['navbar']>) => {
    onUpdate({
      ...portfolioData,
      navbar: {
        opacity: portfolioData.navbar?.opacity ?? 95,
        backgroundColor: portfolioData.navbar?.backgroundColor ?? '#FFFFFF',
        textColor: portfolioData.navbar?.textColor ?? '#1F2937',
        showBranding: portfolioData.navbar?.showBranding ?? false,
        brandingType: portfolioData.navbar?.brandingType ?? 'text',
        navbarStyle: portfolioData.navbar?.navbarStyle ?? 'style1',
        brandingText: portfolioData.navbar?.brandingText,
        brandingLogo: portfolioData.navbar?.brandingLogo,
        ...updates,
      },
    });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogoImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingLogo(true);
    try {
      const file = new File([croppedBlob], 'navbar-logo.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file, 'navbar-logos');
      updateNavbar({ brandingLogo: url });
      setCropperOpen(false);
      setTempLogoImage('');
    } catch (error) {
      console.error('Error uploading navbar logo:', error);
      alert('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navbar Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Customize the appearance of your portfolio navigation bar.
        </p>
      </div>

      {/* Navbar Style */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Navigation Style</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateNavbar({ navbarStyle: 'style1' })}
            className={`px-4 py-3 text-left rounded-lg border transition-colors ${
              (portfolioData.navbar?.navbarStyle || 'style1') === 'style1'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Style 1</div>
            <div className="text-xs opacity-75">Underline on hover</div>
          </button>
          <button
            onClick={() => updateNavbar({ navbarStyle: 'style2' })}
            className={`px-4 py-3 text-left rounded-lg border transition-colors ${
              portfolioData.navbar?.navbarStyle === 'style2'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Style 2</div>
            <div className="text-xs opacity-75">Bold hover, rounded active</div>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Choose how navigation links appear on hover and when active
        </p>
      </div>

      {/* Background Color */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Background Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={portfolioData.navbar?.backgroundColor ?? '#FFFFFF'}
            onChange={(e) => updateNavbar({ backgroundColor: e.target.value })}
            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={portfolioData.navbar?.backgroundColor ?? '#FFFFFF'}
              onChange={(e) => updateNavbar({ backgroundColor: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Choose the navbar background color. Combine with opacity for glassmorphism effects.
        </p>
      </div>

      {/* Background Opacity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Background Opacity</label>
          <span className="text-sm text-gray-600 font-medium">{portfolioData.navbar?.opacity ?? 95}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={portfolioData.navbar?.opacity ?? 95}
          onChange={(e) => updateNavbar({ opacity: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Transparent</span>
          <span>Opaque</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Controls the transparency of the background color above.
        </p>
      </div>

      {/* Text Color */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Text Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={portfolioData.navbar?.textColor ?? '#1F2937'}
            onChange={(e) => updateNavbar({ textColor: e.target.value })}
            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={portfolioData.navbar?.textColor ?? '#1F2937'}
              onChange={(e) => updateNavbar({ textColor: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono"
              placeholder="#1F2937"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Color for navigation links and text. Active links stay blue.
        </p>
      </div>

      {/* Show Branding */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioData.navbar?.showBranding || false}
            onChange={(e) =>
              updateNavbar({
                showBranding: e.target.checked,
                brandingType: e.target.checked ? (portfolioData.navbar?.brandingType || 'text') : 'text',
                brandingText: e.target.checked
                  ? portfolioData.navbar?.brandingText || userFullName || 'Portfolio'
                  : undefined,
              })
            }
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Show Branding</span>
            <p className="text-xs text-gray-500">Display name or logo on the left side of navbar</p>
          </div>
        </label>
      </div>

      {/* Branding Type */}
      {portfolioData.navbar?.showBranding && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Branding Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateNavbar({ brandingType: 'text' })}
              className={`px-4 py-3 text-left rounded-lg border transition-colors ${
                (portfolioData.navbar?.brandingType || 'text') === 'text'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">Text</div>
              <div className="text-xs opacity-75">Your name or brand text</div>
            </button>
            <button
              onClick={() => updateNavbar({ brandingType: 'logo' })}
              className={`px-4 py-3 text-left rounded-lg border transition-colors ${
                portfolioData.navbar?.brandingType === 'logo'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">Logo</div>
              <div className="text-xs opacity-75">Upload your logo image</div>
            </button>
          </div>
        </div>
      )}

      {/* Branding Text */}
      {portfolioData.navbar?.showBranding && portfolioData.navbar?.brandingType === 'text' && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Branding Text</label>
          <input
            type="text"
            value={portfolioData.navbar?.brandingText || ''}
            onChange={(e) => updateNavbar({ brandingText: e.target.value })}
            placeholder="Enter your name or brand..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">Text displayed on the left side of the navbar</p>
        </div>
      )}

      {/* Branding Logo */}
      {portfolioData.navbar?.showBranding && portfolioData.navbar?.brandingType === 'logo' && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Branding Logo</label>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              disabled={isUploadingLogo}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {portfolioData.navbar?.brandingLogo && (
              <div className="relative w-24 h-24 rounded border-2 border-gray-300 overflow-hidden bg-white p-2">
                <img
                  src={portfolioData.navbar.brandingLogo}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => updateNavbar({ brandingLogo: undefined })}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Upload your logo. Clickable to scroll to hero section.
            </p>
          </div>
        </div>
      )}

      {/* Preview Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> The navbar is visible at the top of the preview. Try different opacity
          values to create a glassmorphism effect!
        </p>
      </div>

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageUrl={tempLogoImage}
          onCropComplete={handleLogoCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setTempLogoImage('');
          }}
          defaultAspect={1}
          title="Crop Logo"
        />
      )}
    </div>
  );
}
