import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
};

type SelectOption = {
  value: string;
  label: React.ReactNode;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  options: SelectOption[];
  placeholder?: React.ReactNode;
};

const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400',
  outline:
    'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || isLoading;
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
          buttonVariantClasses[variant],
          buttonSizeClasses[size],
          className
        )}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 me-2 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

const baseFieldClasses =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100 disabled:text-slate-500';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, helperText, className, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label : undefined);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseFieldClasses,
            className,
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : undefined
          )}
          {...props}
        />
        {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, error, helperText, className, ...props }, ref) => {
    const textareaId = id || (typeof label === 'string' ? label : undefined);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            baseFieldClasses,
            'min-h-[120px] resize-vertical',
            className,
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : undefined
          )}
          {...props}
        />
        {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, error, helperText, className, options, placeholder, ...props }, ref) => {
    const selectId = id || (typeof label === 'string' ? label : undefined);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            baseFieldClasses,
            className,
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : undefined
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export type { ButtonProps, InputProps, TextareaProps, SelectProps, SelectOption };
