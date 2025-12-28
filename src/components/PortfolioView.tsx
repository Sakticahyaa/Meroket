import { useState, useEffect } from 'react';
import { supabase, PortfolioV2, PortfolioSection } from '../lib/supabase';
import { X, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PortfolioNavbar } from './PortfolioNavbar';

type PortfolioViewProps = {
  slug?: string;
  onBack?: () => void;
};

// Helper function to generate animation variants
function getAnimationVariants(animationType?: string) {
  if (!animationType || animationType === 'none') {
    return {};
  }

  // Fixed duration and delay for all animations
  const duration = 0.6; // 600ms
  const delay = 0.1; // 100ms

  const variants: any = {
    hidden: {},
    visible: {
      transition: {
        duration,
        delay,
        ease: 'easeOut',
      },
    },
  };

  switch (animationType) {
    case 'fade':
      variants.hidden.opacity = 0;
      variants.visible.opacity = 1;
      break;
    case 'slideUp':
      variants.hidden.opacity = 0;
      variants.hidden.y = 50;
      variants.visible.opacity = 1;
      variants.visible.y = 0;
      break;
    case 'slideDown':
      variants.hidden.opacity = 0;
      variants.hidden.y = -50;
      variants.visible.opacity = 1;
      variants.visible.y = 0;
      break;
    case 'slideLeft':
      variants.hidden.opacity = 0;
      variants.hidden.x = 50;
      variants.visible.opacity = 1;
      variants.visible.x = 0;
      break;
    case 'slideRight':
      variants.hidden.opacity = 0;
      variants.hidden.x = -50;
      variants.visible.opacity = 1;
      variants.visible.x = 0;
      break;
    default:
      variants.hidden.opacity = 0;
      variants.visible.opacity = 1;
  }

  return variants;
}

