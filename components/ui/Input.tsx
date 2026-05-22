import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[] | readonly { value: string; label: string }[];
  helperText?: string;
}

export default function Input({
  id,
  label,
  value,
  onChange,
  options,
  helperText,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}: InputProps) {
  const inputStyle =
    'mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {options ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputStyle}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={inputStyle}
          {...props}
        />
      )}

      {helperText && (
        <span className="block mt-1 text-[10px] text-slate-500 leading-normal">
          {helperText}
        </span>
      )}
    </div>
  );
}
