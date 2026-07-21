import { useCallback, useRef, useState } from 'react';
import { evaluateFrame } from './api';
import Feedback from './Components/Feedback';
import PracticeCaptureButton from './Components/PracticeCaptureButton';
import SelectSign from './Components/SelectSign';
import SignReference from './Components/SignReference';
import useCamera from './hooks/useCamera';
import './styles/webcam.css';

export default function Webcam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const referenceRef = useRef(null);
  const [activityError, setActivityError] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [countdownText, setCountdownText] = useState('');
  const [currentSign, setCurrentSign] = useState(null);
  const camera = useCamera(videoRef);

  async function takeScreenshot(frameNumber) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !currentSign) {
      throw new Error('The camera and sign selection must be ready before recording.');
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('The browser could not prepare an image from the camera.');
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    const evaluation = await evaluateFrame({
      signName: currentSign.signName,
      frameNumber,
      imageBase64,
    });
    return {
      imageBase64,
      text: evaluation.text,
      evaluationMode: evaluation.mode,
    };
  }

  const resetResults = useCallback(() => {
    setFrames([]);
    setFeedback([]);
    setActivityError('');
  }, []);

  const handleSignChange = useCallback((sign) => {
    setCurrentSign(sign);
    setIsReferenceOpen(false);
    resetResults();
  }, [resetResults]);

  const showReference = useCallback(() => {
    setIsReferenceOpen(true);
    window.requestAnimationFrame(() => {
      referenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <section className="practice">
      <h1>Guided ASL practice</h1>
      <p className="practice__intro">
        Select a sign, review its instructions and demonstration, then practice each
        key position with the camera.
      </p>

      <div className="practice__setup">
        <SelectSign
          currentSign={currentSign}
          onChange={handleSignChange}
          disabled={isRecording}
        />
        <div ref={referenceRef}>
          <SignReference
            signName={currentSign?.signName}
            isExpanded={isReferenceOpen}
            onExpandedChange={setIsReferenceOpen}
          >
            <PracticeCaptureButton
              currentSign={currentSign}
              takeScreenshot={takeScreenshot}
              setCountdownText={setCountdownText}
              onComplete={({ capturedFrames, capturedFeedback }) => {
                setFrames(capturedFrames);
                setFeedback(capturedFeedback);
              }}
              onError={(error) => setActivityError(error.message)}
              onStart={resetResults}
              onRecordingChange={setIsRecording}
              disabled={!camera.isVideoLoaded}
            />
          </SignReference>
        </div>
      </div>

      <div className="practice__camera">
        <canvas ref={canvasRef} hidden />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={camera.markVideoLoaded}
          aria-label="Live camera preview"
        />

        {camera.status === 'requesting' && (
          <div className="camera-message">Requesting camera permission…</div>
        )}
        {camera.status === 'denied' && (
          <div className="camera-message camera-message--error">
            <strong>Camera unavailable</strong>
            <span>{camera.error}</span>
          </div>
        )}
        {camera.status === 'ready' && !camera.isVideoLoaded && (
          <div className="camera-message">Loading camera feed…</div>
        )}
        {countdownText && (
          <div className="countdown-overlay" role="status" aria-live="polite">
            {countdownText}
          </div>
        )}
      </div>

      {activityError && <p className="error-message" role="alert">{activityError}</p>}
      {frames.length > 0 && (
        <Feedback
          frames={frames}
          feedback={feedback}
          signName={currentSign?.signName}
          onReviewReference={showReference}
        />
      )}
    </section>
  );
}
