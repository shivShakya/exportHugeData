import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  onNext,
  onPrev,
  canNext,
  canPrev,
}: PaginationProps) {
  return (
    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-slate-500">
        Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages || 1}</span> 
        <span className="ml-1">({totalCount.toLocaleString()} total records)</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        <button
          onClick={onNext}
          disabled={!canNext}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}