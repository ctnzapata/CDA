import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>, 'type'> {
  id: string;
  label?: string;
  type?: string;
  options?: { value: string; label: string }[] | readonly { value: string; label: string }[];
  helperText?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ id, label, type = 'text', options, helperText, error, className, required, ...props }, ref) => {
    
    const inputClassName = cn(
      "mt-1.5 w-full rounded-lg border bg-slate-950 py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
      error 
        ? "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20" 
        : "border-slate-800 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
    );

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label} {required && <span className="text-blue-500">*</span>}
          </label>
        )}

        {options ? (
          <select
            id={id}
            required={required}
            className={inputClassName}
            ref={ref as React.RefObject<HTMLSelectElement>}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            className={inputClassName}
            ref={ref as React.RefObject<HTMLInputElement>}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Mensaje de Error de Validación */}
        {error ? (
          <span className="block mt-1.5 text-[11px] font-medium text-red-400 leading-normal">
            {error}
          </span>
        ) : helperText ? (
          <span className="block mt-1.5 text-[11px] text-slate-500 leading-normal">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
