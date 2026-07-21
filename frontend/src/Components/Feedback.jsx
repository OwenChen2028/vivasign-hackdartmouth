import { useEffect, useState } from 'react';
import { getHints } from '../api';
import HintButton from './HintButton';

export default function Feedback({ frames, feedback }) {
  const [hint, setHint] = useState(null);
  const [hintError, setHintError] = useState('');
  const signName = feedback[0]?.signName;

  useEffect(() => {
    let cancelled = false;
    if (!signName) return undefined;

    setHint(null);
    setHintError('');
    getHints(signName)
      .then((result) => {
        if (!cancelled) setHint(result);
      })
      .catch((error) => {
        if (!cancelled) setHintError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [signName]);

  return (
    <section className="feedback" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading">Your feedback</h2>
      {frames.map((frame, index) => (
        <article className="feedback__frame" key={`${signName}-${index}`}>
          <h3>Frame {index + 1}</h3>
          <img src={frame} alt={`Your captured ${signName} frame ${index + 1}`} />
          <p>{feedback[index]?.text || 'Feedback unavailable.'}</p>
        </article>
      ))}
      {hintError && <p className="error-message">Could not load the reference: {hintError}</p>}
      {hint && <HintButton text={hint.text} video={hint.video} signName={signName} />}
    </section>
  );
}
