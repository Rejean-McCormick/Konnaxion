import { useEffect } from "react";
import { io } from "socket.io-client";

export default function useLivePoll(id: string) {
  useEffect(() => {
    const socket = io(`/api/poll/${id}`);
    // ... listen to events
    return () => {
      socket.disconnect();
    };
  }, [id]);
}
