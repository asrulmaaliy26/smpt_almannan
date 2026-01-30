import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    themeColor?: string; // e.g. 'bg-islamic-green-600' or hex, but usually we use classes
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    themeColor = 'bg-slate-900' // Default color
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-16">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-3 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Previous Page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-11 h-11 rounded-xl font-black text-sm transition-all ${currentPage === page
                                ? `${themeColor} text-white shadow-lg`
                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Next Page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;
