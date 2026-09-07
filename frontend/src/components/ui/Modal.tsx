import React from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, subtitle, onClose, children, maxWidth = 'max-w-2xl' }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
    onClick={onClose}
  >
    <div
      className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-scale-in`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);
