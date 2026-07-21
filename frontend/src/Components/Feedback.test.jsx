import { fireEvent, render, screen } from '@testing-library/react';
import Feedback from './Feedback';

test('directs reference-mode learners to the demonstration instead of generic feedback', () => {
  const onReviewReference = jest.fn();

  render(
    <Feedback
      frames={['data:image/png;base64,example']}
      feedback={[{
        text: 'Frame 1 of Hello captured.',
        signName: 'Hello',
        evaluationMode: 'reference',
      }]}
      signName="Hello"
      onReviewReference={onReviewReference}
    />,
  );

  expect(screen.getByText(/compare your captured positions with the example video/i)).toBeInTheDocument();
  expect(screen.queryByText(/frame 1 of hello captured/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /view example video/i }));
  expect(onReviewReference).toHaveBeenCalledTimes(1);
});
