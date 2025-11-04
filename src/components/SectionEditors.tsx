import React, { useState } from 'react';
import { Upload, Plus, X, Image as ImageIcon } from 'lucide-react';
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  TestimonialsSection,
  ContactSection,
  SkillCard,
  ProjectCard,
  TestimonialCard,
} from '../lib/supabase';

// Hero Section Editor
export function HeroEditor({
  section,
  onChange,
}: {
  section: HeroSection;
  onChange: (section: HeroSection) => void;
}) {
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
              </div>
            )}
          </div>
        </div>
      )}

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={section.description}
          onChange={(e) => onChange({ ...section, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange({ ...section, image: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {section.image && (
            <div className="relative w-32 h-32 mx-auto rounded border border-gray-300 overflow-hidden">
              <img
                src={section.image}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
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

  const addCard = () => {
    const newCard: SkillCard = {
      id: Date.now().toString(),
      title: 'New Skill',
      description: 'Description',
      iconType: 'lucide',
    };
    onChange({ ...section, cards: [...section.cards, newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<SkillCard>) => {
    onChange({
      ...section,
      cards: section.cards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: section.cards.filter((card) => card.id !== id) });
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
          {section.cards.map((card) => (
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
                    <label className="block text-xs text-gray-600 mb-1">Icon/Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateCard(card.id, { icon: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {card.icon && (
                      <div className="mt-2 w-12 h-12 rounded border border-gray-300 overflow-hidden">
                        <img src={card.icon} alt="Icon preview" className="w-full h-full object-cover" />
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
    </div>
  );
}

// Projects Section Editor
export function ProjectsEditor({
  section,
  onChange,
  currentProjectCount = 0,
  maxProjects = 100,
}: {
  section: ProjectsSection;
  onChange: (section: ProjectsSection) => void;
  currentProjectCount?: number;
  maxProjects?: number;
}) {
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const addCard = () => {
    // Check project limit
    if (currentProjectCount >= maxProjects) {
      alert(`You've reached your project card limit (${maxProjects}). Please upgrade your plan to add more.`);
      return;
    }

    const newCard: ProjectCard = {
      id: Date.now().toString(),
      title: 'New Project',
      shortDescription: 'Short description',
      fullDescription: 'Full description of the project...',
      tags: [],
    };
    onChange({ ...section, cards: [...section.cards, newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<ProjectCard>) => {
    onChange({
      ...section,
      cards: section.cards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: section.cards.filter((card) => card.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="My Projects / Our Projects"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Projects</label>
          <button
            onClick={addCard}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {section.cards.map((card) => (
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
    onChange({ ...section, cards: [...section.cards, newCard] });
    setEditingCard(newCard.id);
  };

  const updateCard = (id: string, updates: Partial<TestimonialCard>) => {
    onChange({
      ...section,
      cards: section.cards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    });
  };

  const deleteCard = (id: string) => {
    onChange({ ...section, cards: section.cards.filter((card) => card.id !== id) });
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
          {section.cards.map((card) => (
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
    </div>
  );
}
