'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  createAssignment,
  getAssignment,
  listAssignments,
  regenerateAssignment,
  getPdfDownloadUrl,
} from '../services/api';
import { useAssignmentStore } from '../stores/assignmentStore';
import { useGenerationStore } from '../stores/generationStore';
import { usePaperStore } from '../stores/paperStore';
import { Assignment } from '../types';

export function useAssignment() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const { setSubmitting, setCurrentAssignment, toRequest, file } =
    useAssignmentStore();
  const { reset: resetGeneration } = useGenerationStore();
  const { clearPaper, setPaper } = usePaperStore();

  // ── Submit new assignment ─────────────────────────────────────────────────
  const submitAssignment = useCallback(async (): Promise<string | null> => {
    setSubmitting(true);
    resetGeneration();
    clearPaper();

    try {
      const request = toRequest();
      const res = await createAssignment(request, file || undefined);

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create assignment');
      }

      setCurrentAssignment(res.data);
      toast.success('Assignment queued for generation!');
      return res.data._id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      toast.error(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [toRequest, file, setSubmitting, resetGeneration, clearPaper, setCurrentAssignment]);

  // ── Fetch single assignment + paper ────────────────────────────────────────
  const fetchAssignment = useCallback(async (id: string) => {
    setIsFetching(true);
    try {
      const res = await getAssignment(id);
      if (res.success && res.data) {
        setCurrentAssignment(res.data.assignment);
        if (res.data.paper) setPaper(res.data.paper);
      }
    } catch {
      toast.error('Failed to load assignment');
    } finally {
      setIsFetching(false);
    }
  }, [setCurrentAssignment, setPaper]);

  // ── Fetch all assignments ─────────────────────────────────────────────────
  const fetchAssignments = useCallback(async (page = 1) => {
    setIsFetching(true);
    try {
      const res = await listAssignments(page, 20);
      setAssignments(res.data);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // ── Regenerate ────────────────────────────────────────────────────────────
  const handleRegenerate = useCallback(async (id: string) => {
    resetGeneration();
    clearPaper();
    try {
      await regenerateAssignment(id);
      toast.success('Regeneration queued!');
    } catch {
      toast.error('Failed to queue regeneration');
    }
  }, [resetGeneration, clearPaper]);

  return {
    assignments,
    total,
    isFetching,
    submitAssignment,
    fetchAssignment,
    fetchAssignments,
    handleRegenerate,
    getPdfDownloadUrl,
  };
}
