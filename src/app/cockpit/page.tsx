import QuickAccess from '@/components/dashboard/QuickAccess';
import RecentActivities from '@/components/dashboard/RecentActivities';
import ProjectStats from '@/components/dashboard/ProjectStats';
import RecentProjects from '@/components/dashboard/RecentProjects';

export default function DashboardPage() {
  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, Marcel!
        </h1>
        <p className="text-gray-600 mt-1">
          Hier ist Ihre Übersicht für heute, {new Date().toLocaleDateString('de-DE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Access - spans 2 columns on medium screens */}
        <div className="md:col-span-2 lg:col-span-1">
          <QuickAccess />
        </div>
        
        {/* Project Stats */}
        <div>
          <ProjectStats />
        </div>
        
        {/* Recent Projects - spans full width on large screens */}
        <div className="md:col-span-2 lg:col-span-1">
          <RecentProjects />
        </div>
        
        {/* Recent Activities - spans 2 columns on all screen sizes */}
        <div className="md:col-span-2">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}