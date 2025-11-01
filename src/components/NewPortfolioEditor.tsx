import React, { useState } from 'react';
import { Plus, Monitor, Smartphone, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { NewPortfolioData, PortfolioSection, SectionType } from '../lib/supabase';
import {
  HeroEditor,
  AboutEditor,
  SkillsEditor,
  ProjectsEditor,
  TestimonialsEditor,
  ContactEditor,
} from './SectionEditors';

interface NewPortfolioEditorProps {
  initialData?: NewPortfolioData;
  onSave: (data: NewPortfolioData) => Promise<void>;
  onCancel: () => void;
}

export default function NewPortfolioEditor({ initialData, onSave, onCancel }: NewPortfolioEditorProps) {
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
      case 'projects':
        newSection = {
          type: 'projects',
          title: 'My Projects',
          cards: [],
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

  const handleSave = async () => {
    await onSave(portfolioData);
  };

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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save & Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>

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
                  onClick={() => setSelectedSectionIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{section.type}</p>
                      <p className="text-sm text-gray-500">
                        {section.type === 'hero' && section.title}
                        {section.type === 'about' && section.title}
                        {section.type === 'skills' && `${section.cards.length} items`}
                        {section.type === 'projects' && `${section.cards.length} projects`}
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
              className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Section
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
                  onClick={() => addSection('projects')}
                  className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                >
                  <span className="font-medium">Projects</span>
                  <p className="text-xs text-gray-500">Display your work</p>
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
        <div className="flex-1 bg-gray-100 overflow-auto p-8">
          <div
            className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all ${
              previewMode === 'mobile' ? 'max-w-md' : 'max-w-6xl'
            }`}
          >
            {portfolioData.sections.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p>Add your first section to get started</p>
              </div>
            ) : (
              portfolioData.sections.map((section, index) => (
                <div key={index} className="preview-section">
                  {/* Preview rendering will be implemented in PortfolioPreview component */}
                  <div className="p-8 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">{section.type.toUpperCase()}</p>
                    {section.type === 'hero' && (
                      <div
                        style={{
                          background:
                            section.backgroundType === 'color'
                              ? section.backgroundColor
                              : section.backgroundType === 'gradient'
                              ? getGradientCSS(
                                  section.gradientStart || '#667eea',
                                  section.gradientEnd || '#764ba2',
                                  section.gradientDirection || 'horizontal'
                                )
                              : `url(${section.backgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        className="p-12 text-center"
                      >
                        <h1 style={{ color: section.titleColor }} className="text-4xl font-bold mb-4">
                          {section.title}
                        </h1>
                        <p style={{ color: section.subtitleColor }} className="text-xl">
                          {section.subtitle}
                        </p>
                      </div>
                    )}
                    {section.type === 'about' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p>{section.description}</p>
                      </div>
                    )}
                    {section.type === 'skills' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p className="text-gray-500">{section.cards.length} skills</p>
                      </div>
                    )}
                    {section.type === 'projects' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p className="text-gray-500">{section.cards.length} projects</p>
                      </div>
                    )}
                    {section.type === 'testimonials' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p className="text-gray-500">{section.cards.length} testimonials</p>
                      </div>
                    )}
                    {section.type === 'contact' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p className="text-gray-500">Method: {section.method}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor Panel - Shows when a section is selected */}
        {selectedSectionIndex !== null && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
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
          </div>
        )}
      </div>
    </div>
  );
}
