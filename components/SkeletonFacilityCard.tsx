import React from 'react';

const SkeletonFacilityCard: React.FC = () => {
    return (
        <div className="rounded-[3.5rem] overflow-hidden bg-slate-200 animate-pulse h-[500px] border border-slate-100 relative">
            <div className="absolute bottom-0 left-0 w-full p-12">
                <div className="flex gap-3 mb-6">
                    <div className="h-6 w-16 bg-slate-300 rounded-full"></div>
                    <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                </div>
                <div className="h-10 w-3/4 bg-slate-300 rounded-xl mb-4"></div>
                <div className="h-20 w-full bg-slate-300 rounded-xl mb-8"></div>
                <div className="h-4 w-32 bg-slate-300 rounded-full"></div>
            </div>
        </div>
    );
};

export default SkeletonFacilityCard;
