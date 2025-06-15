import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function CockpitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}