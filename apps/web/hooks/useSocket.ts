'use client';

import { useEffect, useRef } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinAssignmentRoom,
  leaveAssignmentRoom,
} from '../sockets/socketClient';
import { useSocketStore } from '../stores/socketStore';

export function useSocket(assignmentId?: string) {
  const isConnected = useSocketStore((s) => s.isConnected);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      connectSocket();
      mountedRef.current = true;
    }
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (assignmentId && isConnected) {
      joinAssignmentRoom(assignmentId);
      return () => leaveAssignmentRoom(assignmentId);
    }
  }, [assignmentId, isConnected]);

  return { isConnected };
}
