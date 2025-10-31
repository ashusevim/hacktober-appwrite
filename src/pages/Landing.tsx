import React from 'react';
import { Link } from 'react-router-dom';

const featureList = [
  {
    title: 'Tell your story',
    description: 'Polish your profile with a bio, social links, and availability so collaborators know how to reach you.'
  },
  {
    title: 'Showcase projects',
    description: 'Highlight achievements, tech stacks, timelines, and visuals for every project you publish.'
  },
  {
    title: 'Share it anywhere',
    description: 'Each portfolio comes with a shareable link so you can embed it in resumes, proposals, and social posts.'
  }
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <header className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 text-center md:text-left">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Portfolio builder for makers
          </span>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Ship a shareable portfolio in minutes — no design skills required.
          </h1>
          <p className="max-w-2xl text-base text-gray-600 md:text-lg">
            Hacktober Appwrite gives creators a fast way to capture their wins, publish projects, and keep their story updated. Sign in to start crafting a living portfolio.
          </p>
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-start">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              See what’s inside
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-indigo-50">
          <img
            src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1600&q=80"
            alt="Portfolio preview"
            className="h-80 w-full object-cover"
            loading="lazy"
          />
        </div>
      </header>

      <main id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-8 md:grid-cols-3">
          {featureList.map(feature => (
            <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-2xl bg-indigo-600 px-8 py-12 text-center text-indigo-50 md:text-left">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h2 className="text-2xl font-semibold">Ready to publish your portfolio?</h2>
              <p className="mt-2 text-sm text-indigo-100">
                Sign in with your Appwrite credentials to create projects, update your profile, and share your personal site.
              </p>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-indigo-600 shadow-md shadow-indigo-500/30 transition hover:bg-indigo-100"
            >
              Launch dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
