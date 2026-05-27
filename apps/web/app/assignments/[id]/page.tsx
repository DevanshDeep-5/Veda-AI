'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useSocket } from '../../../hooks/useSocket';
import { useAssignment } from '../../../hooks/useAssignment';
import { useGenerationStore } from '../../../stores/generationStore';
import { usePaperStore } from '../../../stores/paperStore';
import { useAssignmentStore } from '../../../stores/assignmentStore';
import GenerationProgress from '../../../components/progress/GenerationProgress';
import PaperView from '../../../components/paper/PaperView';

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { fetchAssignment, handleRegenerate, getPdfDownloadUrl, isFetching } = useAssignment();
  const { status } = useGenerationStore();
  const { paper } = usePaperStore();
  const { currentAssignment } = useAssignmentStore();

  // Connect socket and join room for this assignment
  useSocket(id);

  // Fetch assignment data on mount
  useEffect(() => {
    if (id) fetchAssignment(id);
  }, [id, fetchAssignment]);

  const isGenerating = status !== 'idle' && status !== 'completed' && status !== 'failed';
  const showProgress = status !== 'idle';
  const showPaper = paper !== null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <Link
        href="/assignments"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Papers
      </Link>

      {/* Loading initial data */}
      {isFetching && !currentAssignment && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      )}

      {/* Assignment heading */}
      {currentAssignment && (
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            {currentAssignment.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {currentAssignment.subject} • Due{' '}
            {currentAssignment.dueDate
              ? new Date(currentAssignment.dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              : 'N/A'}
          </p>
        </div>
      )}

      {/* Progress tracker */}
      {showProgress && (
        <div className="mb-6">
          <GenerationProgress />
        </div>
      )}

      {/* Generated Paper */}
      {showPaper && (
        <PaperView
          paper={paper}
          assignmentTitle={currentAssignment?.title}
          assignmentSubject={currentAssignment?.subject}
          onRegenerate={() => handleRegenerate(id)}
          pdfDownloadUrl={paper.pdfUrl ? getPdfDownloadUrl(id) : undefined}
        />
      )}

      {/* Idle / empty state */}
      {!showProgress && !showPaper && !isFetching && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin-slow text-brand-500 opacity-40" />
          <p className="mt-4 text-sm text-slate-500">
            Waiting for generation to start...
          </p>
        </div>
      )}
    </div>
  );
}
