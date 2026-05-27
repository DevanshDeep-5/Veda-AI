import openai from '../config/openai';
import {
  safeValidatePaperOutput,
  ValidatedPaper,
} from '../schemas/paperSchema';
import { Assignment, QuestionType } from '@veda-ai/types';
import logger from '../utils/logger';

const MAX_RETRIES = 3;

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are an expert academic assessment designer. Your task is to generate a structured question paper in STRICT valid JSON format.

RULES:
1. Output ONLY valid JSON — no markdown, no code fences, no commentary.
2. Follow the EXACT schema provided.
3. Distribute questions across sections based on type.
4. Respect the difficulty distribution percentages precisely.
5. Allocate marks proportionally by difficulty: easy questions get fewer marks, hard questions get more.
6. For MCQ questions, always include exactly 4 options labeled A, B, C, D.
7. Questions must be academically rigorous and relevant to the subject.
8. Each section must have a clear instruction string.
9. Question numbers must be sequential starting from 1 within each section.`;
}

function buildQuestionTypeInstructions(types: QuestionType[]): string {
  const descriptions: Record<QuestionType, string> = {
    mcq: 'Multiple Choice Questions (MCQ) — 4 options each labeled A, B, C, D',
    'short-answer': 'Short Answer Questions — expecting 2-4 sentence answers',
    'long-answer': 'Long Answer / Essay Questions — expecting detailed paragraph answers',
  };
  return types.map((t) => `- ${descriptions[t]}`).join('\n');
}

function buildUserPrompt(assignment: Assignment, fileContent?: string): string {
  const { title, subject, questionCount, totalMarks, difficultyDistribution, questionTypes, instructions } = assignment;

  const easyCount = Math.round((difficultyDistribution.easy / 100) * questionCount);
  const mediumCount = Math.round((difficultyDistribution.medium / 100) * questionCount);
  const hardCount = questionCount - easyCount - mediumCount;

  const easyMarks = Math.round((difficultyDistribution.easy / 100) * totalMarks * 0.6);
  const mediumMarks = Math.round((difficultyDistribution.medium / 100) * totalMarks * 0.8);
  const hardMarks = totalMarks - easyMarks - mediumMarks;

  const sections = questionTypes
    .map((type, idx) => {
      const sectionLetter = String.fromCharCode(65 + idx);
      const count = Math.ceil(questionCount / questionTypes.length);
      return `Section ${sectionLetter}: ${type.toUpperCase()} (approximately ${count} questions)`;
    })
    .join('\n');

  return `Generate a complete question paper for the following assignment:

ASSIGNMENT DETAILS:
- Title: ${title}
- Subject: ${subject}
- Total Questions: ${questionCount}
- Total Marks: ${totalMarks}
- Question Types: ${questionTypes.join(', ')}
- Special Instructions: ${instructions || 'None'}

DIFFICULTY DISTRIBUTION:
- Easy: ${difficultyDistribution.easy}% (approximately ${easyCount} questions, ~${easyMarks} marks total)
- Medium: ${difficultyDistribution.medium}% (approximately ${mediumCount} questions, ~${mediumMarks} marks total)
- Hard: ${difficultyDistribution.hard}% (approximately ${hardCount} questions, ~${hardMarks} marks total)

QUESTION TYPES TO USE:
${buildQuestionTypeInstructions(questionTypes)}

SECTIONS STRUCTURE:
${sections}

${fileContent ? `STUDY MATERIAL / CONTEXT:\n${fileContent.substring(0, 3000)}\n` : ''}

REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "title": "${title}",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries [X] marks.",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Full question text here",
          "difficulty": "easy",
          "marks": 2,
          "type": "mcq",
          "options": [
            { "label": "A", "text": "Option text" },
            { "label": "B", "text": "Option text" },
            { "label": "C", "text": "Option text" },
            { "label": "D", "text": "Option text" }
          ]
        }
      ]
    }
  ]
}

Generate ${questionCount} questions totalling exactly ${totalMarks} marks. Output ONLY the JSON object, nothing else.`;
}

// ─── AI Generation with Retry ─────────────────────────────────────────────────
export async function generateQuestionPaper(
  assignment: Assignment,
  fileContent?: string,
  onProgress?: (step: string) => void
): Promise<ValidatedPaper> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`AI generation attempt ${attempt}/${MAX_RETRIES} for assignment ${assignment._id}`);
      onProgress?.(`Calling OpenAI (attempt ${attempt})...`);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(assignment, fileContent) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096,
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      logger.debug('Raw AI response received, validating...');
      onProgress?.('Validating AI output...');

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error(`Invalid JSON from OpenAI: ${rawContent.substring(0, 200)}`);
      }

      // Validate with Zod
      const validation = safeValidatePaperOutput(parsed);
      if (!validation.success) {
        throw new Error(`Schema validation failed: ${validation.error}`);
      }

      logger.info(`AI generation succeeded on attempt ${attempt}`);
      return validation.data;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      logger.warn(`AI generation attempt ${attempt} failed: ${lastError}`);

      if (attempt < MAX_RETRIES) {
        // Wait before retry: exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw new Error(`AI generation failed after ${MAX_RETRIES} attempts. Last error: ${lastError}`);
}
