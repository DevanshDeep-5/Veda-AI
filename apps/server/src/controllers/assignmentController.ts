import { Request, Response } from 'express';
import {
  createAssignment,
  findAssignmentById,
  findAllAssignments,
} from '../models/Assignment';
import { findPaperByAssignmentId } from '../models/GeneratedPaper';
import { enqueueAssignmentGeneration } from '../queues/assignmentQueue';
import { emitToAssignment } from '../sockets/socketManager';
import { CreateAssignmentRequest } from '@veda-ai/types';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// ─── Create Assignment ────────────────────────────────────────────────────────
export async function createAssignmentController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = req.body as CreateAssignmentRequest;

    // Validation
    if (!body.title?.trim()) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    if (!body.subject?.trim()) {
      res.status(400).json({ success: false, error: 'Subject is required' });
      return;
    }
    if (!body.questionTypes || body.questionTypes.length === 0) {
      res.status(400).json({ success: false, error: 'At least one question type is required' });
      return;
    }
    if (!body.totalMarks || body.totalMarks <= 0) {
      res.status(400).json({ success: false, error: 'Total marks must be positive' });
      return;
    }
    if (!body.questionCount || body.questionCount <= 0) {
      res.status(400).json({ success: false, error: 'Question count must be positive' });
      return;
    }
    const distSum =
      (body.difficultyDistribution?.easy || 0) +
      (body.difficultyDistribution?.medium || 0) +
      (body.difficultyDistribution?.hard || 0);
    if (Math.abs(distSum - 100) > 1) {
      res.status(400).json({
        success: false,
        error: 'Difficulty distribution must sum to 100%',
      });
      return;
    }

    // Handle uploaded file
    let fileContent: string | undefined;
    if (req.file) {
      try {
        fileContent = fs.readFileSync(req.file.path, 'utf-8');
      } catch {
        // Binary file or unreadable — skip content extraction
        fileContent = undefined;
      }
    }

    // Create assignment in DB
    const assignment = await createAssignment(body);
    logger.info(`Assignment created: ${assignment._id}`);

    // Enqueue generation
    const jobId = await enqueueAssignmentGeneration(assignment._id, fileContent);
    logger.info(`Job enqueued: ${jobId} for assignment ${assignment._id}`);

    // Emit queued event
    emitToAssignment({
      assignmentId: assignment._id,
      event: 'job-queued',
      message: 'Your request has been queued for generation.',
      progress: 5,
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created and queued for generation',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('createAssignment error:', err);
    res.status(500).json({ success: false, error: message });
  }
}

// ─── Get Single Assignment ────────────────────────────────────────────────────
export async function getAssignmentController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await findAssignmentById(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const paper = await findPaperByAssignmentId(id);
    res.json({ success: true, data: { assignment, paper } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('getAssignment error:', err);
    res.status(500).json({ success: false, error: message });
  }
}

// ─── List Assignments ─────────────────────────────────────────────────────────
export async function listAssignmentsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '20'), 10);

    const { data, total } = await findAllAssignments(page, limit);
    res.json({
      success: true,
      data,
      total,
      page,
      limit,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('listAssignments error:', err);
    res.status(500).json({ success: false, error: message });
  }
}

// ─── Regenerate ───────────────────────────────────────────────────────────────
export async function regenerateAssignmentController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await findAssignmentById(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const jobId = await enqueueAssignmentGeneration(id);

    emitToAssignment({
      assignmentId: id,
      event: 'job-queued',
      message: 'Regeneration request queued.',
      progress: 5,
    });

    res.json({
      success: true,
      message: 'Regeneration queued',
      jobId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('regenerateAssignment error:', err);
    res.status(500).json({ success: false, error: message });
  }
}

// ─── Download PDF ─────────────────────────────────────────────────────────────
export async function downloadPdfController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const paper = await findPaperByAssignmentId(id);

    if (!paper || !paper.pdfUrl) {
      res.status(404).json({ success: false, error: 'PDF not found' });
      return;
    }

    const pdfPath = path.join(process.cwd(), paper.pdfUrl);
    if (!fs.existsSync(pdfPath)) {
      res.status(404).json({ success: false, error: 'PDF file not found on disk' });
      return;
    }

    res.download(pdfPath, `question-paper-${id}.pdf`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('downloadPdf error:', err);
    res.status(500).json({ success: false, error: message });
  }
}
