import React from 'react';

const STATUS_MAP = {
  active:    { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  pending:   { dot: 'bg-amber-400',   text: 'text-amber-400'   },
  suspended: { dot: 'bg-red-400',     text: 'text-red-400'     },
  inactive:  { dot: 'bg-slate-400',   text: 'text-slate-400'   },
  completed: { dot: 'bg-blue-400',    text: 'text-blue-400'    },
  confirmed: { dot: 'bg-violet-400',  text: 'text-violet-400'  },
  cancelled: { dot: 'bg-red-400',     text: 'text-red-400'     },
};

const StatusBadge = ({ status, className = '' }) => {
  const normalized = status?.toLowerCase() || 'unknown';
  const style = STATUS_MAP[normalized] || STATUS_MAP.inactive;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;
