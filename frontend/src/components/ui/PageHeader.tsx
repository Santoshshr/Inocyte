import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => (
  <div className="sm:flex sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    {action && <div className="mt-4 sm:mt-0">{action}</div>}
  </div>
);
