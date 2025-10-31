import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onToggleVisibility?: (project: Project) => void;
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start && !end) {
    return '';
  }

  const format = (value?: string) => {
    if (!value) {
      return 'Present';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  };

  const startLabel = start ? format(start) : 'Started';
  const endLabel = end ? format(end) : 'Present';

  return `${startLabel} — ${endLabel}`;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onToggleVisibility }) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };
  const handleDelete = () => {
    if (onDelete) {
      onDelete(project);
    }
  };
  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility(project);
    }
  };

  const coverImage = project.coverImage || project.images?.[0];
  const hasHighlights = Array.isArray(project.highlights) && project.highlights.length > 0;
  const hasTechStack = Array.isArray(project.techStack) && project.techStack.length > 0;
  const hasLinks = Boolean(project.liveUrl || project.sourceUrl);
  const dateRange = formatDateRange(project.startDate, project.endDate);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {coverImage && (
        <div className="relative h-48 bg-gray-100">
          <img
            src={coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.title}</h3>
            <p className="text-sm text-gray-500 capitalize">{project.category}</p>
            {dateRange && (
              <p className="text-xs text-gray-400 mt-1">{dateRange}</p>
            )}
          </div>

          <div className="flex flex-col items-end space-y-1">
            {project.featured && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Featured</span>
            )}
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                project.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {project.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-4 flex-1">{project.description}</p>

        {hasHighlights && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Highlights
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {project.highlights!.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasTechStack && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack!.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.tags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasLinks && (
          <div className="mt-auto flex flex-wrap items-center gap-4 text-sm">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Live ↗
              </a>
            )}
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                View Source ↗
              </a>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
          <span className="text-xs text-gray-400">Order #{project.order ?? 0}</span>
          <div className="flex flex-wrap items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
            {onToggleVisibility && (
              <button
                type="button"
                onClick={handleToggleVisibility}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {project.isPublic ? 'Make private' : 'Make public'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;