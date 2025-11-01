import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PreviewData } from '../lib/supabase';
import {
  Save,
  ArrowLeft,
  Upload,
  ChevronRight,
  ChevronLeft,
  Sidebar,
  Layers
} from 'lucide-react';
import { ColorPalettePicker } from './ColorPalettePicker';
import { PortfolioView } from './PortfolioView';

type ImmersivePortfolioEditorProps = {
  portfolioId?: string;
  onBack: () => void;
};

type EditorMode = 'overlay' | 'split';

export function ImmersivePortfolioEditor({ portfolioId, onBack }: ImmersivePortfolioEditorProps) {
  const { user } = useAuth();
  const heroImageRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');

  const [formData, setFormData] = useState({
    slug: '',
    isPublished: false,
    heroImageUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    profileImageUrl: '',
    profileDescription: '',
    additionalContent: '',
    bgColor: '#ffffff',
    heroTitleColor: '#000000',
    heroSubtitleColor: '#4a4a4a',
    headingColor: '#1a1a1a',
    bodyColor: '#4a4a4a',
  });

  const [projects, setProjects] = useState<Array<{
    id?: string;
    position: number;
    title: string;
    description: string;
    mainImageUrl: string;
    galleryImages: string[];
  }>>([
    { position: 1, title: '', description: '', mainImageUrl: '', galleryImages: ['', '', '', ''] },
    { position: 2, title: '', description: '', mainImageUrl: '', galleryImages: ['', '', '', ''] },
    { position: 3, title: '', description: '', mainImageUrl: '', galleryImages: ['', '', '', ''] },
    { position: 4, title: '', description: '', mainImageUrl: '', galleryImages: ['', '', '', ''] },
  ]);

  useEffect(() => {
    if (portfolioId) {
      loadPortfolio();
    }
  }, [portfolioId]);

  const loadPortfolio = async () => {
    if (!portfolioId) return;

    setLoading(true);
    try {
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!portfolio) throw new Error('Portfolio not found');

      setFormData({
        slug: portfolio.slug,
        isPublished: portfolio.is_published,
        heroImageUrl: portfolio.hero_image_url || '',
        heroTitle: portfolio.hero_title || '',
        heroSubtitle: portfolio.hero_subtitle || '',
        profileImageUrl: portfolio.profile_image_url || '',
        profileDescription: portfolio.profile_description || '',
        additionalContent: portfolio.additional_content || '',
        bgColor: portfolio.bg_color,
        heroTitleColor: portfolio.hero_title_color || portfolio.title_color || '#000000',
        heroSubtitleColor: portfolio.hero_subtitle_color || '#4a4a4a',
        headingColor: portfolio.heading_color,
        bodyColor: portfolio.body_color,
      });

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('position');

      if (projectsError) throw projectsError;

      const loadedProjects = await Promise.all(
        [1, 2, 3, 4].map(async (position) => {
          const project = projectsData?.find(p => p.position === position);

          const galleryImages = ['', '', '', ''];
          if (project) {
            const { data: images } = await supabase
              .from('project_images')
              .select('*')
              .eq('project_id', project.id)
              .order('position');

            if (images) {
              images.forEach(img => {
                if (img.position >= 1 && img.position <= 4) {
                  galleryImages[img.position - 1] = img.image_url;
                }
              });
            }
          }

          return {
            id: project?.id,
            position,
            title: project?.title || '',
            description: project?.description || '',
            mainImageUrl: project?.main_image_url || '',
            galleryImages,
          };
        })
      );

      setProjects(loadedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!formData.slug) {
        throw new Error('Slug is required');
      }

      let currentPortfolioId = portfolioId;

      if (portfolioId) {
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            slug: formData.slug,
            is_published: formData.isPublished,
            hero_image_url: formData.heroImageUrl || null,
            hero_title: formData.heroTitle || null,
            hero_subtitle: formData.heroSubtitle || null,
            profile_image_url: formData.profileImageUrl || null,
            profile_description: formData.profileDescription || null,
            additional_content: formData.additionalContent || null,
            bg_color: formData.bgColor,
            title_color: formData.heroTitleColor,
            hero_title_color: formData.heroTitleColor,
            hero_subtitle_color: formData.heroSubtitleColor,
            heading_color: formData.headingColor,
            body_color: formData.bodyColor,
          })
          .eq('id', portfolioId);

        if (updateError) throw updateError;
      } else {
        const { data: newPortfolio, error: insertError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            slug: formData.slug,
            is_published: formData.isPublished,
            hero_image_url: formData.heroImageUrl || null,
            hero_title: formData.heroTitle || null,
            hero_subtitle: formData.heroSubtitle || null,
            profile_image_url: formData.profileImageUrl || null,
            profile_description: formData.profileDescription || null,
            additional_content: formData.additionalContent || null,
            bg_color: formData.bgColor,
            title_color: formData.heroTitleColor,
            hero_title_color: formData.heroTitleColor,
            hero_subtitle_color: formData.heroSubtitleColor,
            heading_color: formData.headingColor,
            body_color: formData.bodyColor,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        currentPortfolioId = newPortfolio.id;
      }

      for (const project of projects) {
        if (project.id) {
          await supabase
            .from('projects')
            .update({
              title: project.title || null,
              description: project.description || null,
              main_image_url: project.mainImageUrl || null,
            })
            .eq('id', project.id);

          await supabase
            .from('project_images')
            .delete()
            .eq('project_id', project.id);

          const imagesToInsert = project.galleryImages
            .map((url, idx) => ({ url, idx }))
            .filter(item => item.url)
            .map(item => ({
              project_id: project.id!,
              image_url: item.url,
              position: item.idx + 1,
            }));

          if (imagesToInsert.length > 0) {
            await supabase.from('project_images').insert(imagesToInsert);
          }
        } else {
          const { data: newProject } = await supabase
            .from('projects')
            .insert({
              portfolio_id: currentPortfolioId!,
              position: project.position,
              title: project.title || null,
              description: project.description || null,
              main_image_url: project.mainImageUrl || null,
            })
            .select()
            .single();

          if (newProject) {
            const imagesToInsert = project.galleryImages
              .map((url, idx) => ({ url, idx }))
              .filter(item => item.url)
              .map(item => ({
                project_id: newProject.id,
                image_url: item.url,
                position: item.idx + 1,
              }));

            if (imagesToInsert.length > 0) {
              await supabase.from('project_images').insert(imagesToInsert);
            }
          }
        }
      }

      setSuccess('Portfolio saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const updateProject = (index: number, field: string, value: string) => {
    setProjects(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateGalleryImage = (projectIndex: number, imageIndex: number, value: string) => {
    setProjects(prev => {
      const updated = [...prev];
      const galleryImages = [...updated[projectIndex].galleryImages];
      galleryImages[imageIndex] = value;
      updated[projectIndex] = { ...updated[projectIndex], galleryImages };
      return updated;
    });
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'profile') => {
    if (!user || !file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      if (type === 'hero') {
        setFormData(prev => ({ ...prev, heroImageUrl: data.publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, profileImageUrl: data.publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProjectImageUpload = async (file: File, projectIndex: number, imageIndex: number) => {
    if (!user || !file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/projects/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      setProjects(prev => prev.map((project, pIdx) => {
        if (pIdx === projectIndex) {
          if (imageIndex === -1) {
            return { ...project, mainImageUrl: data.publicUrl };
          } else {
            const newGalleryImages = [...project.galleryImages];
            newGalleryImages[imageIndex] = data.publicUrl;
            return { ...project, galleryImages: newGalleryImages };
          }
        }
        return project;
      }));
    } catch (error) {
      console.error('Error uploading project image:', error);
      setError('Failed to upload project image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const getPreviewData = (): PreviewData => ({
    slug: formData.slug || 'preview',
    is_published: true,
    hero_image_url: formData.heroImageUrl,
    hero_title: formData.heroTitle,
    hero_subtitle: formData.heroSubtitle,
    profile_image_url: formData.profileImageUrl,
    profile_description: formData.profileDescription,
    additional_content: formData.additionalContent,
    bg_color: formData.bgColor,
    title_color: formData.heroTitleColor,
    hero_title_color: formData.heroTitleColor,
    hero_subtitle_color: formData.heroSubtitleColor,
    heading_color: formData.headingColor,
    body_color: formData.bodyColor,
    projects: projects.map(project => ({
      position: project.position,
      title: project.title,
      description: project.description,
      main_image_url: project.mainImageUrl,
      project_images: project.galleryImages
        .map((url, idx) => ({ image_url: url, position: idx + 1 }))
        .filter(img => img.image_url)
    }))
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const toolbarWidth = toolbarCollapsed ? '0px' : editorMode === 'split' ? '400px' : '380px';

  return (
    <div className="fixed inset-0 flex bg-slate-100">
      {/* Top Action Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditorMode('split')}
              className={`p-2 rounded-lg transition-colors ${
                editorMode === 'split'
                  ? 'bg-red-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Split View"
            >
              <Sidebar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditorMode('overlay')}
              className={`p-2 rounded-lg transition-colors ${
                editorMode === 'overlay'
                  ? 'bg-red-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Overlay Mode"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <div className="text-sm text-red-600 max-w-md truncate">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 max-w-md truncate">
              {success}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        className="flex-1 mt-14 overflow-auto transition-all duration-300"
        style={{
          marginRight: editorMode === 'split' ? toolbarWidth : '0px'
        }}
      >
        <PortfolioView previewData={getPreviewData()} />
      </div>

      {/* Floating Toolbar */}
      <div
        className={`fixed top-14 bottom-0 bg-white border-l border-slate-200 overflow-y-auto transition-all duration-300 z-40 ${
          editorMode === 'overlay' ? 'shadow-2xl' : ''
        }`}
        style={{
          right: toolbarCollapsed ? `-${editorMode === 'split' ? '400px' : '380px'}` : '0',
          width: editorMode === 'split' ? '400px' : '380px',
        }}
      >
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
          className={`absolute top-4 ${
            toolbarCollapsed ? 'right-full' : '-left-10'
          } bg-white border border-slate-200 rounded-l-lg p-2 hover:bg-slate-50 shadow-lg z-50`}
        >
          {toolbarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <div className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Portfolio Settings</h2>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2">
            {['basic', 'colors', 'hero', 'profile', 'projects', 'additional'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeSection === section
                    ? 'bg-red-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Basic Settings */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Basic Settings</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio URL Slug *
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">meroket.id/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="your-name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
                  Publish portfolio (make it publicly visible)
                </label>
              </div>
            </div>
          )}

          {/* Color Scheme */}
          {activeSection === 'colors' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Color Scheme</h3>
              <ColorPalettePicker
                value={formData.bgColor}
                onChange={(value) => setFormData({ ...formData, bgColor: value })}
                label="Background"
              />
              <ColorPalettePicker
                value={formData.heroTitleColor}
                onChange={(value) => setFormData({ ...formData, heroTitleColor: value })}
                label="Hero Title"
              />
              <ColorPalettePicker
                value={formData.heroSubtitleColor}
                onChange={(value) => setFormData({ ...formData, heroSubtitleColor: value })}
                label="Hero Subtitle"
              />
              <ColorPalettePicker
                value={formData.headingColor}
                onChange={(value) => setFormData({ ...formData, headingColor: value })}
                label="Headings"
              />
              <ColorPalettePicker
                value={formData.bodyColor}
                onChange={(value) => setFormData({ ...formData, bodyColor: value })}
                label="Body Text"
              />
            </div>
          )}

          {/* Hero Section */}
          {activeSection === 'hero' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Hero Section</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Image</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => heroImageRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={heroImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'hero');
                      }}
                      className="hidden"
                    />
                  </div>
                  {formData.heroImageUrl && (
                    <img
                      src={formData.heroImageUrl}
                      alt="Hero preview"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Profile Section</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.profileImageUrl}
                      onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => profileImageRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={profileImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'profile');
                      }}
                      className="hidden"
                    />
                  </div>
                  {formData.profileImageUrl && (
                    <img
                      src={formData.profileImageUrl}
                      alt="Profile preview"
                      className="w-20 h-20 object-cover rounded-full border border-slate-200 mx-auto"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">About Me / Description</label>
                <textarea
                  value={formData.profileDescription}
                  onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900">Projects</h3>
              {projects.map((project, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <h4 className="font-medium text-slate-900">Project {idx + 1}</h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Main Image</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={project.mainImageUrl}
                          onChange={(e) => updateProject(idx, 'mainImageUrl', e.target.value)}
                          placeholder="Image URL"
                          className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleProjectImageUpload(file, idx, -1);
                            };
                            input.click();
                          }}
                          disabled={uploadingImage}
                          className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-700 rounded hover:bg-slate-200 disabled:opacity-50"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>
                      {project.mainImageUrl && (
                        <img
                          src={project.mainImageUrl}
                          alt="Main project preview"
                          className="w-full h-20 object-cover rounded border border-slate-200"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Gallery (4 images)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {project.galleryImages.map((url, imgIdx) => (
                        <div key={imgIdx} className="space-y-1">
                          <div className="flex gap-1">
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => updateGalleryImage(idx, imgIdx, e.target.value)}
                              placeholder={`Img ${imgIdx + 1}`}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleProjectImageUpload(file, idx, imgIdx);
                                };
                                input.click();
                              }}
                              disabled={uploadingImage}
                              className="px-1 py-1 bg-slate-100 border border-slate-300 text-slate-700 rounded hover:bg-slate-200 disabled:opacity-50"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          </div>
                          {url && (
                            <img
                              src={url}
                              alt={`Gallery ${imgIdx + 1}`}
                              className="w-full h-12 object-cover rounded border border-slate-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Content */}
          {activeSection === 'additional' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Additional Content</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Section</label>
                <textarea
                  value={formData.additionalContent}
                  onChange={(e) => setFormData({ ...formData, additionalContent: e.target.value })}
                  rows={6}
                  placeholder="Add any additional information..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
