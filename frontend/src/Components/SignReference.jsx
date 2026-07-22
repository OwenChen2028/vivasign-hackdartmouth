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
  const [videoStatus, setVideoStatus] = useState('loading');
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!signName) return undefined;

    setReference(null);
    setError('');
    setIsPlaying(false);
    setVideoStatus('loading');
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
      setVideoStatus('loading');
    }
    onExpandedChange(!isExpanded);
  }

  function playVideo() {
    const playback = videoRef.current?.play();
    playback?.catch(() => {
      setIsPlaying(false);
      setVideoStatus('error');
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
  const isVideoVisible = videoStatus === 'ready' || videoStatus === 'buffering';
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
          <div className={`reference__video-stage${isVideoVisible ? ' reference__video-stage--ready' : ''}`}>
            <video
              ref={videoRef}
              src={activeReference.video}
              playsInline
              preload="auto"
              onLoadStart={() => setVideoStatus('loading')}
              onLoadedData={() => setVideoStatus('ready')}
              onCanPlay={() => setVideoStatus('ready')}
              onPlay={() => setIsPlaying(true)}
              onPlaying={() => setVideoStatus('ready')}
              onWaiting={() => setVideoStatus('buffering')}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                setVideoStatus('error');
              }}
              aria-label={`${signName} video demonstration`}
            />
            {videoStatus === 'loading' && (
              <div className="reference__video-loading" role="status">
                <span className="reference__spinner" aria-hidden="true" />
                <span>Loading demonstration…</span>
              </div>
            )}
            {videoStatus === 'error' && (
              <p className="reference__video-error" role="alert">
                The demonstration video could not be loaded.
              </p>
            )}
          </div>
          {videoStatus === 'buffering' && (
            <p className="reference__buffering" role="status">Buffering demonstration…</p>
          )}
          <div className="reference__video-controls" aria-label="Video controls">
            <button
              type="button"
              className="button"
              onClick={togglePlayback}
              disabled={!isVideoVisible}
            >
              {isPlaying ? 'Pause demonstration' : 'Play demonstration'}
            </button>
            <button
              type="button"
              className="button"
              onClick={restartVideo}
              disabled={!isVideoVisible}
            >
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
