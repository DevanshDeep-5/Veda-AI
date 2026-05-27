'use client';

import { CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import { useGenerationStore, PROGRESS_STEPS } from '../../stores/generationStore';
import { cn } from '../../lib/utils';

export default function GenerationProgress() {
  const { status, progress, message, error, isGenerating } = useGenerationStore();

  if (status === 'idle') return null;

  const currentStepIdx = PROGRESS_STEPS.findIndex((s) => s.event === status);
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  return (
    <div className="animate-fade-in rounded-2xl border border-surface-border bg-surface-secondary p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isGenerating && (
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          )}
          {isCompleted && (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          {isFailed && (
            <XCircle className="h-5 w-5 text-rose-400" />
          )}
          <h3 className="text-base font-semibold text-white">
            {isCompleted ? 'Generation Complete!' : isFailed ? 'Generation Failed' : 'Generating Your Paper...'}
          </h3>
        </div>
        <span className="text-sm font-semibold text-brand-400">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isFailed
              ? 'bg-rose-500'
              : isCompleted
              ? 'bg-emerald-500'
              : 'bg-brand-gradient'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {PROGRESS_STEPS.map((step, idx) => {
          const isPast    = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isFuture  = idx > currentStepIdx;

          return (
            <div
              key={step.event}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300',
                isCurrent && !isFailed && 'bg-brand-500/10'
              )}
            >
              {/* Icon */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {isFailed && isCurrent ? (
                  <XCircle className="h-5 w-5 text-rose-400" />
                ) : isPast || (isCompleted && isCurrent) ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-600" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  isPast || (isCompleted && isCurrent)
                    ? 'text-emerald-400'
                    : isCurrent && !isFailed
                    ? 'text-white'
                    : isFailed && isCurrent
                    ? 'text-rose-400'
                    : 'text-slate-600'
                )}
              >
                {step.label}
              </span>

              {/* Current status message */}
              {isCurrent && message && (
                <span className="text-xs text-slate-500 hidden sm:block max-w-[200px] truncate">
                  {message}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Status message */}
      {message && !isFailed && (
        <p className="mt-4 text-center text-xs text-slate-500">{message}</p>
      )}
    </div>
  );
}
