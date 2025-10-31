export interface User {
  $id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  pronouns?: string;
  availability?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    dribbble?: string;
    behance?: string;
    youtube?: string;
    facebook?: string;
    medium?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Project {
  $id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  videos?: string[];
  documents?: string[];
  isPublic: boolean;
  featured: boolean;
  order: number;
  userId: string;
  coverImage?: string;
  liveUrl?: string;
  sourceUrl?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
  techStack?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface PortfolioContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, '$id' | 'createdAt' | 'updatedAt' | 'userId' | 'createdBy'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: (userId?: string) => Promise<void>;
  clearError: () => void;
}