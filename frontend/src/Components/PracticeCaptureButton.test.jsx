import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PracticeCaptureButton from './PracticeCaptureButton';

afterEach(() => {
  jest.useRealTimers();
});

test('captures every key position after the countdown', async () => {
  jest.useFakeTimers();
  const takeScreenshot = jest.fn().mockResolvedValue({
    imageBase64: 'data:image/png;base64,example',
    text: 'Looks good.',
    evaluationMode: 'ai',
  });
  const onComplete = jest.fn();

  render(
    <PracticeCaptureButton
      currentSign={{ signName: 'My', entryCount: 1 }}
      takeScreenshot={takeScreenshot}
      setCountdownText={jest.fn()}
      onComplete={onComplete}
      onError={jest.fn()}
      onStart={jest.fn()}
      onRecordingChange={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /start countdown/i }));
  for (let second = 0; second < 3; second += 1) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
  }

  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  expect(takeScreenshot).toHaveBeenCalledWith(1);
  expect(onComplete.mock.calls[0][0].capturedFrames).toHaveLength(1);
});
