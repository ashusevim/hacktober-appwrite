import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { Project } from '../types';
import ProfileDrawer from './ProfileDrawer';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';

type VisibilityFilter = 'all' | 'public' | 'private';
type SortOption = 'order' | 'recent' | 'az';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    projects,
    loading,
    error,
    deleteProject,
    updateProject,
    fetchProjects,
    clearError
  } = usePortfolio();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [copyMessage, setCopyMessage] = useState('');

  const shareUrl = useMemo(() => {
    if (!user) {
      return '';
    }

    if (typeof window === 'undefined') {
      return `/portfolio/${user.$id}`;
    }

    return `${window.location.origin}/portfolio/${user.$id}`;
  }, [user]);

  const stats = useMemo(() => {
    const total = projects.length;
    const publicCount = projects.filter(project => project.isPublic).length;
    const featured = projects.filter(project => project.featured).length;
    return {
      total,
      publicCount,
      privateCount: total - publicCount,
      featured
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        if (!searchTerm) {
          return true;
        }
        const term = searchTerm.toLowerCase();
        return (
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.tags.some(tag => tag.toLowerCase().includes(term))
        );
      })
      .filter(project => {
        if (categoryFilter === 'all') {
          return true;
        }
        return project.category === categoryFilter;
      })
      .filter(project => {
        if (visibilityFilter === 'all') {
          return true;
        }
        return visibilityFilter === 'public' ? project.isPublic : !project.isPublic;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'az':
            return a.title.localeCompare(b.title);
          case 'order':
          default:
            if (a.order !== b.order) {
              return a.order - b.order;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [projects, searchTerm, categoryFilter, visibilityFilter, sortBy]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (project: Project) => {
    const confirmation = window.confirm(`Delete "${project.title}"? This action cannot be undone.`);
    if (!confirmation) {
      return;
    }

    try {
      await deleteProject(project.$id);
    } catch (deleteError) {
      console.error('Delete project error:', deleteError);
    }
  };

  const handleVisibilityToggle = async (project: Project) => {
    try {
      await updateProject(project.$id, { isPublic: !project.isPublic });
    } catch (visibilityError) {
      console.error('Toggle project visibility error:', visibilityError);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyMessage('Link copied to clipboard');
    } catch (copyError) {
      console.error('Copy share link error:', copyError);
      setCopyMessage('Unable to copy link');
    }

    setTimeout(() => setCopyMessage(''), 2000);
  };

  const handleRefresh = async () => {
    await fetchProjects(user?.$id);
  };

  const closeProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-500">Dashboard</p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="mt-2 text-sm text-gray-500">
              Track your projects, update your profile, and share your live portfolio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowProfileDrawer(true)}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={handleAddProject}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Add project
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Projects</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Public</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.publicCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Private</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.privateCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Featured</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600">{stats.featured}</p>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Public portfolio</h2>
              <p className="text-sm text-gray-500">Share your live portfolio with clients, recruiters, and collaborators.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
              >
                Copy link
              </button>
              <Link
                to={`/portfolio/${user?.$id}`}
                target="_blank"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                View live
              </Link>
            </div>
          </div>
          {copyMessage && <p className="mt-3 text-xs text-emerald-600">{copyMessage}</p>}
        </section>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="search" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Search by title, description, or tag"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </label>
                <select
                  id="category"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={categoryFilter}
                  onChange={event => setCategoryFilter(event.target.value)}
                >
                  <option value="all">All categories</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="data">Data & AI</option>
                  <option value="product">Product</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="visibility" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Visibility
                </label>
                <select
                  id="visibility"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={visibilityFilter}
                  onChange={event => setVisibilityFilter(event.target.value as VisibilityFilter)}
                >
                  <option value="all">All projects</option>
                  <option value="public">Public only</option>
                  <option value="private">Private only</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sort by
                </label>
                <select
                  id="sort"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value as SortOption)}
                >
                  <option value="order">Manual order</option>
                  <option value="recent">Newest first</option>
                  <option value="az">Alphabetical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleAddProject}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                New project
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading && projects.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
              Loading your projects…
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-800">No matching projects</h3>
              <p className="mt-2 text-sm text-gray-500">
                Adjust your filters or add a new project to showcase your work.
              </p>
              <button
                type="button"
                onClick={handleAddProject}
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create project
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.$id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onToggleVisibility={handleVisibilityToggle}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showProjectForm && (
        <ProjectForm
          onClose={closeProjectForm}
          project={editingProject ?? undefined}
        />
      )}

      <ProfileDrawer
        open={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
};

export default Dashboard;