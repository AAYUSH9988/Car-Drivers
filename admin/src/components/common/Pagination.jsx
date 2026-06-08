import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onChange, total, className = '' }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => page > 1 && onChange(page - 1);
  const handleNext = () => page < totalPages && onChange(page + 1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePrev}
        disabled={page <= 1}
        className="p-1.5 rounded-md text-admin-text-2 hover:text-admin-text-1 hover:bg-admin-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`min-w-[28px] h-7 rounded-md text-sm font-medium transition-colors ${
            n === page
              ? 'bg-admin-accent/10 text-admin-accent border border-admin-accent/20'
              : 'text-admin-text-2 hover:text-admin-text-1 hover:bg-admin-hover'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={page >= totalPages}
        className="p-1.5 rounded-md text-admin-text-2 hover:text-admin-text-1 hover:bg-admin-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
