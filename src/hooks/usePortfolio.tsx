import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { portfolioService } from '../services/portfolio';
import { Project, PortfolioContextType } from '../types';
import { useAuth } from './useAuth';

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const sortProjects = useCallback((items: Project[]) => {
    return [...items].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, []);

  const fetchProjects = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const resolvedUserId = userId || user?.$id;
      const userProjects = await portfolioService.getProjects(resolvedUserId);
      setProjects(sortProjects(userProjects));
    } catch (error: unknown) {
      console.error('Fetch projects error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [sortProjects, user?.$id]);

  useEffect(() => {
    if (user) {
      fetchProjects(user.$id);
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setError(null);
    }
  }, [user]);

  const createProject = async (project: Omit<Project, '$id' | 'createdAt' | 'updatedAt' | 'userId' | 'createdBy'>) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await portfolioService.createProject(project);
      setProjects(prev => sortProjects([...prev, newProject]));
    } catch (error: unknown) {
      console.error('Create project error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await portfolioService.updateProject(id, project);
      setProjects(prev => sortProjects(prev.map(p => (p.$id === id ? updatedProject : p))));
    } catch (error: unknown) {
      console.error('Update project error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update project');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await portfolioService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.$id !== id));
    } catch (error: unknown) {
      console.error('Delete project error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete project');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: PortfolioContextType = {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
    clearError: () => setError(null)
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};