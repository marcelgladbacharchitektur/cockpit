'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface Project {
  id: string;
  projectNumber: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function RecentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await fetch('/api/projects?limit=5');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AKQUISE: 'bg-yellow-100 text-yellow-800',
      IN_BEARBEITUNG: 'bg-blue-100 text-blue-800',
      PAUSE: 'bg-gray-100 text-gray-800',
      FERTIGGESTELLT: 'bg-green-100 text-green-800',
      ABGERECHNET: 'bg-purple-100 text-purple-800',
      ARCHIVIERT: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AKQUISE: 'Akquise',
      IN_BEARBEITUNG: 'In Bearbeitung',
      PAUSE: 'Pause',
      FERTIGGESTELLT: 'Fertiggestellt',
      ABGERECHNET: 'Abgerechnet',
      ARCHIVIERT: 'Archiviert',
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Aktuelle Projekte</h2>
        </div>
        <Link href="/cockpit/projects" className="text-sm text-blue-600 hover:text-blue-800">
          Alle anzeigen →
        </Link>
      </div>
      
      {isLoading ? (
        <p className="text-gray-500">Lade Projekte...</p>
      ) : projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/cockpit/projects/${project.id}`}
              className="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {project.projectNumber} - {project.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Erstellt am {new Date(project.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Keine Projekte vorhanden.</p>
      )}
    </div>
  );
}