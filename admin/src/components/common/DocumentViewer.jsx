import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

const DocumentViewer = ({ doc, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!doc) return null;

  const isPdf = doc.url?.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${doc.label}`}
    >
      <div
        className="bg-admin-surface border border-admin-border rounded-lg w-full max-w-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border shrink-0">
          <span className="text-sm font-medium text-admin-text-1">{doc.label}</span>
          <div className="flex items-center gap-2">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded transition-colors"
              aria-label="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded transition-colors"
              aria-label="Close preview"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[75vh] p-2">
          {isPdf ? (
            <iframe
              src={doc.url}
              title={doc.label}
              className="w-full h-[70vh] rounded border border-admin-border"
            />
          ) : (
            <img
              src={doc.url}
              alt={doc.label}
              className="w-full object-contain rounded"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          <div
            className="hidden w-full h-48 items-center justify-center text-sm text-admin-text-3 bg-admin-elevated rounded"
          >
            Preview unavailable —{' '}
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-admin-accent hover:underline">
              open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
