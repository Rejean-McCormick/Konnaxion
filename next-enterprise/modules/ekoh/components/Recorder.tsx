"use client";
import { useEffect } from "react";
import { useAudioRecorder } from "react-use-audio-recorder";

/**
 * Thin wrapper around `useAudioRecorder` that gives the parent
 * the final Blob when a recording stops.
 */
export default function Recorder(props: { onFinished(blob: Blob): void }) {
  // The lib’s type defs are slightly outdated – cast to any for now
  const rec = useAudioRecorder() as any;

  useEffect(() => {
    if (rec.status === "stopped" && rec.audioBlob) {
      props.onFinished(rec.audioBlob as Blob);
    }
  }, [rec.status, rec.audioBlob]);

  return (
    <div className="flex items-center gap-2">
      <button onClick={rec.startRecording}   className="px-3 py-1 border rounded">Record</button>
      <button onClick={rec.stopRecording}    className="px-3 py-1 border rounded">Stop</button>
      <button onClick={rec.pauseRecording}   className="px-3 py-1 border rounded">Pause</button>
      <span className="ml-2 text-sm text-gray-500">{rec.recordingTime}s</span>
    </div>
  );
}
