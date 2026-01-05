export const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`skeleton ${className}`} />
)

export const StatCardSkeleton = () => (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-20 h-2" />
    </div>
)

export const ChartSkeleton = () => (
    <div className="chart-container">
        <Skeleton className="w-full h-full rounded-2xl" />
    </div>
)
