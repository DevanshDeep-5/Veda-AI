import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SocketEvent, SocketEventType } from '@veda-ai/types';
import logger from '../utils/logger';

let io: SocketServer;

export function initSocketIO(httpServer: HttpServer, frontendUrl: string): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Client joins a room for a specific assignment
    socket.on('join-assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      logger.info(`Socket ${socket.id} joined room assignment:${assignmentId}`);
    });

    socket.on('leave-assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitToAssignment(payload: SocketEvent): void {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit event');
    return;
  }
  io.to(`assignment:${payload.assignmentId}`).emit('assignment-progress', payload);
  logger.debug(`Emitted ${payload.event} to assignment:${payload.assignmentId}`);
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
