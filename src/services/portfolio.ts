import { databases, storage, account } from './appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import { Project } from '../types';

const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || '';
const COLLECTION_PROJECTS = process.env.REACT_APP_APPWRITE_COLLECTION_PROJECTS || 'projects';
const BUCKET_MEDIA = process.env.REACT_APP_APPWRITE_BUCKET_MEDIA || 'media';

// Configuration validation
const validateConfig = () => {
  const requiredVars = {
    REACT_APP_APPWRITE_PROJECT_ID: process.env.REACT_APP_APPWRITE_PROJECT_ID,
    REACT_APP_APPWRITE_DATABASE_ID: process.env.REACT_APP_APPWRITE_DATABASE_ID,
    REACT_APP_APPWRITE_COLLECTION_PROJECTS: process.env.REACT_APP_APPWRITE_COLLECTION_PROJECTS,
    REACT_APP_APPWRITE_BUCKET_MEDIA: process.env.REACT_APP_APPWRITE_BUCKET_MEDIA
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing or empty required environment variables: ${missingVars.join(', ')}. Please check your .env file configuration.`);
  }
};

export class PortfolioService {
  private toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map(item => String(item)) : [];
  }

  private mapProjectDoc(doc: Models.Document): Project {
    return {
      $id: doc.$id,
      title: (doc as any).title || '',
      description: (doc as any).description || '',
      category: (doc as any).category || 'uncategorized',
      tags: this.toStringArray((doc as any).tags),
      images: this.toStringArray((doc as any).images),
      videos: this.toStringArray((doc as any).videos),
      documents: this.toStringArray((doc as any).documents),
      isPublic: (doc as any).isPublic !== undefined ? Boolean((doc as any).isPublic) : true,
      featured: Boolean((doc as any).featured),
      order: typeof (doc as any).order === 'number' ? (doc as any).order : 0,
  userId: (doc as any).userId || (doc as any).createdBy || '',
  createdBy: (doc as any).createdBy || (doc as any).userId || '',
      coverImage: (doc as any).coverImage || this.toStringArray((doc as any).images)[0] || '',
      liveUrl: (doc as any).liveUrl || '',
      sourceUrl: (doc as any).sourceUrl || '',
      startDate: (doc as any).startDate || '',
      endDate: (doc as any).endDate || '',
      highlights: this.toStringArray((doc as any).highlights),
      techStack: this.toStringArray((doc as any).techStack),
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt
    };
  }

  async createProject(project: Omit<Project, '$id' | 'createdAt' | 'updatedAt' | 'userId' | 'createdBy'>): Promise<Project> {
    try {
      validateConfig();
      
      const accountData = await account.get();
      
      const projectData = {
        ...project,
        tags: project.tags || [],
        images: project.images || [],
        videos: project.videos || [],
        documents: project.documents || [],
        highlights: project.highlights || [],
        techStack: project.techStack || [],
        isPublic: project.isPublic ?? true,
        featured: project.featured ?? false,
        order: typeof project.order === 'number' ? project.order : 0,
        userId: accountData.$id,
        createdBy: accountData.$id
      };

      const projectDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_PROJECTS,
        ID.unique(),
        projectData
      );

      return this.mapProjectDoc(projectDoc);
    } catch (error: any) {
      console.error('Create project error:', error);
      throw new Error(error.message || 'Project creation failed. Please try again.');
    }
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    try {
      const projectDoc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_PROJECTS,
        id,
        project
      );

      return this.mapProjectDoc(projectDoc);
    } catch (error: any) {
      console.error('Update project error:', error);
      throw new Error(error.message || 'Failed to update project.');
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_PROJECTS, id);
    } catch (error: any) {
      console.error('Delete project error:', error);
      throw new Error(error?.message || 'Failed to delete project.');
    }
  }

  async getProjects(userId?: string): Promise<Project[]> {
    try {
      validateConfig();
      
      const queries: string[] = [];

      if (userId) {
        queries.push(Query.equal('userId', userId));
      } else {
        queries.push(Query.equal('isPublic', true));
      }

    queries.push(Query.orderAsc('order'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_PROJECTS,
        queries
      );

      const mappedProjects = response.documents.map(doc => this.mapProjectDoc(doc));

      return mappedProjects.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }

        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
    } catch (error: any) {
      console.error('Get projects error:', error);
      throw new Error(error.message || 'Failed to fetch projects. Please try again.');
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const response = await storage.createFile(
        BUCKET_MEDIA,
        ID.unique(),
        file
      );
      return response.$id;
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw new Error(error?.message || 'Failed to upload file.');
    }
  }

  getFileUrl(fileId: string): string {
    try {
      return storage.getFileView(BUCKET_MEDIA, fileId);
    } catch (error: any) {
      console.error('Get file URL error:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(BUCKET_MEDIA, fileId);
    } catch (error: any) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
}

export const portfolioService = new PortfolioService();