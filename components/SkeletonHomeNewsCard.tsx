import React from 'react';

const SkeletonHomeNewsCard: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 flex flex-col h-full">
            <div className="relative h-64 bg-slate-200 animate-pulse"></div>
            <div className="p-8 flex flex-col flex-1">
                <div className="h-6 w-3/4 bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-4 w-full bg-slate-200 rounded-full mb-2 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded-full mb-8 animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-200 rounded-full mt-auto animate-pulse"></div>
            </div>
        </div>
    );
};

export default SkeletonHomeNewsCard;
