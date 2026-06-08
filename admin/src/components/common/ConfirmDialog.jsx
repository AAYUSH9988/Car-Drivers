import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, title, description, onConfirm, onCancel, danger = false, confirmLabel = 'Confirm' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={onCancel}>
      <div
        className="bg-admin-surface border border-admin-border rounded-lg p-6 max-w-sm w-full animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {danger && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
        )}
        <h3 className="text-base font-semibold text-admin-text-1 mb-1.5">{title}</h3>
        <p className="text-sm text-admin-text-2 mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-admin-elevated border border-admin-border rounded-md text-admin-text-1 hover:bg-admin-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-admin-accent hover:bg-admin-accent-dim text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
