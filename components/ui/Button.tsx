import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyle =
    'relative flex justify-center items-center rounded-lg font-semibold text-sm px-5 py-2.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-500 shadow focus-visible:ring-blue-500/50',
    secondary:
      'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 focus-visible:ring-slate-500/50',
    emerald:
      'bg-emerald-600 text-white hover:bg-emerald-500 shadow focus-visible:ring-emerald-500/50',
    danger:
      'bg-red-600 text-white hover:bg-red-500 shadow focus-visible:ring-red-500/50',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyle, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Procesando…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
