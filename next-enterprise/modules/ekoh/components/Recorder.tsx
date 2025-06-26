"use client";
import { useEffect } from "react";
import { AudioRecorder, useAudioRecorder } from "react-use-audio-recorder";

export default function Recorder({
  onFinished,
}: {
  onFinished: (blob: Blob) => void;
}) {
  const rec = useAudioRecorder();

  useEffect(() => {
    if (rec.status === "stopped" && rec.audioBlob) onFinished(rec.audioBlob);
  }, [rec.status]);

  return (
    <div className="mb-4">
      <AudioRecorder
        onRecordingComplete={() => undefined}
        downloadOnSavePress={false}
        recorderControls={rec}
      />
    </div>
  );
}
