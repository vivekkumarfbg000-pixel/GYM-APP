// Enhanced Skeleton Loaders with smooth animations

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 h-48 animate-pulse">
                <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
                <div className="h-8 bg-white/30 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/10 rounded-xl p-4 h-20"></div>
                    ))}
                </div>
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="h-64 bg-gradient-to-t from-gray-100 to-gray-50 rounded-xl"></div>
            </div>
        </div>
    );
}

export function MobileDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Mobile Header Skeleton */}
            <div className="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[2.5rem] animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <div className="h-4 bg-blue-500 rounded w-24"></div>
                        <div className="h-6 bg-white/30 rounded w-32"></div>
                    </div>
                    <div className="h-10 w-10 bg-white/20 rounded-full"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="flex justify-between">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-blue-700/30 p-3 rounded-2xl w-[30%] h-20"></div>
                    ))}
                </div>
            </div>

            {/* Cards Skeleton */}
            <div className="px-6 -mt-16 space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="bg-gray-100 rounded-xl h-24"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CommunityFeedSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-20"></div>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex gap-6">
                        <div className="h-6 bg-gray-100 rounded w-16"></div>
                        <div className="h-6 bg-gray-100 rounded w-16"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function WorkoutCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LeaderboardSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex items-center p-4 rounded-2xl border animate-pulse ${i === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-100' : 'bg-white border-gray-100'}`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`w-8 h-8 rounded-full mr-4 ${i <= 3 ? 'bg-yellow-200' : 'bg-gray-200'}`}></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="animate-pulse border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className={`h-4 bg-gray-200 rounded ${i === 0 ? 'w-3/4' : 'w-full'}`}></div>
                </td>
            ))}
        </tr>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                </div>
            ))}
            <div className="h-12 bg-blue-200 rounded-xl w-full mt-6"></div>
        </div>
    );
}

// Shimmer effect component
export function Shimmer() {
    return (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Skeleton */}
            <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 animate-pulse relative"></div>

            {/* Profile Info Card Skeleton */}
            <div className="px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl shadow-lg p-6 text-center animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto -mt-16 mb-4 border-4 border-white"></div>
                    <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-32 mx-auto mb-6"></div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-20 mx-auto"></div>
                            <div className="h-2 bg-gray-100 rounded w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
                            <div className="h-3 bg-gray-100 rounded w-12 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Skeleton */}
            <div className="px-6 mt-6 space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-16 animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}
