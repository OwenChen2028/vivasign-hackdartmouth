import { useEffect, useRef, useState } from 'react';
import { getReference } from '../api';
import FormattedText from './FormattedText';

export default function SignReference({
  signName,
  children,
  isExpanded = false,
  onExpandedChange = () => {},
}) {
  const [reference, setReference] = useState(null);
  const [error, setError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!signName) return undefined;

    setReference(null);
    setError('');
    setIsPlaying(false);
    getReference(signName)
      .then((result) => {
        if (!cancelled) setReference({ ...result, signName });
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [requestVersion, signName]);

  function handleButtonClick() {
    if (error) {
      setRequestVersion((version) => version + 1);
      return;
    }
    if (isExpanded) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
    onExpandedChange(!isExpanded);
  }

  function playVideo() {
    const playback = videoRef.current?.play();
    playback?.catch(() => {
      setError('The demonstration video could not be played.');
    });
  }

  function togglePlayback() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      playVideo();
    } else {
      videoRef.current.pause();
    }
  }

  function restartVideo() {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    playVideo();
  }

  const activeReference = reference?.signName === signName ? reference : null;
  const isLoading = Boolean(signName) && !activeReference && !error;
  let buttonLabel = 'View example';
  if (isLoading) buttonLabel = 'Loading reference…';
  if (error) buttonLabel = 'Retry reference';
  if (isExpanded) buttonLabel = 'Hide example';

  return (
    <section className="reference" aria-live="polite">
      <div className={`reference__actions${children ? '' : ' reference__actions--single'}`}>
        <button
          type="button"
          onClick={handleButtonClick}
          className="reference__toggle"
          aria-expanded={isExpanded}
          disabled={!signName || isLoading}
        >
          {buttonLabel}
        </button>
        {children}
      </div>

      {error && <p className="error-message" role="alert">Could not load the reference: {error}</p>}

      {isExpanded && activeReference && (
        <div className="reference__content">
          <h2>{signName} demonstration</h2>
          <video
            ref={videoRef}
            src={activeReference.video}
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            aria-label={`${signName} video demonstration`}
          />
          <div className="reference__video-controls" aria-label="Video controls">
            <button type="button" className="button" onClick={togglePlayback}>
              {isPlaying ? 'Pause demonstration' : 'Play demonstration'}
            </button>
            <button type="button" className="button" onClick={restartVideo}>
              Restart demonstration
            </button>
          </div>
          <div className="reference__instructions">
            <h3>Instructions</h3>
            <FormattedText text={activeReference.text} className="formatted-text" />
          </div>
        </div>
      )}
    </section>
  );
}
