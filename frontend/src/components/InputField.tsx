import { useState } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  name?: string;
  autoComplete?: string;
}

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  name,
  autoComplete,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;

  return (
    <div>
      <div
        className={`relative h-12 rounded-lg border bg-white transition-all duration-150 ${
          error
            ? 'border-red-500'
            : focused
            ? 'border-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
            : 'border-[#E5E7EB]'
        }`}
      >
        <label
          className={`absolute left-4 pointer-events-none text-[#6B7280] transition-all duration-150 ${
            floating ? 'top-[6px] text-[10px]' : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        >
          {label}
        </label>
        <input
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          className={`absolute inset-0 w-full h-full bg-transparent rounded-lg px-4 outline-none text-[#111827] text-sm ${
            floating ? 'pt-4' : ''
          }`}
        />
      </div>
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
