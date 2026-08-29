import React from 'react';

export const Skeleton = ({ className, variant = 'rect' }) => {
    const baseClass = "skeleton";
    const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';

    return (
        <div className={`${baseClass} ${variantClass} ${className}`} />
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            <div className="flex gap-4 mb-8">
                {[...Array(cols)].map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                ))}
            </div>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-12 h-12" variant="circle" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="w-12 h-12" variant="circle" />
                <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-2/3 h-8" />
            <Skeleton className="w-full h-4" />
        </div>
    );
};
