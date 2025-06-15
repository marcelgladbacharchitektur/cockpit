export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse w-24"></div>
      </div>
      
      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-40"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-36"></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48"></div>
      </div>
    </div>
  );
}