import { create } from 'zustand';
import { GeneratedPaper } from '../types';

interface PaperState {
  paper: GeneratedPaper | null;
  isLoading: boolean;
}

interface PaperActions {
  setPaper: (paper: GeneratedPaper) => void;
  setLoading: (v: boolean) => void;
  clearPaper: () => void;
}

export const usePaperStore = create<PaperState & PaperActions>((set) => ({
  paper: null,
  isLoading: false,

  setPaper: (paper) => set({ paper, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
  clearPaper: () => set({ paper: null }),
}));
