import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the VivaSign home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /practice asl with guided reference material/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /begin practicing/i })).toHaveAttribute('href', '/webcam');
});
