import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
    onClick={onCancel}
  >
    <div
      className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            tone === 'danger' ? 'bg-red-100' : 'bg-brand-primary/10'
          }`}
        >
          <AlertTriangle className={`h-5 w-5 ${tone === 'danger' ? 'text-red-600' : 'text-brand-primary'}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);
