import { useState, useEffect } from 'react';
import { supabase, Portfolio, Project, ProjectImage, PreviewData } from '../lib/supabase';
import { X, ArrowLeft } from 'lucide-react';

type PortfolioViewProps = {
  slug?: string;
  previewData?: PreviewData;
  onBack?: () => void;
};

type ProjectWithImages = Project & {
  images: ProjectImage[];
};

export function PortfolioView({ slug, previewData, onBack }: PortfolioViewProps) {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<ProjectWithImages[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithImages | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (previewData) {
      // Convert preview data to portfolio format
      const portfolioData = {
        ...previewData,
        id: 'preview',
        user_id: 'preview',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Portfolio;

      // Convert preview projects to ProjectWithImages format
      const projectsData = previewData.projects.map((project, index) => ({
        ...project,
        id: `preview-${index}`,
        portfolio_id: 'preview',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: project.project_images.map((img, imgIndex) => ({
          id: `preview-img-${index}-${imgIndex}`,
          project_id: `preview-${index}`,
          image_url: img.image_url,
          position: img.position,
          created_at: new Date().toISOString()
        }))
      })) as ProjectWithImages[];

      setPortfolio(portfolioData);
      setProjects(projectsData);
      setLoading(false);
    } else if (slug) {
      loadPortfolio();
    }
  }, [slug, previewData]);

  const loadPortfolio = async () => {
    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!portfolioData) {
        setError('Portfolio not found');
        setLoading(false);
        return;
      }

      setPortfolio(portfolioData);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('portfolio_id', portfolioData.id)
        .order('position');

      if (projectsError) throw projectsError;

      const projectsWithImages = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: images } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', project.id)
            .order('position');

          return { ...project, images: images || [] };
        })
      );

      setProjects(projectsWithImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Not Found</h1>
          <p className="text-slate-600">{error || 'This portfolio does not exist or is not published.'}</p>
        </div>
      </div>
    );
  }

  const bgStyle = portfolio.bg_color.startsWith('linear-gradient')
    ? { background: portfolio.bg_color }
    : { backgroundColor: portfolio.bg_color };

  return (
    <div style={bgStyle} className="min-h-screen">
      {onBack && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
        </div>
      )}
      {portfolio.hero_image_url && (
        <section className="relative h-screen w-full">
          <img
            src={portfolio.hero_image_url}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center px-4">
              {portfolio.hero_title && (
                <h1
                  className="text-5xl md:text-7xl font-bold mb-4"
                  style={{ color: portfolio.hero_title_color || portfolio.title_color || '#ffffff' }}
                >
                  {portfolio.hero_title}
                </h1>
              )}
              {portfolio.hero_subtitle && (
                <p
                  className="text-xl md:text-2xl"
                  style={{ color: portfolio.hero_subtitle_color || '#ffffff' }}
                >
                  {portfolio.hero_subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {portfolio.profile_image_url && portfolio.profile_description && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={portfolio.profile_image_url}
                  alt="Profile"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div>
                <h2
                  className="text-4xl font-bold mb-6"
                  style={{ color: portfolio.heading_color }}
                >
                  About Me
                </h2>
                <p
                  className="text-lg leading-relaxed whitespace-pre-wrap"
                  style={{ color: portfolio.body_color }}
                >
                  {portfolio.profile_description}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#"
                    className="inline-flex items-center px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                  >
                    Download CV
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-red-900 text-red-900 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Contact Me
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {projects.map((project, idx) => {
        if (!project.title && !project.description && !project.main_image_url) return null;

        const isEven = idx % 2 === 1;

        return (
          <section key={project.id} className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className={`grid md:grid-cols-2 gap-12 items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                <div className={isEven ? 'md:order-2' : ''}>
                  {project.main_image_url && (
                    <img
                      src={project.main_image_url}
                      alt={project.title || 'Project'}
                      className="w-full h-auto rounded-2xl shadow-2xl cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => project.images.length > 0 && setSelectedProject(project)}
                    />
                  )}
                </div>
                <div className={isEven ? 'md:order-1' : ''}>
                  {project.title && (
                    <h2
                      className="text-4xl font-bold mb-6"
                      style={{ color: portfolio.heading_color }}
                    >
                      {project.title}
                    </h2>
                  )}
                  {project.description && (
                    <p
                      className="text-lg leading-relaxed whitespace-pre-wrap"
                      style={{ color: portfolio.body_color }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {portfolio.additional_content && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="text-lg leading-relaxed whitespace-pre-wrap"
              style={{ color: portfolio.body_color }}
            >
              {portfolio.additional_content}
            </div>
          </div>
        </section>
      )}

      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProject.images.map((image) => (
                <img
                  key={image.id}
                  src={image.image_url}
                  alt="Gallery"
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
