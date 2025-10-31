import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { authService } from '../services/auth';
import { portfolioService } from '../services/portfolio';
import { Project, User } from '../types';

const socialLinkLabels: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  instagram: 'Instagram',
  dribbble: 'Dribbble',
  behance: 'Behance',
  youtube: 'YouTube',
  facebook: 'Facebook',
  medium: 'Medium'
};

const PublicPortfolio: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [owner, setOwner] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Portfolio not found.');
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      setLoading(true);
      setError('');

      try {
        const [profile, portfolioProjects] = await Promise.all([
          authService.getUserProfile(userId),
          portfolioService.getProjects(userId)
        ]);

        if (!profile) {
          setError('This portfolio does not exist or is private.');
          setOwner(null);
          setProjects([]);
          return;
        }

        setOwner(profile);
        setProjects(portfolioProjects.filter(project => project.isPublic));
      } catch (loadError: any) {
        setError(loadError?.message || 'Unable to load portfolio.');
        setOwner(null);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [userId]);

  const formattedSkills = useMemo(() => {
    if (!owner?.skills || owner.skills.length === 0) {
      return [];
    }
    return owner.skills;
  }, [owner]);

  const visibleSocialLinks = useMemo(() => {
    if (!owner?.socialLinks) {
      return [];
    }

    return Object.entries(owner.socialLinks)
      .filter(([, url]) => typeof url === 'string' && url.length > 0)
      .map(([key, url]) => ({
        key,
        label: socialLinkLabels[key] || key,
        url
      }));
  }, [owner]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading portfolio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">{error}</h1>
        <p className="mt-3 text-sm text-gray-500">
          Please verify the link or ask the owner to make their portfolio public.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center">
          <div className="flex-shrink-0">
            {owner.avatar ? (
              <img
                src={owner.avatar}
                alt={owner.name}
                className="h-32 w-32 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-600">
                {owner.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{owner.name}</h1>
            </div>

            {owner.bio && <p className="max-w-2xl text-sm text-gray-600">{owner.bio}</p>}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {owner.location && (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 9c0 7.5-7.5 12-7.5 12S4.5 16.5 4.5 9a7.5 7.5 0 1115 0z" />
                  </svg>
                  {owner.location}
                </span>
              )}
              {owner.availability && <span>{owner.availability}</span>}
              {owner.pronouns && <span>{owner.pronouns}</span>}
            </div>

            {formattedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formattedSkills.map(skill => (
                  <span
                    key={skill}
                    className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {visibleSocialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {visibleSocialLinks.map(link => (
                  <a
                    key={link.key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {link.label}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-10 10m0-6v6h6" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
          <Link
            to="/"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
          >
            Start your own portfolio
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-800">No public projects yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon — {owner.name.split(' ')[0]} is working on something great.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPortfolio;
