import React from 'react';

const SkeletonBestJournal: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-20">
            <div className="h-10 w-64 bg-slate-200 rounded-xl mb-8 animate-pulse"></div>
            <div className="bg-slate-50 rounded-[3rem] p-10 md:p-16 border border-slate-100 flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 w-full">
                    <div className="h-8 w-48 bg-slate-200 rounded-full mb-8 animate-pulse shadow-sm"></div>
                    <div className="h-12 w-full bg-slate-200 rounded-2xl mb-4 animate-pulse"></div>
                    <div className="h-12 w-2/3 bg-slate-200 rounded-2xl mb-8 animate-pulse"></div>
                    <div className="h-24 w-full bg-slate-200 rounded-2xl mb-10 animate-pulse"></div>
                    <div className="h-16 w-48 bg-slate-200 rounded-2xl animate-pulse shadow-md"></div>
                </div>
                <div className="lg:w-1/2 w-full">
                    <div className="aspect-video bg-white rounded-[3rem] shadow-sm p-10 border border-slate-100 flex flex-col justify-center animate-pulse">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-slate-200 rounded-3xl animate-pulse"></div>
                            <div>
                                <div className="h-4 w-24 bg-slate-200 rounded-full mb-2 animate-pulse"></div>
                                <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                                <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                                <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SkeletonBestJournal;
