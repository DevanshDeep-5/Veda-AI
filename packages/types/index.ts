// ─── Question Types ────────────────────────────────────────────────────────────
export type QuestionType = 'mcq' | 'short-answer' | 'long-answer';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed';

// ─── Assignment ────────────────────────────────────────────────────────────────
export interface DifficultyDistribution {
  easy: number;   // percentage 0-100
  medium: number;
  hard: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;           // ISO date string
  instructions: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  questionCount: number;
  difficultyDistribution: DifficultyDistribution;
  status: AssignmentStatus;
  fileUrl?: string;
  fileOriginalName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  subject: string;
  dueDate: string;
  instructions?: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  questionCount: number;
  difficultyDistribution: DifficultyDistribution;
}

// ─── Generated Paper ──────────────────────────────────────────────────────────
export interface MCQOption {
  label: string;  // A, B, C, D
  text: string;
}

export interface Question {
  questionNumber: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
  options?: MCQOption[];    // for MCQ only
}

export interface Section {
  title: string;            // e.g. "Section A"
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  title: string;
  sections: Section[];
  pdfUrl?: string;
  generatedAt: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export type SocketEventType =
  | 'job-queued'
  | 'generation-started'
  | 'ai-processing'
  | 'parsing-output'
  | 'pdf-generating'
  | 'completed'
  | 'failed';

export interface SocketEvent {
  assignmentId: string;
  event: SocketEventType;
  message: string;
  progress: number;         // 0-100
  paper?: GeneratedPaper;
  error?: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
