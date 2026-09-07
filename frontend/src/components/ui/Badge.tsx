import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'brand';

const TONE_CLASSES: Record<BadgeTone, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  brand: 'bg-brand-primary/10 text-brand-primary',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'gray', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
      TONE_CLASSES[tone],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
