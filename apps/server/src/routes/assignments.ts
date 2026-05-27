import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createAssignmentController,
  getAssignmentController,
  listAssignmentsController,
  regenerateAssignmentController,
  downloadPdfController,
} from '../controllers/assignmentController';

const router = Router();

// ─── Multer Upload Config ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, '/tmp/veda-uploads');
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, DOC, DOCX files are allowed'));
    }
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/create', upload.single('file'), createAssignmentController);
router.get('/', listAssignmentsController);
router.get('/:id', getAssignmentController);
router.post('/:id/regenerate', regenerateAssignmentController);
router.get('/:id/pdf', downloadPdfController);

export default router;
