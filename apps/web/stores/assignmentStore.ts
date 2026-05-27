import { create } from 'zustand';
import { Assignment, CreateAssignmentRequest, QuestionType, DifficultyDistribution } from '../types';

interface AssignmentFormState {
  title: string;
  subject: string;
  dueDate: string;
  instructions: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  questionCount: number;
  difficultyDistribution: DifficultyDistribution;
  file: File | null;
  isSubmitting: boolean;
  currentAssignment: Assignment | null;
}

interface AssignmentActions {
  setField: <K extends keyof AssignmentFormState>(key: K, value: AssignmentFormState[K]) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setDifficulty: (distribution: DifficultyDistribution) => void;
  setFile: (file: File | null) => void;
  setSubmitting: (v: boolean) => void;
  setCurrentAssignment: (a: Assignment | null) => void;
  resetForm: () => void;
  toRequest: () => CreateAssignmentRequest;
}

const defaultState: AssignmentFormState = {
  title: '',
  subject: '',
  dueDate: '',
  instructions: '',
  questionTypes: ['mcq'],
  totalMarks: 50,
  questionCount: 10,
  difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
  file: null,
  isSubmitting: false,
  currentAssignment: null,
};

export const useAssignmentStore = create<AssignmentFormState & AssignmentActions>((set, get) => ({
  ...defaultState,

  setField: (key, value) => set({ [key]: value } as any),

  toggleQuestionType: (type) => {
    const types = get().questionTypes;
    set({
      questionTypes: types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type],
    });
  },

  setDifficulty: (distribution) => set({ difficultyDistribution: distribution }),

  setFile: (file) => set({ file }),

  setSubmitting: (v) => set({ isSubmitting: v }),

  setCurrentAssignment: (a) => set({ currentAssignment: a }),

  resetForm: () => set(defaultState),

  toRequest: (): CreateAssignmentRequest => {
    const s = get();
    return {
      title: s.title,
      subject: s.subject,
      dueDate: s.dueDate,
      instructions: s.instructions,
      questionTypes: s.questionTypes,
      totalMarks: s.totalMarks,
      questionCount: s.questionCount,
      difficultyDistribution: s.difficultyDistribution,
    };
  },
}));
