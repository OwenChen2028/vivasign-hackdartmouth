import { useEffect, useState } from 'react';

export default function useCamera(videoRef) {
  const [status, setStatus] = useState('requesting');
  const [error, setError] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('ready');
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || 'Please allow camera access to use VivaSign.');
          setStatus('denied');
        }
      }
    }

    if (navigator.mediaDevices?.getUserMedia) {
      startCamera();
    } else {
      setError('This browser does not support camera access.');
      setStatus('denied');
    }

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [videoRef]);

  return {
    error,
    isVideoLoaded,
    markVideoLoaded: () => setIsVideoLoaded(true),
    status,
  };
}
