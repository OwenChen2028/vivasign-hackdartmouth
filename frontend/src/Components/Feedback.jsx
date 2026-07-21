import FormattedText from './FormattedText';

export default function Feedback({ frames, feedback, signName, onReviewReference }) {
  const isReferenceMode = feedback.some((item) => item.evaluationMode === 'reference');

  return (
    <section className="feedback" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading">Practice results</h2>

      {isReferenceMode && (
        <div className="feedback__notice">
          <div>
            <h3>Images captured</h3>
            <p>
              VivaSign does not analyze images in reference mode. Compare your captured
              positions with the example video.
            </p>
          </div>
          <button type="button" className="button" onClick={onReviewReference}>
            View example video
          </button>
        </div>
      )}

      {frames.map((frame, index) => (
        <article className="feedback__frame" key={`${signName}-${index}`}>
          <h3>Captured frame {index + 1}</h3>
          <img src={frame} alt={`Captured ${signName} frame ${index + 1}`} />
          {!isReferenceMode && (
            <FormattedText
              text={feedback[index]?.text || 'Feedback unavailable.'}
              className="formatted-text feedback__copy"
            />
          )}
        </article>
      ))}
    </section>
  );
}
