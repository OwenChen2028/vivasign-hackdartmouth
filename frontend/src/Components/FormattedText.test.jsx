import { render, screen } from '@testing-library/react';
import FormattedText from './FormattedText';

test('renders Markdown bold markers without displaying the asterisks', () => {
  const { container } = render(
    <FormattedText text={'**Step 1:** Hold your hands apart.\n\n**Step 2:** Bring them together.'} />,
  );

  expect(screen.getByText('Step 1:', { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByText('Step 2:', { selector: 'strong' })).toBeInTheDocument();
  expect(container).toHaveTextContent('Step 1: Hold your hands apart.');
  expect(container.textContent).not.toContain('**');
});
