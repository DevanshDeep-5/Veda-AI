import { z } from 'zod';

// ─── MCQ Option Schema ────────────────────────────────────────────────────────
const MCQOptionSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1),
});

// ─── Question Schema ──────────────────────────────────────────────────────────
const QuestionSchema = z.object({
  questionNumber: z.number().int().positive(),
  text: z.string().min(1, 'Question text cannot be empty'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().positive(),
  type: z.enum(['mcq', 'short-answer', 'long-answer']),
  options: z.array(MCQOptionSchema).optional(),
});

// ─── Section Schema ───────────────────────────────────────────────────────────
const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

// ─── Full Paper Schema ────────────────────────────────────────────────────────
export const GeneratedPaperSchema = z.object({
  title: z.string().min(1, 'Paper title is required'),
  sections: z.array(SectionSchema).min(1, 'At least one section is required'),
});

export type ValidatedPaper = z.infer<typeof GeneratedPaperSchema>;

// ─── Validation Helper ────────────────────────────────────────────────────────
export function validatePaperOutput(raw: unknown): ValidatedPaper {
  return GeneratedPaperSchema.parse(raw);
}

export function safeValidatePaperOutput(raw: unknown):
  | { success: true; data: ValidatedPaper }
  | { success: false; error: string } {
  const result = GeneratedPaperSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const formatted = result.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  return { success: false, error: formatted };
}
