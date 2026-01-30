import React from 'react';

const SkeletonProjectCard: React.FC = () => {
    return (
        <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 flex flex-col h-full">
            <div className="relative h-60 bg-slate-200 animate-pulse"></div>
            <div className="p-10 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                    <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-10 w-10 bg-slate-200 rounded-2xl animate-pulse"></div>
                </div>
                <div className="h-8 w-3/4 bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-4 w-full bg-slate-200 rounded-full mb-2 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded-full mb-8 animate-pulse"></div>
                <div className="pt-6 border-t border-slate-50 flex items-center gap-3 mt-auto">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonProjectCard;
