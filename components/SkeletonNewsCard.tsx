import React from 'react';

const SkeletonNewsCard: React.FC = () => {
    return (
        <article className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 flex flex-col sm:flex-row h-full">
            {/* Image Skeleton */}
            <div className="sm:w-2/5 h-64 sm:h-auto bg-slate-200 animate-pulse relative"></div>

            {/* Content Skeleton */}
            <div className="sm:w-3/5 p-10 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-6 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 w-full bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
                    <div className="h-8 w-2/3 bg-slate-200 rounded-xl mb-8 animate-pulse"></div>

                    <div className="space-y-2 mb-8">
                        <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-4 w-5/6 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-28 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
            </div>
        </article>
    );
};

export default SkeletonNewsCard;
