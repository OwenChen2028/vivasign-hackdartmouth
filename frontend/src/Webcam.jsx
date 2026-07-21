import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateFrame } from './api';
import ButtonScreenshot from './Components/ButtonScreenshot';
import Feedback from './Components/Feedback';
import SelectSign from './Components/SelectSign';
import './styles/webcam.css';

export default function Webcam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('requesting');
  const [cameraError, setCameraError] = useState('');
  const [activityError, setActivityError] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [countdownText, setCountdownText] = useState('');
  const [currentSign, setCurrentSign] = useState(null);

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        setCameraStatus('ready');
      } catch (error) {
        if (!cancelled) {
          setCameraError(error.message || 'Please allow camera access to use VivaSign.');
          setCameraStatus('denied');
        }
      }
    }

    if (navigator.mediaDevices?.getUserMedia) {
      startWebcam();
    } else {
      setCameraError('This browser does not support camera access.');
      setCameraStatus('denied');
    }

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function takeScreenshot(frameNumber) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !currentSign) {
      throw new Error('The camera and sign selection must be ready before recording.');
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    const text = await evaluateFrame({
      signName: currentSign.signName,
      frameNumber,
      imageBase64,
    });
    return { imageBase64, text };
  }

  const resetResults = useCallback(() => {
    setFrames([]);
    setFeedback([]);
    setActivityError('');
  }, []);

  const handleSignChange = useCallback((sign) => {
    setCurrentSign(sign);
    resetResults();
  }, [resetResults]);

  return (
    <section className="practice">
      <h1>Personalized ASL feedback</h1>

      <div className="practice__camera">
        <canvas ref={canvasRef} hidden />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setIsVideoLoaded(true)}
          aria-label="Live camera preview"
        />

        {cameraStatus === 'requesting' && (
          <div className="camera-message">Requesting camera permission…</div>
        )}
        {cameraStatus === 'denied' && (
          <div className="camera-message camera-message--error">
            <strong>Camera unavailable</strong>
            <span>{cameraError}</span>
          </div>
        )}
        {cameraStatus === 'ready' && !isVideoLoaded && (
          <div className="camera-message">Loading camera feed…</div>
        )}
        {countdownText && (
          <div className="countdown-overlay" role="status" aria-live="polite">
            {countdownText}
          </div>
        )}
      </div>

      {isVideoLoaded && (
        <div className="practice__controls">
          <SelectSign
            currentSign={currentSign}
            onChange={handleSignChange}
            disabled={isRecording}
          />
          <ButtonScreenshot
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
          />
        </div>
      )}

      {activityError && <p className="error-message" role="alert">{activityError}</p>}
      {frames.length > 0 && <Feedback frames={frames} feedback={feedback} />}
    </section>
  );
}
