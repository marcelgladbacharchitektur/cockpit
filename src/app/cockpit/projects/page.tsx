'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projektübersicht</h1>
        <Link
          href="/cockpit/projects/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Neues Projekt
        </Link>
      </div>
      
      {isLoading ? (
        <p>Lade Projekte...</p>
      ) : (
        <div>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/cockpit/projects/${project.id}`}
              className="block p-4 border rounded-md mb-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold">
                {project.projectNumber} - {project.name}
              </div>
              <div className="text-sm text-gray-600">
                Status: {project.status}
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500">Keine Projekte vorhanden.</p>
          )}
        </div>
      )}
    </main>
  );
}