import React from 'react';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center bg-white shadow-sm">
      <button
        onClick={onMenuClick}
        className="ml-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1" />
        <div className="ml-4 flex items-center space-x-3 md:ml-6 md:space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <span className="hidden sm:inline-block max-w-[10rem] truncate">{user?.full_name || user?.email}</span>
            {user?.role === 'SUPERADMIN' ? (
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                Super Admin
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                <span className="hidden sm:inline">Sub-admin (Read-only)</span>
                <span className="sm:hidden">Read-only</span>
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
