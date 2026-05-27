import { ObjectId, WithId, Document } from 'mongodb';
import { getDB } from '../config/db';
import { GeneratedPaper } from '@veda-ai/types';

export const PAPERS_COLLECTION = 'generated_papers';

export interface GeneratedPaperDocument extends Omit<GeneratedPaper, '_id'> {
  _id?: ObjectId;
}

export async function getPapersCollection() {
  const db = getDB();
  return db.collection<GeneratedPaperDocument>(PAPERS_COLLECTION);
}

export function toPaper(doc: WithId<Document>): GeneratedPaper {
  const d = doc as WithId<GeneratedPaperDocument>;
  return {
    ...d,
    _id: d._id.toString(),
  } as GeneratedPaper;
}

export async function savePaper(paper: Omit<GeneratedPaper, '_id'>): Promise<GeneratedPaper> {
  const col = await getPapersCollection();
  const result = await col.insertOne(paper as any);
  return toPaper({ ...paper, _id: result.insertedId } as any);
}

export async function findPaperByAssignmentId(
  assignmentId: string
): Promise<GeneratedPaper | null> {
  const col = await getPapersCollection();
  const doc = await col.findOne({ assignmentId });
  if (!doc) return null;
  return toPaper(doc as any);
}

export async function updatePaperPdfUrl(
  assignmentId: string,
  pdfUrl: string
): Promise<void> {
  const col = await getPapersCollection();
  await col.updateOne({ assignmentId }, { $set: { pdfUrl } });
}

export async function deletePaperByAssignmentId(assignmentId: string): Promise<void> {
  const col = await getPapersCollection();
  await col.deleteOne({ assignmentId });
}
