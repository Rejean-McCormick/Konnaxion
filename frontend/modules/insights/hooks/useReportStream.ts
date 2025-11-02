'use client'

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function useReportStream() {
  useEffect(() => {
    const socket = io("/api/reports");
    // ... listen to events
    return () => {
      socket.disconnect();
    };
  }, []);
}
