import axios from 'axios';
import {
  Assignment,
  CreateAssignmentRequest,
  GeneratedPaper,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

// ─── Assignments ──────────────────────────────────────────────────────────────
export async function createAssignment(
  data: CreateAssignmentRequest,
  file?: File
): Promise<ApiResponse<Assignment>> {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  });
  if (file) form.append('file', file);

  const res = await api.post<ApiResponse<Assignment>>('/assignments/create', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getAssignment(
  id: string
): Promise<ApiResponse<{ assignment: Assignment; paper: GeneratedPaper | null }>> {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
}

export async function listAssignments(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Assignment>> {
  const res = await api.get('/assignments', { params: { page, limit } });
  return res.data;
}

export async function regenerateAssignment(id: string): Promise<ApiResponse<{ jobId: string }>> {
  const res = await api.post(`/assignments/${id}/regenerate`);
  return res.data;
}

export function getPdfDownloadUrl(id: string): string {
  return `${API_URL}/assignments/${id}/pdf`;
}
