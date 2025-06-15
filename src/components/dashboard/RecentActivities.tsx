'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface ProjectNote {
  id: string;
  content: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    projectNumber: string;
  };
}

export default function RecentActivities() {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotes = async () => {
      try {
        const response = await fetch('/api/dashboard/recent-notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Error fetching recent notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentNotes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `vor ${diffMins} Minute${diffMins !== 1 ? 'n' : ''}`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} Stunde${diffHours !== 1 ? 'n' : ''}`;
    } else if (diffDays < 7) {
      return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
    } else {
      return date.toLocaleDateString('de-DE');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <h2 className="text-xl font-semibold">Letzte Aktivitäten</h2>
      </div>
      
      {isLoading ? (
        <p className="text-gray-500">Lade Aktivitäten...</p>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="border-l-3 border-gray-200 pl-4 hover:border-blue-400 transition-colors">
              <Link href={`/cockpit/projects/${note.project.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {note.project.projectNumber} - {note.project.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Keine Notizen vorhanden.</p>
      )}
    </div>
  );
}