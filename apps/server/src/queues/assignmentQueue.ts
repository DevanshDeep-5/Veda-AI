import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const ASSIGNMENT_QUEUE_NAME = 'assignment-generation';

export interface AssignmentJobData {
  assignmentId: string;
  fileContent?: string;
}

export const assignmentQueue = new Queue<AssignmentJobData>(
  ASSIGNMENT_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  }
);

export async function enqueueAssignmentGeneration(
  assignmentId: string,
  fileContent?: string
): Promise<string> {
  const job = await assignmentQueue.add(
    'generate',
    { assignmentId, fileContent },
    {
      jobId: `gen-${assignmentId}-${Date.now()}`,
    }
  );
  return job.id || assignmentId;
}
