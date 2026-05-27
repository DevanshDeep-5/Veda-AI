import { create } from 'zustand';
import { SocketEventType } from '../types';

export interface ProgressStep {
  event: SocketEventType;
  label: string;
  progress: number;
}

export const PROGRESS_STEPS: ProgressStep[] = [
  { event: 'job-queued',        label: 'Request Queued',      progress: 5  },
  { event: 'generation-started', label: 'Starting Generation', progress: 10 },
  { event: 'ai-processing',     label: 'AI Processing',       progress: 50 },
  { event: 'parsing-output',    label: 'Parsing Output',      progress: 65 },
  { event: 'pdf-generating',    label: 'Generating PDF',      progress: 80 },
  { event: 'completed',         label: 'Completed',           progress: 100 },
];

interface GenerationState {
  status: SocketEventType | 'idle';
  progress: number;
  message: string;
  error: string | null;
  isGenerating: boolean;
}

interface GenerationActions {
  setStatus: (status: SocketEventType) => void;
  setProgress: (progress: number, message: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const defaultState: GenerationState = {
  status: 'idle',
  progress: 0,
  message: '',
  error: null,
  isGenerating: false,
};

export const useGenerationStore = create<GenerationState & GenerationActions>((set) => ({
  ...defaultState,

  setStatus: (status) =>
    set({
      status,
      isGenerating: status !== 'completed' && status !== 'failed',
      error: null,
    }),

  setProgress: (progress, message) => set({ progress, message }),

  setError: (error) =>
    set({
      error,
      status: 'failed',
      isGenerating: false,
    }),

  reset: () => set(defaultState),
}));
