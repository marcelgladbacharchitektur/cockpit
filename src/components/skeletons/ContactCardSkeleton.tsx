export default function ContactCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse w-24"></div>
        </div>
      </div>
      
      {/* Contact Details */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-40"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-56"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-36"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-64"></div>
        </div>
      </div>
    </div>
  );
}