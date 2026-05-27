import { io, Socket } from 'socket.io-client';
import type { SocketEvent } from '../types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

// Lazily import stores at call-time to avoid circular dependency issues in Next.js
async function getStores() {
  const [{ useGenerationStore }, { usePaperStore }, { useSocketStore }] = await Promise.all([
    import('../stores/generationStore'),
    import('../stores/paperStore'),
    import('../stores/socketStore'),
  ]);
  return { useGenerationStore, usePaperStore, useSocketStore };
}

export function connectSocket(): void {
  const s = getSocket();

  s.on('connect', async () => {
    const { useSocketStore } = await getStores();
    useSocketStore.getState().setConnected(true);
  });

  s.on('disconnect', async () => {
    const { useSocketStore } = await getStores();
    useSocketStore.getState().setConnected(false);
  });

  s.on('connect_error', async (err: Error) => {
    console.error('Socket connection error:', err);
    const { useSocketStore } = await getStores();
    useSocketStore.getState().setConnected(false);
  });

  s.on('assignment-progress', async (payload: SocketEvent) => {
    const { useGenerationStore, usePaperStore } = await getStores();

    const { setStatus, setProgress, setError } = useGenerationStore.getState();
    const { setPaper } = usePaperStore.getState();

    setStatus(payload.event);
    setProgress(payload.progress, payload.message);

    if (payload.event === 'completed' && payload.paper) {
      setPaper(payload.paper);
    }

    if (payload.event === 'failed' && payload.error) {
      setError(payload.error);
    }
  });

  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
    // Sync store
    import('../stores/socketStore').then(({ useSocketStore }) => {
      useSocketStore.getState().setConnected(false);
    });
  }
}

export function joinAssignmentRoom(assignmentId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('join-assignment', assignmentId);
  } else {
    s.once('connect', () => s.emit('join-assignment', assignmentId));
  }
}

export function leaveAssignmentRoom(assignmentId: string): void {
  getSocket().emit('leave-assignment', assignmentId);
}
