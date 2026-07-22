import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { getReference } from '../api';
import SignReference from './SignReference';

jest.mock('../api', () => ({ getReference: jest.fn() }));

test('shows a selected sign reference before practice', async () => {
  getReference.mockResolvedValue({
    text: 'Hold a flat hand near the side of the forehead.',
    video: 'http://localhost:5000/media/HI.mp4',
  });

  function ReferenceHarness() {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <SignReference
        signName="Hello"
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    );
  }

  render(<ReferenceHarness />);

  const button = await screen.findByRole('button', { name: /view example/i });
  fireEvent.click(button);

  expect(screen.getByRole('heading', { name: /hello demonstration/i })).toBeInTheDocument();
  expect(screen.getByText(/hold a flat hand/i)).toBeInTheDocument();
  const video = screen.getByLabelText(/hello video demonstration/i);
  const playButton = screen.getByRole('button', { name: /play demonstration/i });
  const restartButton = screen.getByRole('button', { name: /restart demonstration/i });
  expect(video).not.toHaveAttribute('controls');
  expect(screen.getByText(/loading demonstration/i)).toBeInTheDocument();
  expect(playButton).toBeDisabled();
  expect(restartButton).toBeDisabled();

  fireEvent.loadedData(video);

  expect(screen.queryByText(/loading demonstration/i)).not.toBeInTheDocument();
  expect(playButton).toBeEnabled();
  expect(restartButton).toBeEnabled();
  expect(getReference).toHaveBeenCalledWith('Hello');
});
