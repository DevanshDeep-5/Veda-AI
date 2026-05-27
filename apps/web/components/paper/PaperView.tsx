'use client';

import { GeneratedPaper } from '../../types';
import QuestionCard from './QuestionCard';
import { Download, RefreshCw, BookOpen, Calendar, Hash } from 'lucide-react';

interface PaperViewProps {
  paper: GeneratedPaper;
  assignmentTitle?: string;
  assignmentSubject?: string;
  onRegenerate?: () => void;
  pdfDownloadUrl?: string;
}

export default function PaperView({
  paper,
  assignmentTitle,
  assignmentSubject,
  onRegenerate,
  pdfDownloadUrl,
}: PaperViewProps) {
  const totalQuestions = paper.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  const totalMarks = paper.sections.reduce(
    (sum, s) => s.questions.reduce((qs, q) => qs + q.marks, sum),
    0
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Paper header card */}
      <div className="overflow-hidden rounded-2xl border border-brand-500/20 bg-surface-secondary shadow-card">
        {/* Gradient band */}
        <div className="h-2 bg-brand-gradient" />

        <div className="p-6 sm:p-8">
          {/* Title + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                {paper.title}
              </h1>
              {assignmentSubject && (
                <p className="mt-1 text-sm text-slate-400">{assignmentSubject}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-wrap gap-2">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-brand-500/50 hover:text-white active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
              )}
              {pdfDownloadUrl && (
                <a
                  href={pdfDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow hover:scale-105 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-surface-border pt-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BookOpen className="h-4 w-4 text-brand-400" />
              <span>{totalQuestions} Questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Hash className="h-4 w-4 text-brand-400" />
              <span>{totalMarks} Total Marks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4 text-brand-400" />
              <span>
                Generated{' '}
                {new Date(paper.generatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Student Info Box */}
        <div className="border-t border-surface-border bg-surface/30 px-6 py-5 sm:px-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Student Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Name', 'Roll Number', 'Section', 'Date'].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-medium text-slate-500">{field}</label>
                <div className="h-8 w-full rounded-md border border-dashed border-surface-border-light bg-surface/50" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      {paper.sections.map((section, sIdx) => (
        <div
          key={sIdx}
          className="animate-slide-up rounded-2xl border border-surface-border bg-surface-secondary overflow-hidden"
          style={{ animationDelay: `${sIdx * 100}ms` }}
        >
          {/* Section header */}
          <div className="flex flex-col gap-1 border-b border-surface-border bg-surface/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">{section.title}</h2>
              <p className="mt-0.5 text-sm italic text-slate-400">{section.instruction}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-400">
                {section.questions.length} Q
              </span>
              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                {section.questions.reduce((s, q) => s + q.marks, 0)} marks
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="divide-y divide-surface-border">
            {section.questions.map((question, qIdx) => (
              <div key={qIdx} className="p-4 sm:p-5">
                <QuestionCard question={question} showAnswerSpace />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
