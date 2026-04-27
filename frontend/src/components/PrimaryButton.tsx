import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  loading = false,
  onClick,
  type = 'button',
  disabled,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5A4BD1] disabled:opacity-60 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
