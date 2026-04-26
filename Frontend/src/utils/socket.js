import { io } from "socket.io-client";

let socket;

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL;
  return url.replace("/api", "");
};

export const initSocket = (token) => {
  if (!socket) {
    socket = io(getBaseURL(), {
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;
