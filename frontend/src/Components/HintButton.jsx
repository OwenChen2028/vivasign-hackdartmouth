import { useState } from 'react';

export default function HintButton({ text, video, signName }) {
  const [showHints, setShowHints] = useState(false);
  const isGoogleDriveVideo = video.includes('drive.google.com');

  return (
    <section className="hints">
      <button
        type="button"
        onClick={() => setShowHints((visible) => !visible)}
        className="hide-hints"
        aria-expanded={showHints}
      >
        {showHints ? 'Hide reference' : 'Show reference'}
      </button>

      {showHints && (
        <div className="hints__content">
          <h3>How to sign {signName}</h3>
          <p>{text}</p>
          {isGoogleDriveVideo ? (
            <iframe
              src={`${video}/preview`}
              title={`${signName} video demonstration`}
              allow="autoplay"
            />
          ) : (
            <video controls src={video} aria-label={`${signName} video demonstration`} />
          )}
        </div>
      )}
    </section>
  );
}
