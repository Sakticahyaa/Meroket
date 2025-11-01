import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PreviewData } from '../lib/supabase';
import { Save, Eye, ArrowLeft, Upload } from 'lucide-react';
import { ColorPalettePicker } from './ColorPalettePicker';

type PortfolioEditorProps = {
  portfolioId?: string;
  onBack: () => void;
  onPreview?: (data: PreviewData) => void;
};

export function PortfolioEditor({ portfolioId, onBack, onPreview }: PortfolioEditorProps) {
  const { user } = useAuth();
  const heroImageRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
            title_color: formData.heroTitleColor, // Keep for backward compatibility
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
            title_color: formData.heroTitleColor, // Keep for backward compatibility
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
      if (!portfolioId) {
        setTimeout(() => onBack(), 1500);
      }
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

  const handlePreview = () => {
    console.log('Preview button clicked');
    if (!onPreview) {
      console.log('onPreview function not available');
      return;
    }

    const previewData = {
      slug: formData.slug || 'preview',
      is_published: true,
      hero_image_url: formData.heroImageUrl,
      hero_title: formData.heroTitle,
      hero_subtitle: formData.heroSubtitle,
      profile_image_url: formData.profileImageUrl,
      profile_description: formData.profileDescription,
      additional_content: formData.additionalContent,
      bg_color: formData.bgColor,
      title_color: formData.heroTitleColor, // Keep for backward compatibility
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
    };

    console.log('Calling onPreview with data:', previewData);
    onPreview(previewData);
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
            // Main image
            return { ...project, mainImageUrl: data.publicUrl };
          } else {
            // Gallery image
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            {formData.isPublished && formData.slug && (
              <a
                href={`http://meroket.id/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <Eye className="w-4 h-4" />
                View Live
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio URL Slug *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">meroket.id/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="your-name"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPalettePicker
                value={formData.bgColor}
                onChange={(value) => setFormData({ ...formData, bgColor: value })}
                label="Background Color"
              />
              <ColorPalettePicker
                value={formData.heroTitleColor}
                onChange={(value) => setFormData({ ...formData, heroTitleColor: value })}
                label="Hero Title Color"
              />
              <ColorPalettePicker
                value={formData.heroSubtitleColor}
                onChange={(value) => setFormData({ ...formData, heroSubtitleColor: value })}
                label="Hero Subtitle Color"
              />
              <ColorPalettePicker
                value={formData.headingColor}
                onChange={(value) => setFormData({ ...formData, headingColor: value })}
                label="Heading Color"
              />
              <ColorPalettePicker
                value={formData.bodyColor}
                onChange={(value) => setFormData({ ...formData, bodyColor: value })}
                label="Body Text Color"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Image</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                      placeholder="Enter image URL or upload below"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => heroImageRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
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
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={formData.heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Profile Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={formData.profileImageUrl}
                      onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                      placeholder="Enter image URL or upload below"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => profileImageRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
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
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200">
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">About Me / Description</label>
                <textarea
                  value={formData.profileDescription}
                  onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {projects.map((project, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Project {idx + 1}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Main Image</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={project.mainImageUrl}
                        onChange={(e) => updateProject(idx, 'mainImageUrl', e.target.value)}
                        placeholder="Enter image URL or upload below"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
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
                        className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        {uploadingImage ? (
                          <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Upload
                      </button>
                    </div>
                    {project.mainImageUrl && (
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={project.mainImageUrl}
                          alt="Main project preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gallery Images (up to 4)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {project.galleryImages.map((url, imgIdx) => (
                      <div key={imgIdx} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateGalleryImage(idx, imgIdx, e.target.value)}
                            placeholder={`Gallery image ${imgIdx + 1}`}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                            className="px-2 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                          >
                            <Upload className="w-3 h-3" />
                          </button>
                        </div>
                        {url && (
                          <div className="w-16 h-12 rounded overflow-hidden border border-slate-200">
                            <img
                              src={url}
                              alt={`Gallery preview ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Additional Content</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Additional Section Content</label>
              <textarea
                value={formData.additionalContent}
                onChange={(e) => setFormData({ ...formData, additionalContent: e.target.value })}
                rows={4}
                placeholder="Add any additional information you'd like to include..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
