import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function useLivePoll(id: string) {
  const [poll, setPoll] = useState<unknown>(null);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE!, {
      path: "/ws",
      transports: ["websocket"],
    }).emit("join-poll", id);

    socket.on("poll:update", setPoll);
    return () => socket.disconnect();
  }, [id]);

  return poll;
}
