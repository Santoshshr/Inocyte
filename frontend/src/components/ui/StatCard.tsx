import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, isLoading }) => (
  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
        <Icon className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-500">{label}</p>
        {isLoading ? (
          <div className="mt-1.5 h-6 w-12 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  </div>
);
