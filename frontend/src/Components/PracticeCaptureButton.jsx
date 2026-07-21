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
  captureFrame,
  processCaptures,
  setCountdownText,
  onComplete,
  onError,
  onStart,
  onRecordingChange,
  disabled = false,
}) {
  const [phase, setPhase] = useState('idle');
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
    if (!currentSign || phase !== 'idle' || disabled) return;

    setPhase('capturing');
    onRecordingChange(true);
    onStart();
    const captures = [];

    try {
      for (let frameNumber = 1; frameNumber <= currentSign.entryCount; frameNumber += 1) {
        for (let count = COUNTDOWN_SECONDS; count > 0; count -= 1) {
          setCountdownText(`Frame ${frameNumber} of ${currentSign.entryCount}: ${count}`);
          await wait(1000, timers);
          if (!mounted.current) return;
        }

        setCountdownText(`Capturing frame ${frameNumber}…`);
        captures.push(captureFrame(frameNumber));
      }

      if (mounted.current) {
        setPhase('processing');
        setCountdownText('Analyzing captured frames…');
        const capturedFeedback = await processCaptures(captures);
        if (mounted.current) {
          setCountdownText('');
          onComplete({
            capturedFrames: captures.map(({ imageBase64 }) => imageBase64),
            capturedFeedback,
          });
        }
      }
    } catch (captureError) {
      if (mounted.current) {
        setCountdownText('');
        onError(captureError);
      }
    } finally {
      if (mounted.current) {
        setPhase('idle');
        onRecordingChange(false);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={startCapture}
      className="button"
      disabled={!currentSign || phase !== 'idle' || disabled}
    >
      {phase === 'capturing' && 'Capturing…'}
      {phase === 'processing' && 'Analyzing…'}
      {phase === 'idle' && 'Start countdown'}
    </button>
  );
}
