'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Calendar, EuroIcon, Home, Building2, HardHat, Search } from 'lucide-react';
import ProjectCardSkeleton from '@/components/skeletons/ProjectCardSkeleton';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALLE');
  const [typeFilter, setTypeFilter] = useState('ALLE');

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

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALLE' || project.status === statusFilter;
    const matchesType = typeFilter === 'ALLE' || project.projectType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projektübersicht</h1>
        <Link
          href="/cockpit/projects/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Neues Projekt
        </Link>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="search"
            placeholder="Suche nach Name, Nummer oder Adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALLE">Alle Status</option>
            <option value="AKQUISE">Akquise</option>
            <option value="IN_BEARBEITUNG">In Bearbeitung</option>
            <option value="PAUSE">Pause</option>
            <option value="ABGESCHLOSSEN">Abgeschlossen</option>
            <option value="ARCHIVIERT">Archiviert</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALLE">Alle Typen</option>
            <option value="NEUBAU">Neubau</option>
            <option value="UMBAU">Umbau</option>
            <option value="ZUBAU">Zubau</option>
            <option value="SANIERUNG">Sanierung</option>
            <option value="AUFSTOCKUNG">Aufstockung</option>
            <option value="UMNUTZUNG">Umnutzung</option>
            <option value="DENKMALSCHUTZ">Denkmalschutz</option>
            <option value="SONSTIGES">Sonstiges</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Keine Projekte vorhanden.</p>
              <Link
                href="/cockpit/projects/new"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Erstes Projekt erstellen
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/cockpit/projects/${project.id}`}
                  className="block bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.projectNumber}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'IN_BEARBEITUNG' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'ABGESCHLOSSEN' ? 'bg-green-100 text-green-700' :
                      project.status === 'PAUSE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {project.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{project.address}</span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center gap-2">
                        <EuroIcon className="h-4 w-4" />
                        <span>{project.budget.toLocaleString('de-DE')} €</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {project.projectType === 'NEUBAU' ? <Home className="h-4 w-4" /> :
                       project.projectType === 'UMBAU' ? <Building2 className="h-4 w-4" /> :
                       <HardHat className="h-4 w-4" />}
                      <span>{project.projectType}</span>
                    </div>
                  </div>
                  
                  {project.updatedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-500">
                        Aktualisiert: {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}