import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  endElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, endElement, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              error && 'border-red-500 focus:ring-red-500',
              endElement && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {endElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {endElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
