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

export default function ButtonScreenshot({
  currentSign,
  takeScreenshot,
  setCountdownText,
  onComplete,
  onError,
  onStart,
  onRecordingChange,
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

  async function startRecording() {
    if (!currentSign || isRecording) return;

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
        capturedFeedback.push({ text: result.text, signName: currentSign.signName });
      }

      if (mounted.current) {
        setCountdownText('');
        onComplete({ capturedFrames, capturedFeedback });
      }
    } catch (error) {
      if (mounted.current) {
        setCountdownText('');
        onError(error);
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
      onClick={startRecording}
      className="button"
      disabled={!currentSign || isRecording}
    >
      {isRecording ? 'Recording…' : 'Start countdown'}
    </button>
  );
}
