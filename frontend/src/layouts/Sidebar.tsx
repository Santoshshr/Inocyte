import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, MessageSquare, Users, Settings, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const navigation = [
    { name: 'Dashboard', href: '/Inocyte_Admin_Panel', icon: LayoutDashboard },
    { name: 'Companies', href: '/Inocyte_Admin_Panel/companies', icon: Building2 },
    { name: 'Inquiries', href: '/Inocyte_Admin_Panel/inquiries', icon: MessageSquare },
    ...(isSuperAdmin ? [{ name: 'Users', href: '/Inocyte_Admin_Panel/users', icon: Users }] : []),
    { name: 'Settings', href: '/Inocyte_Admin_Panel/settings', icon: Settings },
  ];

  const content = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <span className="text-xl font-bold tracking-wider text-white">INOCYTE</span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/Inocyte_Admin_Panel'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  isActive ? 'bg-brand-navy text-white' : 'text-gray-300 hover:bg-brand-navy/50 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                )
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: persistent column */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-brand-dark">{content}</div>

      {/* Mobile: off-canvas drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
          <div className="relative flex h-full w-64 flex-col bg-brand-dark animate-slide-in">{content}</div>
        </div>
      )}
    </>
  );
};
