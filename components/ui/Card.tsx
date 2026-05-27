import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
}: CardProps) {
  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col gap-1">
          {title && (
            typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-slate-100 leading-none">{title}</h3>
            ) : (
              title
            )
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 leading-none mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
