import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  currentRoom: string | null;
}

interface SocketActions {
  setConnected: (v: boolean) => void;
  setCurrentRoom: (room: string | null) => void;
}

export const useSocketStore = create<SocketState & SocketActions>((set) => ({
  isConnected: false,
  currentRoom: null,

  setConnected: (v) => set({ isConnected: v }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
}));
