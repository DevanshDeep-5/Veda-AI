'use client';

import { Question } from '../../types';
import DifficultyBadge from './DifficultyBadge';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: Question;
  showAnswerSpace?: boolean;
  className?: string;
}

const typeLabel: Record<string, string> = {
  mcq:            'MCQ',
  'short-answer': 'Short Answer',
  'long-answer':  'Long Answer',
};

export default function QuestionCard({
  question,
  showAnswerSpace = false,
  className,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-border bg-surface-secondary p-5 transition-all hover:border-surface-border-light hover:shadow-card',
        className
      )}
    >
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Question number */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-xs font-bold text-brand-400">
            {question.questionNumber}
          </span>
          {/* Question text */}
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            {question.text}
          </p>
        </div>
        {/* Marks */}
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-white">{question.marks}</span>
          <p className="text-xs text-slate-500">
            {question.marks === 1 ? 'mark' : 'marks'}
          </p>
        </div>
      </div>

      {/* MCQ Options */}
      {question.type === 'mcq' && question.options && question.options.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-start gap-2 rounded-lg border border-surface-border bg-surface/50 px-3 py-2"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
                {opt.label}
              </span>
              <span className="text-sm text-slate-300">{opt.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer space */}
      {showAnswerSpace && question.type === 'short-answer' && (
        <div className="mt-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 w-full rounded border-b border-dashed border-surface-border-light" />
          ))}
        </div>
      )}
      {showAnswerSpace && question.type === 'long-answer' && (
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-full rounded border-b border-dashed border-surface-border-light" />
          ))}
        </div>
      )}

      {/* Footer badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={question.difficulty} />
        <span className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-300">
          {typeLabel[question.type] || question.type}
        </span>
      </div>
    </div>
  );
}
