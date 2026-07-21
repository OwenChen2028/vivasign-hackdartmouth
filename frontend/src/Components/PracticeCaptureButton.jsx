import { useEffect, useRef, useState } from 'react';
import '../styles/button.css';

const COUNTDOWN_SECONDS = 3;

function wait(milliseconds, timers) {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      resolve();
    }, milliseconds);
    timers.current.add(timer);
  });
}

export default function PracticeCaptureButton({
  currentSign,
  takeScreenshot,
  setCountdownText,
  onComplete,
  onError,
  onStart,
  onRecordingChange,
  disabled = false,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const timers = useRef(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    const activeTimers = timers.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeTimers.forEach(window.clearTimeout);
      activeTimers.clear();
    };
  }, []);

  async function startCapture() {
    if (!currentSign || isRecording || disabled) return;

    setIsRecording(true);
    onRecordingChange(true);
    onStart();
    const capturedFrames = [];
    const capturedFeedback = [];

    try {
      for (let frameNumber = 1; frameNumber <= currentSign.entryCount; frameNumber += 1) {
        for (let count = COUNTDOWN_SECONDS; count > 0; count -= 1) {
          setCountdownText(`Frame ${frameNumber} of ${currentSign.entryCount}: ${count}`);
          await wait(1000, timers);
          if (!mounted.current) return;
        }

        setCountdownText(`Capturing frame ${frameNumber}…`);
        const result = await takeScreenshot(frameNumber);
        capturedFrames.push(result.imageBase64);
        capturedFeedback.push({
          text: result.text,
          signName: currentSign.signName,
          evaluationMode: result.evaluationMode,
        });
      }

      if (mounted.current) {
        setCountdownText('');
        onComplete({ capturedFrames, capturedFeedback });
      }
    } catch (captureError) {
      if (mounted.current) {
        setCountdownText('');
        onError(captureError);
      }
    } finally {
      if (mounted.current) {
        setIsRecording(false);
        onRecordingChange(false);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={startCapture}
      className="button"
      disabled={!currentSign || isRecording || disabled}
    >
      {isRecording ? 'Recording…' : 'Start countdown'}
    </button>
  );
}
