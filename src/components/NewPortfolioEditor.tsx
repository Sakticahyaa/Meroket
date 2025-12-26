import { useState } from 'react';
import { Plus, Monitor, Smartphone, Trash2, ChevronUp, ChevronDown, AlertCircle, Settings } from 'lucide-react';
import { NewPortfolioData, PortfolioSection, SectionType, TIER_LIMITS } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { canAddSection, countTotalProjectCards, getTierBadge, shouldFreezeDueToLimits } from '../lib/tierUtils';
import { FrozenPortfolioNotice } from './FrozenPortfolioNotice';
import { PortfolioNavbar } from './PortfolioNavbar';
import { NavbarEditor } from './NavbarEditor';
import {
  HeroEditor,
  AboutEditor,
  SkillsEditor,
  ExperienceEditor,
  ProjectsEditor,
  TestimonialsEditor,
  ContactEditor,
} from './SectionEditors';

interface NewPortfolioEditorProps {
  initialData?: NewPortfolioData;
  onSave: (data: NewPortfolioData, publish: boolean) => Promise<void>;
  onCancel: () => void;
}

export default function NewPortfolioEditor({ initialData, onSave, onCancel }: NewPortfolioEditorProps) {
  const { profile } = useAuth();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [portfolioData, setPortfolioData] = useState<NewPortfolioData>(
    initialData || {
      slug: '',
      is_published: false,
      sections: [],
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        headingColor: '#1F2937',
        bodyColor: '#6B7280',
      },
    }
  );
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showNavbarEditor, setShowNavbarEditor] = useState(false);

  const userTier = profile?.user_tier || 'free';
  const tierLimits = TIER_LIMITS[userTier];
  const tierBadge = getTierBadge(userTier);
  const totalProjectCards = countTotalProjectCards(portfolioData.sections);

  // Check if portfolio should be frozen
  const freezeCheck = shouldFreezeDueToLimits(
    portfolioData.sections.length,
    totalProjectCards,
    userTier
  );
  const isFrozen = portfolioData.is_frozen || freezeCheck.shouldFreeze;

  // Helper function to generate gradient CSS
  const getGradientCSS = (start: string, end: string, direction: 'horizontal' | 'vertical' | 'diagonal') => {
    const directions = {
      horizontal: 'to right',
      vertical: 'to bottom',
      diagonal: 'to bottom right',
    };
    return `linear-gradient(${directions[direction]}, ${start}, ${end})`;
  };

  const addSection = (type: SectionType) => {
    // Check tier limits before adding section
    const validation = canAddSection(portfolioData.sections.length, userTier);
    if (!validation.allowed) {
      alert(validation.message);
      return;
    }

    let newSection: PortfolioSection;

    switch (type) {
      case 'hero':
        newSection = {
          type: 'hero',
          backgroundType: 'color',
          backgroundColor: '#FFFFFF',
          gradientStart: '#667eea',
          gradientEnd: '#764ba2',
          gradientDirection: 'horizontal',
          title: 'Your Name',
          subtitle: 'Your Title',
          titleColor: '#1F2937',
          subtitleColor: '#6B7280',
        };
        break;
      case 'about':
        newSection = {
          type: 'about',
          title: 'About Me',
          description: 'Tell your story...',
          imageShape: 'circle',
          imageBorder: false,
        };
        break;
      case 'skills':
        newSection = {
          type: 'skills',
          title: 'Skills & Services',
          cards: [],
        };
        break;
      case 'experience':
        newSection = {
          type: 'experience',
          title: 'My Experience',
          cards: [],
        };
        break;
      case 'projects':
        newSection = {
          type: 'projects',
          title: 'My Projects',
          items: [],
        };
        break;
      case 'testimonials':
        newSection = {
          type: 'testimonials',
          title: 'Testimonials',
          cards: [],
        };
        break;
      case 'contact':
        newSection = {
          type: 'contact',
          title: 'Contact Me',
          method: 'email',
          showForm: true,
        };
        break;
    }

    setPortfolioData({
      ...portfolioData,
      sections: [...portfolioData.sections, newSection],
    });
    setShowAddSection(false);
    setSelectedSectionIndex(portfolioData.sections.length);
  };

  const updateSection = (index: number, updatedSection: PortfolioSection) => {
    const newSections = [...portfolioData.sections];
    newSections[index] = updatedSection;
    setPortfolioData({ ...portfolioData, sections: newSections });
  };

  const deleteSection = (index: number) => {
    const newSections = portfolioData.sections.filter((_, i) => i !== index);
    setPortfolioData({ ...portfolioData, sections: newSections });
    setSelectedSectionIndex(null);
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...portfolioData.sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setPortfolioData({ ...portfolioData, sections: newSections });
    setSelectedSectionIndex(index - 1);
  };

  const moveSectionDown = (index: number) => {
    if (index === portfolioData.sections.length - 1) return;
    const newSections = [...portfolioData.sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setPortfolioData({ ...portfolioData, sections: newSections });
    setSelectedSectionIndex(index + 1);
  };

  const handleSave = async (publish: boolean) => {
    if (isFrozen) {
      alert('This portfolio is frozen and cannot be saved or published. Please check the notice for details.');
      return;
    }
    await onSave({ ...portfolioData, is_published: publish }, publish);
  };

  // Show frozen notice if portfolio is frozen
  if (isFrozen) {
    return <FrozenPortfolioNotice userTier={userTier} reason={freezeCheck.reason} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Portfolio Editor</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={portfolioData.slug}
              onChange={(e) => setPortfolioData({ ...portfolioData, slug: e.target.value })}
              placeholder="your-portfolio-url"
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">meroket.id/{portfolioData.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Back
          </button>
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Save
          </button>
          <button
            onClick={() => handleSave(!portfolioData.is_published)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              portfolioData.is_published
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {portfolioData.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white ${tierBadge.color}`}
              >
                {tierBadge.label}
              </span>
            </div>

            {/* Tier Limits Banner */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Your Limits ({tierBadge.label} Plan)</p>
                  <ul className="space-y-0.5 text-blue-700">
                    <li>• Sections: {portfolioData.sections.length}/{tierLimits.sections}</li>
                    <li>• Project Cards: {totalProjectCards}/{tierLimits.projects}</li>
                  </ul>
                  {(portfolioData.sections.length >= tierLimits.sections ||
                    totalProjectCards >= tierLimits.projects) && (
                    <p className="mt-2 text-amber-700 font-medium">
                      ⚠️ Limit reached. Upgrade to add more.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navbar Button */}
            <button
              onClick={() => {
                setShowNavbarEditor(true);
                setSelectedSectionIndex(null);
              }}
              className={`w-full mb-4 p-3 border rounded-lg transition-colors flex items-center gap-3 ${
                showNavbarEditor
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Navbar Settings</p>
                <p className="text-sm text-gray-500">Customize navigation bar</p>
              </div>
            </button>

            {/* Section List */}
            <div className="space-y-2">
              {portfolioData.sections.map((section, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSectionIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedSectionIndex(index);
                    setShowNavbarEditor(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{section.type}</p>
                      <p className="text-sm text-gray-500">
                        {section.type === 'hero' && section.title}
                        {section.type === 'about' && section.title}
                        {section.type === 'skills' && `${section.cards.length} items`}
                        {section.type === 'experience' && `${section.cards.length} items`}
                        {section.type === 'projects' && `${section.items.length} projects`}
                        {section.type === 'testimonials' && `${section.cards.length} testimonials`}
                        {section.type === 'contact' && section.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSectionUp(index);
                        }}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSectionDown(index);
                        }}
                        disabled={index === portfolioData.sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(index);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Section Button */}
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              disabled={portfolioData.sections.length >= tierLimits.sections}
              className={`w-full mt-4 p-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${
                portfolioData.sections.length >= tierLimits.sections
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add Section {portfolioData.sections.length >= tierLimits.sections && '(Limit Reached)'}
            </button>

            {/* Add Section Menu */}
            {showAddSection && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-1">
                {portfolioData.sections.length === 0 && (
                  <button
                    onClick={() => addSection('hero')}
                    className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                  >
                    <span className="font-medium">Hero Section</span>
                    <p className="text-xs text-gray-500">Main header with title</p>
                  </button>
                )}
                <button
                  onClick={() => addSection('about')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">About Me</span>
                  <p className="text-xs text-gray-500">Profile with image & text</p>
                </button>
                <button
                  onClick={() => addSection('skills')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Skills / Services</span>
                  <p className="text-xs text-gray-500">Showcase your expertise</p>
                </button>
                <button
                  onClick={() => addSection('experience')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Experience</span>
                  <p className="text-xs text-gray-500">Work history & portfolio</p>
                </button>
                <button
                  onClick={() => addSection('projects')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Projects</span>
                  <p className="text-xs text-gray-500">Featured work with details</p>
                </button>
                <button
                  onClick={() => addSection('testimonials')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Testimonials</span>
                  <p className="text-xs text-gray-500">Client reviews</p>
                </button>
                <button
                  onClick={() => addSection('contact')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Contact</span>
                  <p className="text-xs text-gray-500">Get in touch form</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div
            className={`mx-auto bg-white transition-all origin-top relative ${
              previewMode === 'mobile' ? 'max-w-md' : 'w-full'
            }`}
            style={{
              minHeight: '100%',
              transform: selectedSectionIndex !== null ? 'scale(0.75)' : 'scale(1)',
              transformOrigin: 'top center',
            }}
          >
            {/* Portfolio Navbar Preview */}
            <PortfolioNavbar sections={portfolioData.sections} config={portfolioData.navbar} />

            {portfolioData.sections.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p>Add your first section to get started</p>
              </div>
            ) : (
              portfolioData.sections.map((section: any, index) => {
                // HERO SECTION
                if (section.type === 'hero') {
                  let bgStyle: any = {};
                  if (section.backgroundType === 'color') {
                    bgStyle = { backgroundColor: section.backgroundColor || '#FFFFFF' };
                  } else if (section.backgroundType === 'gradient') {
                    const direction =
                      section.gradientDirection === 'horizontal'
                        ? 'to right'
                        : section.gradientDirection === 'vertical'
                        ? 'to bottom'
                        : 'to bottom right';
                    bgStyle = {
                      background: `linear-gradient(${direction}, ${section.gradientStart || '#667eea'}, ${section.gradientEnd || '#764ba2'})`,
                    };
                  } else if (section.backgroundType === 'image' && section.backgroundImage) {
                    bgStyle = {
                      backgroundImage: `url(${section.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    };
                  }

                  return (
                    <section
                      key={`hero-${index}`}
                      className="relative min-h-screen flex items-center justify-center px-4"
                      style={bgStyle}
                    >
                      {section.backgroundType === 'image' && (
                        <div className="absolute inset-0 bg-black/30"></div>
                      )}
                      <div className="relative text-center max-w-4xl mx-auto">
                        <h1
                          className="text-5xl md:text-7xl font-bold mb-6"
                          style={{ color: section.titleColor || '#1F2937' }}
                        >
                          {section.title}
                        </h1>
                        <p
                          className="text-2xl md:text-3xl"
                          style={{ color: section.subtitleColor || '#6B7280' }}
                        >
                          {section.subtitle}
                        </p>
                      </div>
                    </section>
                  );
                }

                // ABOUT SECTION
                if (section.type === 'about') {
                  const shapeClasses: any = {
                    circle: 'rounded-full',
                    square: 'rounded-none',
                    rounded: 'rounded-2xl',
                    hexagon: 'clip-hexagon',
                    triangle: 'clip-triangle',
                  };

                  return (
                    <section
                      key={`about-${index}`}
                      id="section-about"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#FFFFFF' }}
                    >
                      <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                          {section.image && (
                            <div className="flex justify-center">
                              <img
                                src={section.image}
                                alt="Profile"
                                className={`w-80 h-80 object-cover ${shapeClasses[section.imageShape] || 'rounded-full'}`}
                                style={
                                  section.imageBorder
                                    ? {
                                        border: `${section.borderWidth || 4}px solid ${section.borderColor || '#000'}`,
                                      }
                                    : {}
                                }
                              />
                            </div>
                          )}
                          <div>
                            <h2 className="text-4xl font-bold mb-6 text-slate-900">{section.title}</h2>
                            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                // SKILLS SECTION
                if (section.type === 'skills') {
                  return (
                    <section
                      key={`skills-${index}`}
                      id="section-skills"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#F8FAFC' }}
                    >
                      <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">
                          {section.title}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                          {section.cards?.map((card: any) => (
                            <div
                              key={card.id}
                              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                              {card.icon && (
                                <div className="w-16 h-16 mb-4">
                                  <img src={card.icon} alt={card.title} className="w-full h-full object-contain" />
                                </div>
                              )}
                              <h3 className="text-xl font-bold mb-3 text-slate-900">{card.title}</h3>
                              <p className="text-slate-600">{card.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                // EXPERIENCE SECTION
                if (section.type === 'experience') {
                  return (
                    <section
                      key={`experience-${index}`}
                      id="section-experience"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#FFFFFF' }}
                    >
                      <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">
                          {section.title}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                          {section.cards?.map((card: any) => (
                            <div
                              key={card.id}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
                            >
                              {card.image && (
                                <div
                                  className="h-64 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${card.image})` }}
                                />
                              )}
                              <div className="p-6">
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">{card.title}</h3>
                                <p className="text-slate-600 mb-3">{card.shortDescription}</p>
                                {card.tags && card.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {card.tags.map((tag: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                // PROJECTS SECTION (New Design)
                if (section.type === 'projects') {
                  return (
                    <section
                      key={`projects-${index}`}
                      id="section-projects"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#FFFFFF' }}
                    >
                      <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">
                          {section.title}
                        </h2>
                        <div className="space-y-8">
                          {section.items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
                            >
                              {item.image && (
                                <div
                                  className="h-80 bg-cover bg-center relative"
                                  style={{ backgroundImage: `url(${item.image})` }}
                                >
                                  {item.logo && (
                                    <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
                                      <img
                                        src={item.logo}
                                        alt="Company logo"
                                        className="h-12 w-12 object-contain"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-600">{item.description}</p>
                                  </div>
                                </div>
                                {item.skills && item.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {item.skills.map((skill: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium uppercase tracking-wide"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {item.learnMoreURL && (
                                  <a
                                    href={item.learnMoreURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Learn More →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                // TESTIMONIALS SECTION
                if (section.type === 'testimonials') {
                  return (
                    <section
                      key={`testimonials-${index}`}
                      id="section-testimonials"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#F8FAFC' }}
                    >
                      <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">
                          {section.title}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                          {section.cards?.map((card: any) => (
                            <div key={card.id} className="bg-white p-8 rounded-xl shadow-lg">
                              <div className="text-4xl text-blue-600 mb-4">"</div>
                              <p className="text-slate-700 mb-6 italic">{card.text}</p>
                              <div className="border-t border-slate-200 pt-4">
                                <p className="font-bold text-slate-900">{card.author}</p>
                                {card.role && <p className="text-sm text-slate-600">{card.role}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                // CONTACT SECTION
                if (section.type === 'contact') {
                  return (
                    <section
                      key={`contact-${index}`}
                      id="section-contact"
                      className="py-20 px-4"
                      style={{ backgroundColor: section.backgroundColor || '#FFFFFF' }}
                    >
                      <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8 text-slate-900">{section.title}</h2>
                        <p className="text-slate-600">
                          Contact method: {section.method === 'email' ? 'Email' : 'WhatsApp'}
                        </p>
                      </div>
                    </section>
                  );
                }

                return null;
              })
            )}
          </div>
        </div>

        {/* Editor Panel - Shows when a section is selected or navbar editor is open */}
        {(selectedSectionIndex !== null || showNavbarEditor) && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            {showNavbarEditor ? (
              <NavbarEditor
                portfolioData={portfolioData}
                onUpdate={setPortfolioData}
                userFullName={profile?.full_name}
              />
            ) : selectedSectionIndex !== null && (
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  Edit {portfolioData.sections[selectedSectionIndex].type}
                </h2>
                {portfolioData.sections[selectedSectionIndex].type === 'hero' && (
                <HeroEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'about' && (
                <AboutEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'skills' && (
                <SkillsEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'experience' && (
                <ExperienceEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                  currentProjectCount={totalProjectCards}
                  maxProjects={tierLimits.projects}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'projects' && (
                <ProjectsEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'testimonials' && (
                <TestimonialsEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
              {portfolioData.sections[selectedSectionIndex].type === 'contact' && (
                <ContactEditor
                  section={portfolioData.sections[selectedSectionIndex] as any}
                  onChange={(updated) => updateSection(selectedSectionIndex, updated)}
                />
              )}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
