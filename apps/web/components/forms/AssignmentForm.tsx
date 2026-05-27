'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Upload,
  Calendar,
  X,
  Plus,
  Mic,
  ChevronDown,
  Loader2,
  Check,
  BookOpen,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAssignmentStore } from '../../stores/assignmentStore';
import { useAssignment } from '../../hooks/useAssignment';
import { QuestionType } from '../../types';
import toast from 'react-hot-toast';

// ─── Initial Dynamic Rows (Matching Screen 3) ──────────────────────────────────
interface QuestionRow {
  id: string;
  type: QuestionType;
  label: string; // Display label
  count: number;
  marks: number;
}

const DEFAULT_ROWS: QuestionRow[] = [
  { id: '1', type: 'mcq', label: 'Multiple Choice Questions', count: 4, marks: 1 },
  { id: '2', type: 'short-answer', label: 'Short Questions', count: 3, marks: 2 },
  { id: '3', type: 'long-answer', label: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
  { id: '4', type: 'long-answer', label: 'Numerical Problems', count: 5, marks: 5 },
];

export default function AssignmentForm() {
  const router = useRouter();
  const store = useAssignmentStore();
  const { submitAssignment } = useAssignment();

  // Multi-step state: 1 = Basic Info, 2 = Question Config & Material
  const [step, setStep] = useState<1 | 2>(1);

  // Dynamic question type rows
  const [rows, setRows] = useState<QuestionRow[]>(DEFAULT_ROWS);

  // ─── Step 1 Local Fields ───────────────────────────────────────────────────────
  const [title, setTitle] = useState(store.title || 'Mid Term Assessment');
  const [subject, setSubject] = useState(store.subject || 'Electricity & Magnetism');

  // ─── Step 2 Local Fields ───────────────────────────────────────────────────────
  const [dueDate, setDueDate] = useState(store.dueDate || '2025-06-21');
  const [additionalInfo, setAdditionalInfo] = useState(store.instructions || '');

  // Calculate Aggregated Totals
  const totalQuestions = rows.reduce((sum, r) => sum + r.count, 0);
  const totalMarks = rows.reduce((sum, r) => sum + r.count * r.marks, 0);

  // ─── Counters logic ──────────────────────────────────────────────────────────
  const updateRow = (id: string, field: 'count' | 'marks', delta: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newVal = Math.max(0, r[field] + delta);
          return { ...r, [field]: newVal };
        }
        return r;
      })
    );
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addRow = () => {
    const newId = String(Date.now());
    const newRow: QuestionRow = {
      id: newId,
      type: 'short-answer',
      label: 'New Question Category',
      count: 5,
      marks: 2,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleRowTypeChange = (id: string, type: QuestionType, label: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, type, label } : r))
    );
  };

  // ─── File Ingestion ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      store.setFile(selectedFile);
      toast.success(`Attached ${selectedFile.name}`);
    }
  };

  // ─── Multi-step Navigation ────────────────────────────────────────────────────
  const handleNextStep = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    // Sync to store
    store.setField('title', title);
    store.setField('subject', subject);
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  // ─── Core Submit Handler ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dueDate) {
      toast.error('Please specify a due date');
      return;
    }

    if (rows.length === 0) {
      toast.error('Add at least one question type row');
      return;
    }

    // Sync all aggregated data into Zustand store
    store.setField('dueDate', dueDate);
    store.setField('instructions', additionalInfo);
    store.setField('questionCount', totalQuestions);
    store.setField('totalMarks', totalMarks);
    
    // Extract unique question types list
    const uniqueTypes = Array.from(new Set(rows.map((r) => r.type)));
    store.setField('questionTypes', uniqueTypes);

    const generatedId = await submitAssignment();
    if (generatedId) {
      router.push(`/assignments/${generatedId}`);
    }
  };

  const isSubmitting = store.isSubmitting;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* ── Progress Stepper (Figma Screen 3) ─────────────────────────────────── */}
      <div className="mb-10">
        <div className="relative h-1 w-full rounded-full bg-[#e5e5e5]">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#2d2d2d] transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#707070]">
          <span className={step === 1 ? 'text-[#2d2d2d]' : 'text-[#707070] flex items-center gap-1'}>
            {step === 2 && <Check className="h-3.5 w-3.5 text-[#22c55e]" />}
            1. Basic Information
          </span>
          <span className={step === 2 ? 'text-[#2d2d2d]' : ''}>
            2. Assignment Details
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[#2d2d2d]">
          {step === 1 ? 'Configure Basic Details' : 'Create Assignment'}
        </h1>
        <p className="mt-1 text-xs font-semibold text-[#707070]">
          {step === 1
            ? 'Set the name and main subject area of this evaluation.'
            : 'Set up a new assignment for your students'}
        </p>
      </div>

      {/* ─── STEP 1: BASIC DETAILS ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#e5e5e5] space-y-6">
          <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-4 mb-6">
            <BookOpen className="h-5 w-5 text-[#e05a36]" />
            <h3 className="text-lg font-black text-[#2d2d2d]">Assignment Parameters</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#707070] uppercase">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Mid Term Exam"
                className="h-12 w-full rounded-2xl border border-[#e5e5e5] bg-white px-4 text-sm font-semibold text-[#2d2d2d] placeholder-[#c1c1c1] outline-none focus:border-[#e05a36]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[#707070] uppercase">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Newtonian Mechanics"
                className="h-12 w-full rounded-2xl border border-[#e5e5e5] bg-white px-4 text-sm font-semibold text-[#2d2d2d] placeholder-[#c1c1c1] outline-none focus:border-[#e05a36]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3 text-xs font-black text-white hover:bg-black active:scale-95 transition-all shadow-md"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: FIGMA FORM VIEW (Screen 3) ─────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-[#e5e5e5]">
            <h2 className="text-lg font-black text-[#2d2d2d] mb-1">
              Assignment Details
            </h2>
            <p className="text-[11px] font-bold text-[#707070] mb-6">
              Basic information about your assignment
            </p>

            {/* Drag & Drop File Upload */}
            <div className="mb-6">
              <div className="group relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] py-10 text-center transition-all hover:bg-gray-50/50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={isSubmitting}
                />
                
                {/* Visual Icon */}
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-[#f0f0f0]">
                  <Upload className="h-5 w-5 text-[#707070]" />
                </div>

                <p className="text-xs font-black text-[#2d2d2d]">
                  {store.file ? store.file.name : 'Choose a file or drag & drop it here'}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-[#c1c1c1]">
                  JPEG, PNG, upto 10MB
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-full border border-[#e5e5e5] bg-white px-5 py-2 text-[10px] font-black text-[#2d2d2d] shadow-sm hover:bg-[#f9f9f9]"
                >
                  Browse Files
                </button>
              </div>
              <p className="mt-2 text-[10px] font-bold text-center text-[#707070]">
                Upload images of your preferred document/image
              </p>
            </div>

            {/* Due Date Field */}
            <div className="mb-8 space-y-2">
              <label className="text-xs font-black text-[#2d2d2d]">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#e5e5e5] bg-white px-4 text-xs font-bold text-[#2d2d2d] outline-none focus:border-[#e05a36] shadow-sm"
                  disabled={isSubmitting}
                />
                <Calendar className="absolute right-4 top-3.5 h-4.5 w-4.5 pointer-events-none text-[#707070]" />
              </div>
            </div>

            {/* Question Type Rows (Dynamic Counter grid) */}
            <div className="mb-8 space-y-4">
              <div className="grid grid-cols-12 gap-3 text-xs font-black text-[#707070] px-4">
                <div className="col-span-6">Question Type</div>
                <div className="col-span-3 text-center">No. of Questions</div>
                <div className="col-span-3 text-center">Marks</div>
              </div>

              {/* Rows List */}
              <div className="space-y-3">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 gap-3 items-center rounded-2xl bg-[#fafafa] p-3 border border-[#f0f0f0]"
                  >
                    {/* Question Type Dropdown selector */}
                    <div className="col-span-6 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        disabled={isSubmitting}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#707070] hover:bg-[#e5e5e5] hover:text-[#2d2d2d]"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Dropdown Input Selector */}
                      <div className="relative flex-1">
                        <select
                          value={row.type}
                          onChange={(e) => {
                            const val = e.target.value as QuestionType;
                            const label =
                              val === 'mcq'
                                ? 'Multiple Choice Questions'
                                : val === 'short-answer'
                                ? 'Short Questions'
                                : 'Long Questions';
                            handleRowTypeChange(row.id, val, label);
                          }}
                          className="h-11 w-full appearance-none rounded-xl border border-[#e5e5e5] bg-white px-3 pr-8 text-xs font-bold text-[#2d2d2d] outline-none focus:border-[#e05a36]"
                          disabled={isSubmitting}
                        >
                          <option value="mcq">Multiple Choice Questions</option>
                          <option value="short-answer">Short Questions</option>
                          <option value="long-answer">Diagram/Graph-Based Questions</option>
                          <option value="long-answer">Numerical Problems</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 h-3.5 w-3.5 pointer-events-none text-[#707070]" />
                      </div>
                    </div>

                    {/* No. of Questions Counter */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex h-11 items-center gap-3.5 rounded-full border border-[#e5e5e5] bg-white px-3 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateRow(row.id, 'count', -1)}
                          disabled={isSubmitting}
                          className="text-[#707070] font-black text-sm px-1.5 hover:text-black"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#2d2d2d] w-4 text-center">
                          {row.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRow(row.id, 'count', 1)}
                          disabled={isSubmitting}
                          className="text-[#707070] font-black text-sm px-1.5 hover:text-black"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Marks Counter */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex h-11 items-center gap-3.5 rounded-full border border-[#e5e5e5] bg-white px-3 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateRow(row.id, 'marks', -1)}
                          disabled={isSubmitting}
                          className="text-[#707070] font-black text-sm px-1.5 hover:text-black"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#2d2d2d] w-4 text-center">
                          {row.marks}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRow(row.id, 'marks', 1)}
                          disabled={isSubmitting}
                          className="text-[#707070] font-black text-sm px-1.5 hover:text-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Type row button */}
              <button
                type="button"
                onClick={addRow}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d2d2d] text-white hover:bg-black active:scale-90 transition-all shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* calculated summary display */}
            <div className="flex flex-col items-end gap-1.5 border-t border-[#f0f0f0] pt-5 text-right font-black text-[#2d2d2d] text-xs">
              <div>Total Questions : {totalQuestions}</div>
              <div>Total Marks : {totalMarks}</div>
            </div>

            {/* Additional Info Box with Speech Icon */}
            <div className="mt-8 space-y-2">
              <label className="text-xs font-black text-[#2d2d2d]">
                Additional Information (For better output)
              </label>
              <div className="relative">
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  rows={4}
                  className="w-full resize-none rounded-[2rem] border border-[#e5e5e5] bg-[#fafafa] p-5 pr-12 text-xs font-semibold text-[#2d2d2d] placeholder-[#c1c1c1] outline-none focus:border-[#e05a36]"
                  disabled={isSubmitting}
                />
                {/* Voice button */}
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Voice dictation started (Mocked)');
                  }}
                  className="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3] text-[#707070] hover:bg-[#e5e5e5] hover:text-[#2d2d2d] transition-colors"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Footer Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-8 py-3.5 text-xs font-black text-[#2d2d2d] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3.5 text-xs font-black text-white hover:bg-black transition-all active:scale-95 disabled:opacity-60 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Paper
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
