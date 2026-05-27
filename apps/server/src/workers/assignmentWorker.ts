import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import {
  ASSIGNMENT_QUEUE_NAME,
  AssignmentJobData,
} from '../queues/assignmentQueue';
import { findAssignmentById, updateAssignmentStatus } from '../models/Assignment';
import {
  savePaper,
  deletePaperByAssignmentId,
  updatePaperPdfUrl,
} from '../models/GeneratedPaper';
import { generateQuestionPaper } from '../services/aiService';
import { generatePDF } from '../services/pdfService';
import { emitToAssignment } from '../sockets/socketManager';
import { GeneratedPaper } from '@veda-ai/types';
import logger from '../utils/logger';

function emit(
  assignmentId: string,
  event: string,
  message: string,
  progress: number,
  extra?: Partial<GeneratedPaper>
) {
  emitToAssignment({
    assignmentId,
    event: event as any,
    message,
    progress,
    paper: extra as GeneratedPaper | undefined,
  });
}

async function processAssignmentJob(job: Job<AssignmentJobData>): Promise<void> {
  const { assignmentId, fileContent } = job.data;
  logger.info(`Processing assignment job: ${assignmentId}`);

  try {
    // ── Step 1: Mark as generating ─────────────────────────────────────────
    await updateAssignmentStatus(assignmentId, 'generating');
    emit(assignmentId, 'generation-started', 'Generation started...', 10);

    // ── Step 2: Fetch assignment ───────────────────────────────────────────
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // ── Step 3: AI Generation ─────────────────────────────────────────────
    emit(assignmentId, 'ai-processing', 'AI is generating your questions...', 30);

    const validatedPaper = await generateQuestionPaper(
      assignment,
      fileContent,
      (step) => {
        logger.debug(`AI step: ${step}`);
        emit(assignmentId, 'ai-processing', step, 50);
      }
    );

    // ── Step 4: Parse & save ──────────────────────────────────────────────
    emit(assignmentId, 'parsing-output', 'Parsing and saving question paper...', 65);

    // Delete old paper if regenerating
    await deletePaperByAssignmentId(assignmentId);

    const paperData: Omit<GeneratedPaper, '_id'> = {
      assignmentId,
      title: validatedPaper.title,
      sections: validatedPaper.sections,
      generatedAt: new Date().toISOString(),
    };

    const savedPaper = await savePaper(paperData);

    // ── Step 5: PDF Generation ────────────────────────────────────────────
    emit(assignmentId, 'pdf-generating', 'Generating PDF...', 80);

    const pdfUrl = await generatePDF(savedPaper, assignmentId);
    await updatePaperPdfUrl(assignmentId, pdfUrl);
    savedPaper.pdfUrl = pdfUrl;

    // ── Step 6: Complete ──────────────────────────────────────────────────
    await updateAssignmentStatus(assignmentId, 'completed');
    emit(assignmentId, 'completed', 'Your question paper is ready!', 100, savedPaper);

    logger.info(`Assignment ${assignmentId} generation completed successfully`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Assignment ${assignmentId} generation failed: ${errorMessage}`);

    await updateAssignmentStatus(assignmentId, 'failed');
    emitToAssignment({
      assignmentId,
      event: 'failed',
      message: `Generation failed: ${errorMessage}`,
      progress: 0,
      error: errorMessage,
    });

    throw err; // Allow BullMQ to handle retry
  }
}

export function startAssignmentWorker(): Worker<AssignmentJobData> {
  const worker = new Worker<AssignmentJobData>(
    ASSIGNMENT_QUEUE_NAME,
    processAssignmentJob,
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  worker.on('active', (job) => {
    logger.info(`Job ${job.id} started`);

    // Emit queued event when job becomes active
    const { assignmentId } = job.data;
    emit(assignmentId, 'job-queued', 'Job is being processed...', 5);
  });

  logger.info('Assignment worker started');
  return worker;
}
