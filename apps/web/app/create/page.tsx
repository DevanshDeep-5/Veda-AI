import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import AssignmentForm from '../../components/forms/AssignmentForm';

export const metadata: Metadata = {
  title: 'Create Assessment',
  description: 'Configure your assignment and let AI generate a structured question paper.',
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
          <Sparkles className="h-3 w-3" />
          AI-Powered Generation
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Create New Assessment
        </h1>
        <p className="mt-2 text-slate-400">
          Fill in the details below. Our AI will generate a structured question paper tailored to your requirements.
        </p>
      </div>

      <AssignmentForm />
    </div>
  );
}
