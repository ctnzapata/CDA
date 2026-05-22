import React from 'react';

interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  glass = true,
}: CardProps) {
  const cardStyle = glass
    ? 'border border-slate-900 rounded-xl bg-slate-950/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-800/80 shadow-xl'
    : 'border border-slate-900 rounded-xl bg-slate-950/40 p-6 shadow-md';

  return (
    <div className={`${cardStyle} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 space-y-1">
          {title && (
            typeof title === 'string' ? (
              <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            ) : (
              title
            )
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 leading-normal">{subtitle}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
