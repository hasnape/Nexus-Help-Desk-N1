import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const textSizeClasses: Record<SpinnerSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className ?? ''}`} role="status" aria-live="polite">
      <svg
        className={`animate-spin text-sky-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {text && <p className={`text-slate-600 ${textSizeClasses[size]}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
