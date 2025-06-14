'use client';

import { useState, useEffect } from 'react';

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
      <h1 className="text-3xl font-bold mb-6">Projektübersicht</h1>
      
      {isLoading ? (
        <p>Lade Projekte...</p>
      ) : (
        <div>
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-md mb-2"
            >
              <div className="font-semibold">
                {project.projectNumber} - {project.name}
              </div>
              <div className="text-sm text-gray-600">
                Status: {project.status}
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500">Keine Projekte vorhanden.</p>
          )}
        </div>
      )}
    </main>
  );
}