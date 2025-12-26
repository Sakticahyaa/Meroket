import { supabase } from './supabase';
import type { NewPortfolioData, TrackedImage } from './supabase';

const STORAGE_BUCKET = 'portfolio-images';

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param path - Optional path prefix (e.g., 'profiles', 'projects')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  path: string = 'images'
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @returns Boolean indicating success
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const path = extractPathFromUrl(url);
    if (!path) return false;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Extract storage path from public URL
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const bucketPath = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.indexOf(bucketPath);
    if (index === -1) return null;
    return url.substring(index + bucketPath.length);
  } catch {
    return null;
  }
}

/**
 * Track all image URLs in a portfolio
 * @param portfolioData - The portfolio data to scan
 * @returns Array of tracked images
 */
export function trackImageURLs(portfolioData: NewPortfolioData): TrackedImage[] {
  const tracked: TrackedImage[] = [];
  const timestamp = Date.now();

  // Track navbar branding logo
  if (portfolioData.navbar?.brandingLogo) {
    tracked.push({
      url: portfolioData.navbar.brandingLogo,
      section: 'hero', // Use hero as default for navbar
      field: 'navbar.brandingLogo',
      timestamp,
    });
  }

  // Track section images
  portfolioData.sections.forEach((section) => {
    switch (section.type) {
      case 'hero':
        if (section.backgroundImage) {
          tracked.push({
            url: section.backgroundImage,
            section: 'hero',
            field: 'backgroundImage',
            timestamp,
          });
        }
        if (section.profileImage) {
          tracked.push({
            url: section.profileImage,
            section: 'hero',
            field: 'profileImage',
            timestamp,
          });
        }
        break;

      case 'about':
        if (section.image) {
          tracked.push({
            url: section.image,
            section: 'about',
            field: 'image',
            timestamp,
          });
        }
        break;

      case 'skills':
        section.cards?.forEach((card, index) => {
          if (card.icon) {
            tracked.push({
              url: card.icon,
              section: 'skills',
              field: `cards[${index}].icon`,
              timestamp,
            });
          }
        });
        break;

      case 'experience':
        section.cards?.forEach((card, index) => {
          if (card.image) {
            tracked.push({
              url: card.image,
              section: 'experience',
              field: `cards[${index}].image`,
              timestamp,
            });
          }
        });
        break;

      case 'projects':
        section.items?.forEach((item, index) => {
          if (item.image) {
            tracked.push({
              url: item.image,
              section: 'projects',
              field: `items[${index}].image`,
              timestamp,
            });
          }
          if (item.logo) {
            tracked.push({
              url: item.logo,
              section: 'projects',
              field: `items[${index}].logo`,
              timestamp,
            });
          }
        });
        break;
    }
  });

  return tracked;
}

/**
 * Cleanup unused images by comparing old and new portfolio data
 * @param oldData - Previous portfolio data
 * @param newData - New portfolio data
 * @returns Array of deleted image URLs
 */
export async function cleanupUnusedImages(
  oldData: NewPortfolioData | undefined,
  newData: NewPortfolioData
): Promise<string[]> {
  if (!oldData) return [];

  const oldImages = trackImageURLs(oldData).map((img) => img.url);
  const newImages = trackImageURLs(newData).map((img) => img.url);

  // Find images that are in old but not in new (orphaned images)
  const imagesToDelete = oldImages.filter((url) => !newImages.includes(url));

  const deleted: string[] = [];
  for (const url of imagesToDelete) {
    const success = await deleteImage(url);
    if (success) {
      deleted.push(url);
    }
  }

  return deleted;
}

/**
 * Convert File to base64 data URL (for preview before upload)
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
}
