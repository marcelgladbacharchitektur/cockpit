'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, FolderOpen, Users, Clock } from 'lucide-react';

interface Stats {
  projectsInProgress: number;
  totalProjects: number;
  totalContacts: number;
  recentTimeEntries: number;
}

export default function ProjectStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Projekte im Fokus</h2>
        <p className="text-gray-500">Lade Statistiken...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-gray-500" />
        <h2 className="text-xl font-semibold">Übersicht</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Link 
          href="/cockpit/projects"
          className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {stats.projectsInProgress}
            </span>
          </div>
          <p className="text-sm text-blue-600 font-medium">
            Projekte in Bearbeitung
          </p>
          <p className="text-xs text-blue-500 mt-1">
            von {stats.totalProjects} gesamt
          </p>
        </Link>

        <Link
          href="/cockpit/contacts"
          className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-green-700">
              {stats.totalContacts}
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Kontakte
          </p>
          <p className="text-xs text-green-500 mt-1">
            Firmen & Personen
          </p>
        </Link>

        <div className="col-span-2 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">
              {stats.recentTimeEntries}
            </span>
          </div>
          <p className="text-sm text-purple-600 font-medium">
            Zeiteinträge diese Woche
          </p>
        </div>
      </div>
    </div>
  );
}