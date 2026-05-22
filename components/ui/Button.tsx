import React from 'react';

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
    'relative flex justify-center items-center rounded-lg font-semibold text-sm px-6 py-2.5 shadow-md transition-all duration-300 outline-none focus:outline-none focus:ring-2 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:from-blue-500 hover:to-emerald-400 hover:shadow-lg focus:ring-blue-500/50 disabled:from-slate-800 disabled:to-slate-800',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-500/50 disabled:bg-slate-900',
    emerald:
      'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg focus:ring-emerald-500/50 disabled:bg-slate-800',
    danger:
      'bg-red-600 hover:bg-red-500 text-white hover:shadow-lg focus:ring-red-500/50 disabled:bg-slate-800',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Procesando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
