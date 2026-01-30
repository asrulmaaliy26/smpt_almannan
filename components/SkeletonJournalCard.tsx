import React from 'react';

const SkeletonJournalCard: React.FC = () => {
    return (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12">
            <div className="md:w-3/4">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-20 bg-slate-200 rounded-full animate-pulse ml-auto"></div>
                </div>
                <div className="h-10 w-full bg-slate-200 rounded-xl mb-6 animate-pulse"></div>
                <div className="h-32 w-full bg-slate-200 rounded-[2rem] mb-10 animate-pulse"></div>
                <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-200 animate-pulse"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-200 animate-pulse"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="md:w-1/4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0">
                <div className="text-center mb-8 w-full flex flex-col items-center">
                    <div className="h-4 w-24 bg-slate-200 rounded-full mb-3 animate-pulse"></div>
                    <div className="h-16 w-16 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-12 w-full bg-slate-200 rounded-2xl animate-pulse"></div>
                <div className="h-4 w-20 bg-slate-200 rounded-full mt-6 animate-pulse"></div>
            </div>
        </div>
    );
};

export default SkeletonJournalCard;
