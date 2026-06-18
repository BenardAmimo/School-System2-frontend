import { render, screen } from '@testing-library/react';
import App from './App';

test('renders school management system header', () => {
  render(<App />);
  const headerElement = screen.getByText(/school management system/i);
  expect(headerElement).toBeInTheDocument();
});
