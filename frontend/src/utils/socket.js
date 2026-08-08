import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket) socket.disconnect();
  const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
