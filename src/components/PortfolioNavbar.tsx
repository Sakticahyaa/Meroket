import { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarConfig } from '../lib/supabase';

type NavItem = {
  id: string;
  label: string;
  type: string;
};

type PortfolioNavbarProps = {
  sections: any[];
  config?: NavbarConfig;
};

const defaultConfig: NavbarConfig = {
  showBranding: false,
  brandingText: 'Portfolio',
  brandingType: 'text',
  navbarStyle: 'style1',
  opacity: 95, // Default 95%
  backgroundColor: '#FFFFFF', // Default white
  textColor: '#1F2937' // Default dark gray
};

export function PortfolioNavbar({ sections, config = defaultConfig }: PortfolioNavbarProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Merge config with defaults
  const navConfig = { ...defaultConfig, ...config };

  // Generate nav items (exclude hero)
  const navItems: NavItem[] = useMemo(() =>
    sections
      .filter((section: any) => section.type !== 'hero')
      .map((section: any) => ({
        id: `section-${section.type}`,
        label: section.title,
        type: section.type
      })),
    [sections]
  );

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 64; // h-16 = 64px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to hero section (top of page)
  const scrollToHero = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    hamburgerButtonRef.current?.focus();
  };

  // Handle navigation click
  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    if (mobileMenuOpen) {
      closeMobileMenu();
    }
  };

  // Intersection Observer for active section tracking
  useEffect(() => {
    if (navItems.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sectionElements = navItems.map(item =>
      document.getElementById(item.id)
    ).filter(Boolean) as Element[];

    sectionElements.forEach(element => observer.observe(element));

    return () => {
      sectionElements.forEach(element => observer.unobserve(element));
    };
  }, [navItems]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Auto-close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Don't render navbar if no navigable sections
  if (navItems.length === 0) {
    return null;
  }

  // Convert opacity from 0-100 to 0-1
  const opacityValue = navConfig.opacity / 100;

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(navConfig.backgroundColor);
  const backgroundColorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityValue})`;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm"
        style={{
          backgroundColor: backgroundColorWithOpacity
        }}
        aria-label="Portfolio navigation"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-16 relative">
            {/* Left: Branding (conditional) */}
            {navConfig.showBranding && (
              <button
                onClick={scrollToHero}
                className="absolute left-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
                aria-label="Scroll to top"
              >
                {navConfig.brandingType === 'logo' && navConfig.brandingLogo ? (
                  <img
                    src={navConfig.brandingLogo}
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold" style={{ color: navConfig.textColor }}>
                    {navConfig.brandingText}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const isStyle2 = navConfig.navbarStyle === 'style2';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 transition-all ${
                      isStyle2
                        ? isActive
                          ? 'font-bold bg-gray-200 rounded-lg'
                          : 'hover:font-bold'
                        : isActive
                          ? 'font-bold'
                          : 'hover:underline'
                    }`}
                    style={{
                      color: navConfig.textColor
                    }}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              ref={hamburgerButtonRef}
              className="md:hidden p-2 rounded-lg absolute right-0"
              style={{ color: navConfig.textColor }}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold" style={{ color: navConfig.textColor }}>Navigation</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-slate-100 rounded-lg"
                style={{ color: navConfig.textColor }}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const isStyle2 = navConfig.navbarStyle === 'style2';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left px-4 py-3 transition-all ${
                      isStyle2
                        ? isActive
                          ? 'font-bold bg-gray-200 rounded-lg'
                          : 'hover:font-bold'
                        : isActive
                          ? 'font-bold'
                          : 'hover:underline'
                    }`}
                    style={{
                      color: navConfig.textColor
                    }}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
