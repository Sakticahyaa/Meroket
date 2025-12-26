import { NewPortfolioData } from '../lib/supabase';

type NavbarEditorProps = {
  portfolioData: NewPortfolioData;
  onUpdate: (data: NewPortfolioData) => void;
  userFullName?: string;
};

export function NavbarEditor({ portfolioData, onUpdate, userFullName }: NavbarEditorProps) {
  const updateNavbar = (updates: Partial<NewPortfolioData['navbar']>) => {
    onUpdate({
      ...portfolioData,
      navbar: {
        opacity: portfolioData.navbar?.opacity ?? 95,
        backgroundColor: portfolioData.navbar?.backgroundColor ?? '#FFFFFF',
        textColor: portfolioData.navbar?.textColor ?? '#1F2937',
        showBranding: portfolioData.navbar?.showBranding ?? false,
        brandingText: portfolioData.navbar?.brandingText,
        ...updates,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navbar Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Customize the appearance of your portfolio navigation bar.
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
                brandingText: e.target.checked
                  ? portfolioData.navbar?.brandingText || userFullName || 'Portfolio'
                  : undefined,
              })
            }
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Show Name/Logo</span>
            <p className="text-xs text-gray-500">Display branding text on the left side of navbar</p>
          </div>
        </label>
      </div>

      {/* Branding Text */}
      {portfolioData.navbar?.showBranding && (
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

      {/* Preview Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> The navbar is visible at the top of the preview. Try different opacity
          values to create a glassmorphism effect!
        </p>
      </div>
    </div>
  );
}