// Helper function to generate background styles
function getBackgroundStyle(section: any) {
  let bgStyle: any = {};

  if (section.backgroundType === 'color') {
    bgStyle = { backgroundColor: section.backgroundColor || '#FFFFFF' };
  } else if (section.backgroundType === 'gradient') {
    const isRadial = section.gradientType === 'radial';
    if (isRadial) {
      bgStyle = {
        background: `radial-gradient(circle, ${section.gradientStart || '#667eea'}, ${section.gradientEnd || '#764ba2'})`,
      };
    } else {
      const direction =
        section.gradientDirection === 'horizontal'
          ? 'to right'
          : section.gradientDirection === 'vertical'
          ? 'to bottom'
          : 'to bottom right';
      bgStyle = {
        background: `linear-gradient(${direction}, ${section.gradientStart || '#667eea'}, ${section.gradientEnd || '#764ba2'})`,
      };
    }
  } else if (section.backgroundType === 'image' && section.backgroundImage) {
    bgStyle = {
      backgroundImage: `url(${section.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  return bgStyle;
}

export function PortfolioView({ slug, onBack }: PortfolioViewProps) {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioV2 | null>(null);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPortfolio();
    }
  }, [slug]);

  const loadPortfolio = async () => {
    try {
      const { data, error: portfolioError } = await supabase
        .from('portfolios_v2')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!data) {
        setError('Portfolio not found');
        setLoading(false);
        return;
      }

      // Parse portfolio_data if it's a string
      if (typeof data.portfolio_data === 'string') {
        try {
          data.portfolio_data = JSON.parse(data.portfolio_data);
        } catch (e) {
          console.error('Failed to parse portfolio_data:', e);
        }
      }

      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-slate-600">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Not Found</h1>
          <p className="text-slate-600">{error || 'This portfolio does not exist or is not published.'}</p>
        </div>
      </div>
    );
  }

  const sections = portfolio.portfolio_data?.sections || [];

  // If no sections, show a message
  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Empty Portfolio</h1>
          <p className="text-slate-600">This portfolio has no sections yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Portfolio Navigation Bar */}
      <PortfolioNavbar
        sections={sections}
        config={portfolio.portfolio_data?.navbar}
      />

      {onBack && (
        <div className="fixed top-4 left-4 z-30">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white shadow-lg"
          >
            Back to Editor
          </button>
        </div>
      )}

      {sections.map((section: any, index) => {
        // HERO SECTION
        if (section.type === 'hero') {
          const heroData = section;
          const bgStyle = getBackgroundStyle(heroData);
          const heroVariants = getAnimationVariants(heroData.animation);
          const hasAnimation = heroData.animation && heroData.animation !== 'none';

          return (
            <section
              key={`hero-${index}`}
              className="relative min-h-screen flex items-center justify-center px-4"
              style={bgStyle}
            >
              {heroData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/30"></div>
              )}
              {heroData.profileImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={heroData.profileImage}
                    alt="Profile"
                    className="w-64 h-64 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                </div>
              )}
              <motion.div
                className="relative text-center max-w-4xl mx-auto"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={heroVariants}
              >
                <h1
                  className="text-5xl md:text-7xl font-bold mb-6"
                  style={{
                    color: heroData.titleColor || '#1F2937',
                    fontFamily: heroData.titleFont || 'Inter',
                  }}
                >
                  {heroData.title}
                </h1>
                <p
                  className="text-2xl md:text-3xl"
                  style={{
                    color: heroData.subtitleColor || '#6B7280',
                    fontFamily: heroData.subtitleFont || 'Inter',
                  }}
                >
                  {heroData.subtitle}
                </p>
              </motion.div>
            </section>
          );
        }

        // ABOUT SECTION
        if (section.type === 'about') {
          const aboutData = section;
          const shapeClasses: Record<string, string> = {
            circle: 'rounded-full',
            square: 'rounded-none',
            rounded: 'rounded-2xl',
            hexagon: 'clip-hexagon',
            triangle: 'clip-triangle',
          };

          const imageSizeClasses: Record<string, string> = {
            small: 'w-48 h-48',
            medium: 'w-80 h-80',
            large: 'w-96 h-96',
          };

          const bgStyle = getBackgroundStyle(aboutData);
          const aboutVariants = getAnimationVariants(aboutData.animation);
          const hasAnimation = aboutData.animation && aboutData.animation !== 'none';

          return (
            <section
              key={`about-${index}`}
              id="section-about"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {aboutData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={aboutVariants}
              >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {aboutData.image && (
                    <div className="flex justify-center">
                      <img
                        src={aboutData.image}
                        alt="Profile"
                        className={`${imageSizeClasses[aboutData.imageSize || 'medium']} object-cover ${shapeClasses[aboutData.imageShape] || 'rounded-full'}`}
                        style={
                          aboutData.imageBorder
                            ? {
                                border: `${aboutData.borderWidth || 4}px solid ${aboutData.borderColor || '#000'}`,
                              }
                            : {}
                        }
                      />
                    </div>
                  )}
                  <div>
                    <h2
                      className="text-4xl font-bold mb-6"
                      style={{
                        fontFamily: aboutData.titleFont || aboutData.font || 'Inter',
                        color: aboutData.titleColor || '#1F2937'
                      }}
                    >
                      {aboutData.title}
                    </h2>
                    <p
                      className="text-lg leading-relaxed whitespace-pre-wrap"
                      style={{
                        fontFamily: aboutData.descriptionFont || aboutData.font || 'Inter',
                        color: aboutData.descriptionColor || '#6B7280'
                      }}
                    >
                      {aboutData.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>
          );
        }

        // SKILLS SECTION
        if (section.type === 'skills') {
          const skillsData = section;

          const bgStyle = getBackgroundStyle(skillsData);
          const skillsVariants = getAnimationVariants(skillsData.animation);
          const hasAnimation = skillsData.animation && skillsData.animation !== 'none';

          return (
            <section
              key={`skills-${index}`}
              id="section-skills"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {skillsData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={skillsVariants}
              >
                <h2
                  className="text-4xl font-bold text-center mb-12"
                  style={{
                    fontFamily: skillsData.titleFont || skillsData.font || 'Inter',
                    color: skillsData.titleColor || '#1F2937'
                  }}
                >
                  {skillsData.title}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {skillsData.cards?.map((card: any) => (
                    <div
                      key={card.id}
                      className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow ${
                        card.backgroundStyle === 'blur' ? 'backdrop-blur-md bg-opacity-70' : ''
                      }`}
                      style={{
                        backgroundColor: card.backgroundColor || '#FFFFFF'
                      }}
                    >
                      {card.icon && (
                        <div className="w-16 h-16 mb-4">
                          <img src={card.icon} alt={card.title} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <h3
                        className="text-xl font-bold mb-3"
                        style={{
                          fontFamily: skillsData.font || 'Inter',
                          color: skillsData.cardTitleColor || '#1F2937'
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: skillsData.font || 'Inter',
                          color: skillsData.cardDescriptionColor || '#6B7280'
                        }}
                      >
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>
          );
        }

        // EXPERIENCE SECTION
        if (section.type === 'experience') {
          const experienceData = section;

          const bgStyle = getBackgroundStyle(experienceData);
          const experienceVariants = getAnimationVariants(experienceData.animation);
          const hasAnimation = experienceData.animation && experienceData.animation !== 'none';

          return (
            <section
              key={`experience-${index}`}
              id="section-experience"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {experienceData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={experienceVariants}
              >
                <h2
                  className="text-4xl font-bold text-center mb-12"
                  style={{
                    fontFamily: experienceData.titleFont || experienceData.font || 'Inter',
                    color: experienceData.titleColor || '#1F2937'
                  }}
                >
                  {experienceData.title}
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {experienceData.cards?.map((card: any) => (
                    <div
                      key={card.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {card.image && (
                        <div
                          className="h-64 bg-cover bg-center cursor-pointer"
                          style={{ backgroundImage: `url(${card.image})` }}
                          onClick={() => setLightboxImage(card.image)}
                        />
                      )}
                      <div className="p-6">
                        <h3
                          className="text-2xl font-bold mb-3"
                          style={{
                            fontFamily: experienceData.font || 'Inter',
                            color: experienceData.cardTitleColor || '#1F2937'
                          }}
                        >
                          {card.title}
                        </h3>
                        <p
                          className="mb-3"
                          style={{
                            fontFamily: experienceData.font || 'Inter',
                            color: experienceData.cardDescriptionColor || '#6B7280'
                          }}
                        >
                          {card.shortDescription}
                        </p>
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
              </motion.div>
            </section>
          );
        }

        // PROJECTS SECTION (New Design)
        if (section.type === 'projects') {
          const projectsData = section;

          const bgStyle = getBackgroundStyle(projectsData);
          const projectsVariants = getAnimationVariants(projectsData.animation);
          const hasAnimation = projectsData.animation && projectsData.animation !== 'none';

          return (
            <section
              key={`projects-${index}`}
              id="section-projects"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {projectsData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={projectsVariants}
              >
                <h2
                  className="text-4xl font-bold text-center mb-12"
                  style={{
                    fontFamily: projectsData.titleFont || projectsData.font || 'Inter',
                    color: projectsData.titleColor || '#1F2937'
                  }}
                >
                  {projectsData.title}
                </h2>
                <div className="space-y-8">
                  {projectsData.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className={`border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow ${
                        item.backgroundStyle === 'blur' ? 'backdrop-blur-md bg-opacity-70' : ''
                      }`}
                      style={{
                        backgroundColor: item.backgroundColor || '#FFFFFF'
                      }}
                    >
                      {item.image && (
                        <div
                          className="h-80 bg-cover bg-center relative cursor-pointer"
                          style={{ backgroundImage: `url(${item.image})` }}
                          onClick={() => setLightboxImage(item.image)}
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
                            <h3
                              className="text-2xl font-bold mb-2"
                              style={{
                                fontFamily: projectsData.font || 'Inter',
                                color: projectsData.itemTitleColor || '#1F2937'
                              }}
                            >
                              {item.title}
                            </h3>
                            <p
                              style={{
                                fontFamily: projectsData.font || 'Inter',
                                color: projectsData.itemDescriptionColor || '#6B7280'
                              }}
                            >
                              {item.description}
                            </p>
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
              </motion.div>
            </section>
          );
        }

        // TESTIMONIALS SECTION
        if (section.type === 'testimonials') {
          const testimonialsData = section;

          const bgStyle = getBackgroundStyle(testimonialsData);
          const testimonialsVariants = getAnimationVariants(testimonialsData.animation);
          const hasAnimation = testimonialsData.animation && testimonialsData.animation !== 'none';

          return (
            <section
              key={`testimonials-${index}`}
              id="section-testimonials"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {testimonialsData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={testimonialsVariants}
              >
                <h2
                  className="text-4xl font-bold text-center mb-12"
                  style={{
                    fontFamily: testimonialsData.titleFont || testimonialsData.font || 'Inter',
                    color: testimonialsData.titleColor || '#1F2937'
                  }}
                >
                  {testimonialsData.title}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {testimonialsData.cards?.map((card: any) => (
                    <div key={card.id} className="bg-white p-8 rounded-xl shadow-lg">
                      <div className="text-4xl text-blue-600 mb-4">"</div>
                      <p
                        className="mb-6 italic"
                        style={{
                          fontFamily: testimonialsData.font || 'Inter',
                          color: testimonialsData.cardTextColor || '#1F2937'
                        }}
                      >
                        {card.text}
                      </p>
                      <div className="border-t border-slate-200 pt-4">
                        <p
                          className="font-bold"
                          style={{
                            fontFamily: testimonialsData.font || 'Inter',
                            color: testimonialsData.cardAuthorColor || '#6B7280'
                          }}
                        >
                          {card.author}
                        </p>
                        {card.role && (
                          <p
                            className="text-sm"
                            style={{
                              fontFamily: testimonialsData.font || 'Inter',
                              color: testimonialsData.cardAuthorColor || '#6B7280'
                            }}
                          >
                            {card.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>
          );
        }

        // CONTACT SECTION
        if (section.type === 'contact') {
          const contactData = section;

          const bgStyle = getBackgroundStyle(contactData);
          const contactVariants = getAnimationVariants(contactData.animation);
          const hasAnimation = contactData.animation && contactData.animation !== 'none';

          return (
            <section
              key={`contact-${index}`}
              id="section-contact"
              className="relative py-20 px-4"
              style={bgStyle}
            >
              {contactData.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/20"></div>
              )}
              <motion.div
                className="max-w-4xl mx-auto text-center relative z-10"
                initial={hasAnimation ? "hidden" : false}
                whileInView={hasAnimation ? "visible" : undefined}
                viewport={{ once: true, margin: "-100px" }}
                variants={contactVariants}
              >
                <h2
                  className="text-4xl font-bold mb-8"
                  style={{
                    fontFamily: contactData.titleFont || contactData.font || 'Inter',
                    color: contactData.titleColor || '#1F2937'
                  }}
                >
                  {contactData.title}
                </h2>
                <div className="flex justify-center gap-6">
                  {contactData.method === 'email' && contactData.email && (
                    <a
                      href={`mailto:${contactData.email}`}
                      className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
                    >
                      <Mail className="w-5 h-5" />
                      Email Me
                    </a>
                  )}
                  {contactData.method === 'whatsapp' && contactData.whatsappNumber && (
                    <a
                      href={`https://wa.me/${contactData.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium"
                    >
                      <Phone className="w-5 h-5" />
                      WhatsApp Me
                    </a>
                  )}
                </div>
              </motion.div>
            </section>
          );
        }

        return null;
      })}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Lightbox"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
