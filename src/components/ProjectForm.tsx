import React, { useEffect, useMemo, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Project } from '../types';

interface ProjectFormProps {
  onClose: () => void;
  project?: Project;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  tags: string;
  coverImage: string;
  imageUrls: string;
  liveUrl: string;
  sourceUrl: string;
  startDate: string;
  endDate: string;
  highlights: string;
  techStack: string;
  isPublic: boolean;
  featured: boolean;
  order: number;
}

const categoryOptions = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'data', label: 'Data & AI' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'writing', label: 'Writing' },
  { value: 'other', label: 'Other' }
];

const createInitialFormState = (project: Project | undefined, nextOrder: number): FormState => ({
  title: project?.title ?? '',
  description: project?.description ?? '',
  category: project?.category ?? '',
  tags: (project?.tags || []).join(', '),
  coverImage: project?.coverImage ?? project?.images?.[0] ?? '',
  imageUrls: (project?.images || []).join('\n'),
  liveUrl: project?.liveUrl ?? '',
  sourceUrl: project?.sourceUrl ?? '',
  startDate: project?.startDate ?? '',
  endDate: project?.endDate ?? '',
  highlights: (project?.highlights || []).join('\n'),
  techStack: (project?.techStack || []).join(', '),
  isPublic: project?.isPublic ?? true,
  featured: project?.featured ?? false,
  order: project?.order ?? nextOrder
});

const splitAndFilter = (value: string, delimiter: string) => {
  return value
    .split(delimiter)
    .map(item => item.trim())
    .filter(Boolean);
};

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, project }) => {
  const { createProject, updateProject, projects } = usePortfolio();
  const fallbackOrder = useMemo(() => project?.order ?? projects.length, [project, projects.length]);
  const [formData, setFormData] = useState<FormState>(() => createInitialFormState(project, fallbackOrder));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(createInitialFormState(project, fallbackOrder));
  }, [project, fallbackOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tags = splitAndFilter(formData.tags, ',');
      const images = splitAndFilter(formData.imageUrls, '\n');
      const highlights = splitAndFilter(formData.highlights, '\n');
      const techStack = splitAndFilter(formData.techStack, ',');
      const orderValue = Number.isFinite(formData.order) ? formData.order : fallbackOrder;

      const projectPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags,
        images,
        videos: project?.videos || [],
        documents: project?.documents || [],
        isPublic: formData.isPublic,
        featured: formData.featured,
        order: orderValue,
        coverImage: formData.coverImage || images[0] || '',
        liveUrl: formData.liveUrl.trim(),
        sourceUrl: formData.sourceUrl.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        highlights,
        techStack
      };

      if (project) {
        await updateProject(project.$id, projectPayload);
      } else {
        await createProject(projectPayload);
      }

      onClose();
    } catch (projectError: any) {
      setError(projectError?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto z-50">
      <div className="relative mx-auto my-10 max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {project ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-sm text-gray-500">
              Share the work you are proud of. Highlight impact, tech stack, and visuals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            type="button"
            aria-label="Close project form"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.title}
                onChange={handleChange}
                placeholder="Designing a Collaborative Whiteboard Experience"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.description}
                onChange={handleChange}
                placeholder="What problem did you solve and what was the outcome?"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                id="category"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="react, animation, accessibility"
                value={formData.tags}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-400">Use commas to separate technologies or themes.</p>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                id="order"
                min={0}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.order}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-400">Lower numbers appear first on your public portfolio.</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                id="coverImage"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="https://images.yourdomain.com/cover.png"
                value={formData.coverImage}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-400">Used as the primary thumbnail across the app.</p>
            </div>

            <div>
              <label htmlFor="imageUrls" className="block text-sm font-medium text-gray-700">
                Gallery Images
              </label>
              <textarea
                name="imageUrls"
                id="imageUrls"
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="One image URL per line"
                value={formData.imageUrls}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700">
                Live Demo URL
              </label>
              <input
                type="url"
                name="liveUrl"
                id="liveUrl"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="https://yourproject.live"
                value={formData.liveUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700">
                Source Code URL
              </label>
              <input
                type="url"
                name="sourceUrl"
                id="sourceUrl"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="https://github.com/you/awesome-project"
                value={formData.sourceUrl}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={formData.endDate}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-400">Leave empty if the project is ongoing.</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="highlights" className="block text-sm font-medium text-gray-700">
                Highlights
              </label>
              <textarea
                name="highlights"
                id="highlights"
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder={'Breakthrough metrics, responsibilities, outcomes. One per line.'}
                value={formData.highlights}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700">
                Tech Stack
              </label>
              <input
                type="text"
                name="techStack"
                id="techStack"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="react, typescript, tailwind"
                value={formData.techStack}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <label htmlFor="isPublic" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                Visible on public portfolio
              </label>

              <label htmlFor="featured" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Mark as featured
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Saving…' : project ? 'Update project' : 'Create project'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;