import { put, del, list } from '@vercel/blob';

export interface MeditationFile {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  url: string;
  size: number; // in bytes
  contentType: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class VercelBlobStorage {
  private readonly basePath = 'meditations';

  /**
   * Upload a meditation file to Vercel Blob
   * This should be called from the backend API only
   */
  async uploadMeditation(
    file: File,
    metadata: {
      title: string;
      description?: string;
      duration: number;
      isPremium: boolean;
    }
  ): Promise<MeditationFile> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const filename = `${sanitizedTitle}-${timestamp}.${file.name.split('.').pop()}`;
      const path = `${this.basePath}/${filename}`;

      // Upload to Vercel Blob
      const blob = await put(path, file, {
        access: 'public',
        contentType: file.type,
      });

      // Return meditation file object
      return {
        id: timestamp.toString(),
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
        url: blob.url,
        size: file.size,
        contentType: file.type,
        isPremium: metadata.isPremium,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error uploading meditation:', error);
      throw new Error('Failed to upload meditation file');
    }
  }

  /**
   * Delete a meditation file from Vercel Blob
   * This should be called from the backend API only
   */
  async deleteMeditation(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('Error deleting meditation:', error);
      throw new Error('Failed to delete meditation file');
    }
  }

  /**
   * List all meditation files
   * This should be called from the backend API only
   */
  async listMeditations(): Promise<MeditationFile[]> {
    try {
      const { blobs } = await list({
        prefix: `${this.basePath}/`,
      });

      // Convert blobs to meditation files
      // Note: This is a simplified version. In production, you'd want to store
      // metadata in a database and only use this for file management
      return blobs.map((blob) => ({
        id: blob.pathname.split('/').pop()?.split('.')[0] || '',
        title: blob.pathname.split('/').pop()?.split('-')[0] || 'Unknown',
        duration: 0, // Would need to be stored in database
        url: blob.url,
        size: blob.size,
        contentType: (blob as any).contentType || 'audio/mpeg',
        isPremium: false, // Would need to be stored in database
        createdAt: new Date(blob.uploadedAt),
        updatedAt: new Date(blob.uploadedAt),
      }));
    } catch (error) {
      console.error('Error listing meditations:', error);
      throw new Error('Failed to list meditation files');
    }
  }

  /**
   * Get meditation file URL (safe for frontend)
   */
  getMeditationUrl(filename: string): string {
    return `https://blob.vercel-storage.com/${this.basePath}/${filename}`;
  }
}

// Export singleton instance
export const blobStorage = new VercelBlobStorage();
