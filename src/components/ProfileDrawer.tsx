import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

type SocialLinkKey =
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'dribbble'
  | 'behance'
  | 'youtube'
  | 'facebook'
  | 'medium';

interface ProfileFormState {
  name: string;
  bio: string;
  location: string;
  website: string;
  pronouns: string;
  availability: string;
  skills: string;
  avatar: string;
  socialLinks: Record<SocialLinkKey, string>;
}

const availabilityOptions = [
  '',
  'Open to work',
  'Available for freelance',
  'Available for mentoring',
  'Not currently available'
];

const socialLinkConfig: Array<{ key: SocialLinkKey; label: string; placeholder: string }> = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'medium', label: 'Medium', placeholder: 'https://medium.com/@username' }
];

const baseSocialLinks: Record<SocialLinkKey, string> = {
  github: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  dribbble: '',
  behance: '',
  youtube: '',
  facebook: '',
  medium: ''
};

const createInitialState = (state?: Partial<ProfileFormState>): ProfileFormState => ({
  name: state?.name ?? '',
  bio: state?.bio ?? '',
  location: state?.location ?? '',
  website: state?.website ?? '',
  pronouns: state?.pronouns ?? '',
  availability: state?.availability ?? '',
  skills: state?.skills ?? '',
  avatar: state?.avatar ?? '',
  socialLinks: {
    ...baseSocialLinks,
    ...(state?.socialLinks || {})
  }
});

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [formState, setFormState] = useState<ProfileFormState>(() => createInitialState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profilePreview = useMemo(() => {
    if (!user) {
      return '';
    }
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    return `${domain}/portfolio/${user.$id}`;
  }, [user]);

  useEffect(() => {
    if (!user || !open) {
      return;
    }

    const socialLinks = socialLinkConfig.reduce<Record<SocialLinkKey, string>>((acc, { key }) => {
      acc[key] = user.socialLinks?.[key] || '';
      return acc;
    }, {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      dribbble: '',
      behance: '',
      youtube: '',
      facebook: '',
      medium: ''
    });

    setFormState(createInitialState({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      pronouns: user.pronouns || '',
      availability: user.availability || '',
      skills: (user.skills || []).join(', '),
      avatar: user.avatar || '',
      socialLinks
    }));
    setError('');
    setSuccess('');
  }, [user, open]);

  if (!open || !user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const socialKey = name.replace('socialLinks.', '') as SocialLinkKey;
      setFormState(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const skills = formState.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);

      const socialLinks = Object.entries(formState.socialLinks)
        .filter(([, link]) => link && link.trim().length > 0)
        .reduce<Record<SocialLinkKey, string>>((acc, [key, link]) => {
          acc[key as SocialLinkKey] = link.trim();
          return acc;
        }, {} as Record<SocialLinkKey, string>);

      await updateProfile({
        name: formState.name.trim(),
        bio: formState.bio.trim(),
        location: formState.location.trim(),
        website: formState.website.trim(),
        pronouns: formState.pronouns.trim(),
        availability: formState.availability.trim(),
        skills,
        avatar: formState.avatar.trim(),
        socialLinks
      });

      setSuccess('Profile updated successfully.');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 900);
    } catch (updateError: any) {
      setError(updateError?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-gray-900/60"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Keep your public portfolio up to date so collaborators understand your strengths.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close profile editor"
            disabled={loading}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-6 py-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Basics</h3>
            <div className="mt-3 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={formState.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Craft a short narrative about your mission, skills, and the value you create."
                  value={formState.bio}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-400">
                  This appears on your public profile hero section.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Professional</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Berlin, Germany"
                  value={formState.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="https://yourdomain.com"
                  value={formState.website}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
                  Pronouns
                </label>
                <input
                  id="pronouns"
                  name="pronouns"
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="she/her, they/them, he/him"
                  value={formState.pronouns}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={formState.availability}
                  onChange={handleChange}
                >
                  {availabilityOptions.map(option => (
                    <option key={option || 'blank'} value={option}>
                      {option || 'Select an option'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Product strategy, UX research, prototyping"
                  value={formState.skills}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-400">Comma-separated list. Displayed as badges on your public profile.</p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Avatar image URL
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="url"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="https://images.cdn.com/your-photo.jpg"
                  value={formState.avatar}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Social links</h3>
            <div className="mt-3 grid gap-4">
              {socialLinkConfig.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label htmlFor={`socialLinks.${key}`} className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    id={`socialLinks.${key}`}
                    name={`socialLinks.${key}`}
                    type="url"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder={placeholder}
                    value={formState.socialLinks[key]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </section>

          <footer className="sticky bottom-0 flex flex-col items-start gap-3 border-t bg-white py-4">
            {error && <span className="text-sm text-red-600">{error}</span>}
            {success && <span className="text-sm text-emerald-600">{success}</span>}

            <div className="flex w-full items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Public portfolio URL</p>
                <p className="text-sm font-medium text-indigo-600">{profilePreview}</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </aside>
    </div>
  );
};

export default ProfileDrawer;
