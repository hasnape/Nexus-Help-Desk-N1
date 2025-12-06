
import React from 'react';
import clsx from 'clsx';
import { useLanguage } from '../contexts/LanguageContext'; // For default placeholder if necessary

export const baseFieldClasses =
  'block w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 flex items-center justify-center';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'bg-transparent hover:bg-primary-light/10 border border-primary text-primary focus:ring-primary',
  };

  const loadingStyle = isLoading ? 'opacity-75 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${loadingStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* RTL margins */}
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, ...props }, ref) => {
    const input = (
      <input
        id={id || props.name}
        ref={ref}
        className={clsx(
          baseFieldClasses,
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
    );

    if (!label && !error) return input;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id || props.name} className="mb-1 block text-sm font-medium text-slate-900">
            {label}
          </label>
        )}
        {input}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className, error, ...props }, ref) => {
    const textarea = (
      <textarea
        id={id || props.name}
        ref={ref}
        className={clsx(
          baseFieldClasses,
          'min-h-[80px]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
    );

    if (!label && !error) return textarea;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id || props.name} className="mb-1 block text-sm font-medium text-slate-900">
            {label}
          </label>
        )}
        {textarea}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className, error, options, placeholder, ...rest }, ref) => {
    const { t } = useLanguage(); // Only used here if a default placeholder is needed from translations

    const displayPlaceholder = placeholder === undefined ? t('formElements.select.placeholderDefault') : placeholder;

    const select = (
      <select
        id={id || rest.name}
        ref={ref}
        className={clsx(
          baseFieldClasses,
          'pr-8',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...rest}
      >
        {displayPlaceholder && <option value="">{displayPlaceholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );

    if (!label && !error) return select;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id || rest.name} className="mb-1 block text-sm font-medium text-slate-900">
            {label}
          </label>
        )}
        {select}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
