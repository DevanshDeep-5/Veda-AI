import { ObjectId, WithId, Document } from 'mongodb';
import { getDB } from '../config/db';
import {
  Assignment,
  AssignmentStatus,
  CreateAssignmentRequest,
} from '@veda-ai/types';

export const ASSIGNMENTS_COLLECTION = 'assignments';

export interface AssignmentDocument extends Omit<Assignment, '_id'> {
  _id?: ObjectId;
}

export async function getAssignmentsCollection() {
  const db = getDB();
  return db.collection<AssignmentDocument>(ASSIGNMENTS_COLLECTION);
}

export function toAssignment(doc: WithId<Document>): Assignment {
  const d = doc as WithId<AssignmentDocument>;
  return {
    ...d,
    _id: d._id.toString(),
  } as Assignment;
}

export async function createAssignment(
  data: CreateAssignmentRequest
): Promise<Assignment> {
  const col = await getAssignmentsCollection();
  const now = new Date().toISOString();
  const doc: AssignmentDocument = {
    ...data,
    instructions: data.instructions || '',
    status: 'draft' as AssignmentStatus,
    createdAt: now,
    updatedAt: now,
  };
  const result = await col.insertOne(doc as any);
  return toAssignment({ ...doc, _id: result.insertedId } as any);
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus
): Promise<void> {
  const col = await getAssignmentsCollection();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );
}

export async function findAssignmentById(id: string): Promise<Assignment | null> {
  const col = await getAssignmentsCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return toAssignment(doc as any);
}

export async function findAllAssignments(
  page: number = 1,
  limit: number = 20
): Promise<{ data: Assignment[]; total: number }> {
  const col = await getAssignmentsCollection();
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    col.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments({}),
  ]);
  return { data: docs.map((d) => toAssignment(d as any)), total };
}
