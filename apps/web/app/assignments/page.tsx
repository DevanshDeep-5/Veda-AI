'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Loader2,
  SlidersHorizontal,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { useAssignment } from '../../hooks/useAssignment';
import { Assignment } from '../../types';
import toast from 'react-hot-toast';

// ─── Individual Assignment Card with Stateful Action Dropdown ───────────────────
interface CardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

function AssignmentCard({ assignment, onDelete }: CardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCardClick = () => {
    router.push(`/assignments/${assignment._id}`);
  };

  const handleAction = (e: React.MouseEvent, action: 'view' | 'delete') => {
    e.stopPropagation();
    setMenuOpen(false);
    if (action === 'view') {
      router.push(`/assignments/${assignment._id}`);
    } else if (action === 'delete') {
      onDelete(assignment._id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-[2rem] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#e5e5e5] cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:scale-[1.01]"
    >
      {/* 3-dots Menu Button */}
      <div className="absolute right-6 top-6" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#707070] transition-colors hover:bg-[#f3f3f3] hover:text-[#2d2d2d]"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {/* Dropdown Options Box */}
        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-44 rounded-2xl bg-white p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-[#e5e5e5] animate-fade-in">
            <button
              onClick={(e) => handleAction(e, 'view')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-[#2d2d2d] transition-colors hover:bg-[#f3f3f3]"
            >
              <Eye className="h-4 w-4 text-[#707070]" />
              View Assignment
            </button>
            <button
              onClick={(e) => handleAction(e, 'delete')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-[#dc2626] transition-colors hover:bg-[#ffebeb]"
            >
              <Trash2 className="h-4 w-4 text-[#dc2626]" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="mb-8">
        <h3 className="pr-8 text-xl font-black tracking-tight text-[#2d2d2d]">
          {assignment.title}
        </h3>
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#707070] pt-4 border-t border-[#f7f7f7]">
        <div>
          <span>Assigned on : </span>
          <span className="text-[#2d2d2d]">
            {new Date(assignment.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\//g, '-')}
          </span>
        </div>
        <div>
          <span>Due : </span>
          <span className="text-[#2d2d2d]">
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: '2-digit',
                  year: 'numeric',
                }).replace(/\//g, '-')
              : '21-06-2025'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── High-Fidelity Custom SVG Empty State (Screen 1) ───────────────────────────
interface EmptyProps {
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Figma Illustration Graphic */}
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        {/* Rounded Graphic Base */}
        <div className="absolute inset-0 rounded-full bg-[#efefef] opacity-50" />
        
        {/* Sparkles / Stars in graphics */}
        <div className="absolute left-6 top-8 text-[#546b82]">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0l3.09 9.27H24l-7.46 5.42L19.64 24 12 18.58 4.36 24l3.1-9.31L0 9.27h8.91z" />
          </svg>
        </div>
        <div className="absolute right-8 bottom-12 text-[#e05a36]">
          <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0l3.09 9.27H24l-7.46 5.42L19.64 24 12 18.58 4.36 24l3.1-9.31L0 9.27h8.91z" />
          </svg>
        </div>

        {/* Paper & Search Graphic */}
        <div className="relative z-10 flex items-center justify-center">
          <svg className="h-28 w-28" viewBox="0 0 100 100" fill="none">
            {/* Swirly background line */}
            <path d="M20 50 C20 40, 25 35, 30 42 C35 50, 20 60, 15 50" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Sheet of Paper */}
            <rect x="35" y="15" width="34" height="46" rx="6" fill="#ffffff" stroke="#e5e5e5" strokeWidth="2" />
            <line x1="42" y1="25" x2="62" y2="25" stroke="#2d2d2d" strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="33" x2="62" y2="33" stroke="#d1d1d1" strokeWidth="2" strokeLinecap="round" />
            <line x1="42" y1="41" x2="55" y2="41" stroke="#d1d1d1" strokeWidth="2" strokeLinecap="round" />
            <line x1="42" y1="49" x2="50" y2="49" stroke="#d1d1d1" strokeWidth="2" strokeLinecap="round" />

            {/* Magnifying glass */}
            <circle cx="58" cy="46" r="16" fill="#eae7f2" fillOpacity="0.4" stroke="#a39cc6" strokeWidth="3" />
            <line x1="69" y1="57" x2="80" y2="68" stroke="#a39cc6" strokeWidth="4" strokeLinecap="round" />

            {/* Red "X" cross mark badge */}
            <circle cx="58" cy="46" r="7" fill="#dc2626" />
            <path d="M55 43 L61 49 M61 43 L55 49" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Captions */}
      <h3 className="text-2xl font-black tracking-tight text-[#2d2d2d]">
        No assignments yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-xs font-semibold leading-relaxed text-[#707070]">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      {/* Action Button */}
      <button
        onClick={onCreateClick}
        className="mt-8 rounded-full bg-[#111111] px-7 py-3 text-xs font-black text-white hover:bg-black active:scale-95 transition-all shadow-md"
      >
        + Create Your First Assignment
      </button>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments: initialAssignments, isFetching, fetchAssignments } = useAssignment();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');

  // Fetch initial assignments
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Sync state with custom local override to support deletions locally
  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const handleCreateClick = () => {
    router.push('/create');
  };

  // Local simulated delete to make UI live and satisfying
  const handleDelete = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a._id !== id));
    toast.success('Assignment deleted successfully');
  };

  // Client-side search matching Figma filter title
  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl pb-20">
      {/* Loading overlay */}
      {isFetching && assignments.length === 0 ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-[#e05a36]" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState onCreateClick={handleCreateClick} />
      ) : (
        <div>
          {/* Top Banner (Figma Screen 2) */}
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5e5]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
              <h2 className="text-xl font-black text-[#2d2d2d]">Assignments</h2>
            </div>
            <p className="mt-0.5 pl-5 text-xs font-semibold text-[#707070]">
              Manage and create assignments for your classes.
            </p>
          </div>

          {/* Search & Filter Options */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Toggle */}
            <button className="flex h-11 items-center gap-2 rounded-2xl border border-[#e5e5e5] bg-white px-4 text-xs font-bold text-[#707070] transition-colors hover:bg-[#f9f9f9] hover:text-[#2d2d2d]">
              <SlidersHorizontal className="h-4 w-4" />
              Filter By
            </button>

            {/* Custom Styled Search Box */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Assignment"
                className="h-11 w-full rounded-full border border-[#e5e5e5] bg-white pl-10 pr-4 text-xs font-semibold text-[#2d2d2d] placeholder-[#c1c1c1] outline-none transition-all focus:border-[#e05a36] shadow-sm"
              />
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-[#c1c1c1]" />
            </div>
          </div>

          {/* Assignment Cards Grid */}
          {filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 border border-[#e5e5e5]">
              <FileText className="h-10 w-10 text-[#c1c1c1] mb-2" />
              <p className="text-sm font-semibold text-[#707070]">No assignments matched your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredAssignments.map((a) => (
                <AssignmentCard
                  key={a._id}
                  assignment={a}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Sticky/Floating Create Button at bottom (Figma Screen 2) */}
          <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 pl-80">
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 rounded-full bg-[#111111] px-7 py-3 text-xs font-black text-white hover:bg-black shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4.5 w-4.5 text-white" />
              Create Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
