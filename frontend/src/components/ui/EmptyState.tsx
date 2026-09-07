import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon className="mb-4 h-14 w-14 text-gray-300" strokeWidth={1.5} />
    <p className="text-base font-medium text-gray-700">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
