'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  projectNumber: string;
  name: string;
  status: string;
  budget?: number;
  description?: string;
  projectType?: string;
  projectSector?: string;
  parcelNumber?: string;
  plotAddress?: string;
  plotArea?: number;
  cadastralCommunity?: string;
  registrationNumber?: string;
  zoning?: string;
  plotNotes?: string;
  createdAt: string;
  updatedAt: string;
  assignments: Array<{
    id: string;
    role: string;
    contactGroup: {
      id: string;
      name: string;
      category: string;
    };
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
  metadata: Array<{
    id: string;
    key: string;
    value: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    filePath: string;
    version: number;
    createdAt: string;
  }>;
  timeEntries: Array<{
    id: string;
    startTime: string;
    endTime: string;
    description: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Projekt nicht gefunden');
          } else {
            setError('Fehler beim Laden des Projekts');
          }
          return;
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Netzwerkfehler beim Laden des Projekts');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Lade Projektdetails...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
          {error}
        </div>
        <Link href="/cockpit/projects" className="text-blue-500 hover:underline mt-4 inline-block">
          Zurück zur Projektliste
        </Link>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link href="/cockpit/projects" className="text-blue-500 hover:underline">
          ← Zurück zur Projektliste
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {project.projectNumber} - {project.name}
        </h1>
        <div className="text-gray-600">
          Status: <span className="font-semibold">{project.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Projektdaten</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium text-gray-600">Budget:</dt>
              <dd>{formatCurrency(project.budget)}</dd>
            </div>
            {project.description && (
              <div>
                <dt className="font-medium text-gray-600">Beschreibung:</dt>
                <dd className="whitespace-pre-wrap">{project.description}</dd>
              </div>
            )}
            {project.projectType && (
              <div>
                <dt className="font-medium text-gray-600">Projekttyp:</dt>
                <dd>{project.projectType}</dd>
              </div>
            )}
            {project.projectSector && (
              <div>
                <dt className="font-medium text-gray-600">Sektor:</dt>
                <dd>{project.projectSector}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-600">Erstellt am:</dt>
              <dd>{formatDate(project.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Zuletzt aktualisiert:</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Grundstücksdaten</h2>
          <dl className="space-y-2">
            {project.parcelNumber && (
              <div>
                <dt className="font-medium text-gray-600">Grundstücksnummer:</dt>
                <dd>{project.parcelNumber}</dd>
              </div>
            )}
            {project.plotAddress && (
              <div>
                <dt className="font-medium text-gray-600">Adresse:</dt>
                <dd>{project.plotAddress}</dd>
              </div>
            )}
            {project.plotArea && (
              <div>
                <dt className="font-medium text-gray-600">Grundstücksfläche:</dt>
                <dd>{project.plotArea} m²</dd>
              </div>
            )}
            {project.cadastralCommunity && (
              <div>
                <dt className="font-medium text-gray-600">Katastralgemeinde:</dt>
                <dd>{project.cadastralCommunity}</dd>
              </div>
            )}
            {project.registrationNumber && (
              <div>
                <dt className="font-medium text-gray-600">EZ-Nummer:</dt>
                <dd>{project.registrationNumber}</dd>
              </div>
            )}
            {project.zoning && (
              <div>
                <dt className="font-medium text-gray-600">Widmung:</dt>
                <dd>{project.zoning}</dd>
              </div>
            )}
            {project.plotNotes && (
              <div>
                <dt className="font-medium text-gray-600">Notizen:</dt>
                <dd className="whitespace-pre-wrap">{project.plotNotes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Projektbeteiligte</h2>
          {project.assignments.length > 0 ? (
            <ul className="space-y-2">
              {project.assignments.map((assignment) => (
                <li key={assignment.id} className="border-b pb-2">
                  <div className="font-medium">{assignment.contactGroup.name}</div>
                  <div className="text-sm text-gray-600">
                    {assignment.role} ({assignment.contactGroup.category})
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Keine Projektbeteiligten zugeordnet.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notizen</h2>
          {project.notes.length > 0 ? (
            <ul className="space-y-2">
              {project.notes.map((note) => (
                <li key={note.id} className="border-b pb-2">
                  <div className="text-sm text-gray-600">{formatDate(note.createdAt)}</div>
                  <div>{note.content}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Keine Notizen vorhanden.</p>
          )}
        </div>

        {project.metadata.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Zusätzliche Informationen</h2>
            <dl className="space-y-2">
              {project.metadata.map((meta) => (
                <div key={meta.id}>
                  <dt className="font-medium text-gray-600">{meta.key}:</dt>
                  <dd>{meta.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {project.documents.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Dokumente</h2>
            <ul className="space-y-2">
              {project.documents.map((doc) => (
                <li key={doc.id} className="border-b pb-2">
                  <div className="font-medium">{doc.documentType}</div>
                  <div className="text-sm text-gray-600">
                    Version {doc.version} - {formatDate(doc.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}