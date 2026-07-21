import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PracticeCaptureButton from './PracticeCaptureButton';

afterEach(() => {
  jest.useRealTimers();
});

test('captures every key position before processing any feedback', async () => {
  jest.useFakeTimers();
  const captureFrame = jest.fn((frameNumber) => ({
    frameNumber,
    imageBase64: `data:image/png;base64,frame-${frameNumber}`,
  }));
  const processCaptures = jest.fn().mockResolvedValue([
    { text: 'First frame feedback.', signName: 'Meet', evaluationMode: 'ai' },
    { text: 'Second frame feedback.', signName: 'Meet', evaluationMode: 'ai' },
  ]);
  const onComplete = jest.fn();

  render(
    <PracticeCaptureButton
      currentSign={{ signName: 'Meet', entryCount: 2 }}
      captureFrame={captureFrame}
      processCaptures={processCaptures}
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

  expect(captureFrame).toHaveBeenCalledWith(1);
  expect(processCaptures).not.toHaveBeenCalled();

  for (let second = 0; second < 3; second += 1) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
  }

  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  expect(captureFrame.mock.calls).toEqual([[1], [2]]);
  expect(processCaptures).toHaveBeenCalledWith([
    { frameNumber: 1, imageBase64: 'data:image/png;base64,frame-1' },
    { frameNumber: 2, imageBase64: 'data:image/png;base64,frame-2' },
  ]);
  expect(captureFrame.mock.invocationCallOrder[1])
    .toBeLessThan(processCaptures.mock.invocationCallOrder[0]);
  expect(onComplete.mock.calls[0][0].capturedFrames).toHaveLength(2);
});
