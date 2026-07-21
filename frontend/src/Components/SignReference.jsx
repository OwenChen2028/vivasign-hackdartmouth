import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let cancelled = false;
    if (!signName) return undefined;

    setReference(null);
    setError('');
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
    onExpandedChange(!isExpanded);
  }

  const activeReference = reference?.signName === signName ? reference : null;
  const isLoading = Boolean(signName) && !activeReference && !error;
  const isGoogleDriveVideo = activeReference?.video?.includes('drive.google.com');
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
          {isGoogleDriveVideo ? (
            <iframe
              src={`${activeReference.video}/preview`}
              title={`${signName} video demonstration`}
              allow="autoplay"
            />
          ) : (
            <video
              controls
              src={activeReference.video}
              aria-label={`${signName} video demonstration`}
            />
          )}
          <div className="reference__instructions">
            <h3>Instructions</h3>
            <FormattedText text={activeReference.text} className="formatted-text" />
          </div>
        </div>
      )}
    </section>
  );
}
