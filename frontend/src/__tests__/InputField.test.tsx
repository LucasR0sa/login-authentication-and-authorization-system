import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import InputField from '../components/InputField';

function ControlledInput({ initialError }: { initialError?: string }) {
  const [value, setValue] = useState('');
  return (
    <InputField
      label="Email"
      value={value}
      onChange={setValue}
      error={initialError}
    />
  );
}

describe('InputField', () => {
  it('renders the label', () => {
    render(<ControlledInput />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('updates value on user typing', async () => {
    render(<ControlledInput />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'foo@bar.com');
    expect(input).toHaveValue('foo@bar.com');
  });

  it('shows the error message when provided', () => {
    render(<ControlledInput initialError="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
