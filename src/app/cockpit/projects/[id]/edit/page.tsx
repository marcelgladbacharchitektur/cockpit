'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectName, setProjectName] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectSector, setProjectSector] = useState('');
  const [parcelNumber, setParcelNumber] = useState('');
  const [plotAddress, setPlotAddress] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [cadastralCommunity, setCadastralCommunity] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [zoning, setZoning] = useState('');
  const [plotNotes, setPlotNotes] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          setError('Projekt nicht gefunden');
          return;
        }
        const project = await response.json();
        
        // Populate form fields with existing data
        setName(project.name || '');
        setProjectName(project.name || ''); // Store for delete confirmation
        setStatus(project.status || '');
        setBudget(project.budget ? project.budget.toString() : '');
        setDescription(project.description || '');
        setProjectType(project.projectType || '');
        setProjectSector(project.projectSector || '');
        setParcelNumber(project.parcelNumber || '');
        setPlotAddress(project.plotAddress || '');
        setPlotArea(project.plotArea ? project.plotArea.toString() : '');
        setCadastralCommunity(project.cadastralCommunity || '');
        setRegistrationNumber(project.registrationNumber || '');
        setZoning(project.zoning || '');
        setPlotNotes(project.plotNotes || '');
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Fehler beim Laden des Projekts');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data: any = {
        name,
        status,
        description: description || null,
        projectType: projectType || null,
        projectSector: projectSector || null,
        parcelNumber: parcelNumber || null,
        plotAddress: plotAddress || null,
        cadastralCommunity: cadastralCommunity || null,
        registrationNumber: registrationNumber || null,
        zoning: zoning || null,
        plotNotes: plotNotes || null,
      };

      // Only include numeric fields if they have values
      if (budget) {
        data.budget = parseFloat(budget);
      }
      if (plotArea) {
        data.plotArea = parseFloat(plotArea);
      }

      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Projekt erfolgreich aktualisiert');
        router.push(`/cockpit/projects/${params.id}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Speichern des Projekts';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = 'Netzwerkfehler beim Speichern des Projekts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Projekt erfolgreich gelöscht');
        router.push('/cockpit/projects');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Löschen des Projekts';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      const errorMessage = 'Netzwerkfehler beim Löschen des Projekts';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <p>Lade Projektdaten...</p>
      </div>
    );
  }

  if (error && isLoading === false && !name) {
    return (
      <div>
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Link href="/cockpit/projects" className="text-blue-500 hover:underline">
          Zurück zur Projektliste
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/cockpit/projects/${params.id}`} className="text-blue-500 hover:underline">
          ← Zurück zur Projektansicht
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Projekt bearbeiten</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stammdaten</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Projektname *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AKQUISE">AKQUISE</option>
                <option value="IN_BEARBEITUNG">IN_BEARBEITUNG</option>
                <option value="PAUSE">PAUSE</option>
                <option value="FERTIGGESTELLT">FERTIGGESTELLT</option>
                <option value="ABGERECHNET">ABGERECHNET</option>
                <option value="ARCHIVIERT">ARCHIVIERT</option>
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium mb-2">
                Budget in €
              </label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="projectType" className="block text-sm font-medium mb-2">
                Projekttyp
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Bitte wählen --</option>
                <option value="NEUBAU">NEUBAU</option>
                <option value="UMBAU">UMBAU</option>
                <option value="ZUBAU">ZUBAU</option>
                <option value="GUTACHTEN">GUTACHTEN</option>
                <option value="STUDIE">STUDIE</option>
                <option value="KONZEPT">KONZEPT</option>
                <option value="WETTBEWERB">WETTBEWERB</option>
                <option value="BERATUNG">BERATUNG</option>
              </select>
            </div>

            <div>
              <label htmlFor="projectSector" className="block text-sm font-medium mb-2">
                Sektor
              </label>
              <select
                id="projectSector"
                value={projectSector}
                onChange={(e) => setProjectSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Bitte wählen --</option>
                <option value="OEFFENTLICH">ÖFFENTLICH</option>
                <option value="PRIVAT">PRIVAT</option>
                <option value="GEWERBLICH">GEWERBLICH</option>
                <option value="HOTEL_GASTRO">HOTEL_GASTRO</option>
                <option value="BILDUNG_KULTUR">BILDUNG_KULTUR</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Beschreibung
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Grundstücksdaten</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="parcelNumber" className="block text-sm font-medium mb-2">
                Grundstücksnummer
              </label>
              <input
                type="text"
                id="parcelNumber"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="plotArea" className="block text-sm font-medium mb-2">
                Grundstücksfläche in m²
              </label>
              <input
                type="number"
                id="plotArea"
                value={plotArea}
                onChange={(e) => setPlotArea(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="plotAddress" className="block text-sm font-medium mb-2">
                Adresse
              </label>
              <input
                type="text"
                id="plotAddress"
                value={plotAddress}
                onChange={(e) => setPlotAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cadastralCommunity" className="block text-sm font-medium mb-2">
                Katastralgemeinde
              </label>
              <input
                type="text"
                id="cadastralCommunity"
                value={cadastralCommunity}
                onChange={(e) => setCadastralCommunity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium mb-2">
                EZ-Nummer
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="zoning" className="block text-sm font-medium mb-2">
                Widmung
              </label>
              <input
                type="text"
                id="zoning"
                value={zoning}
                onChange={(e) => setZoning(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="plotNotes" className="block text-sm font-medium mb-2">
                Notizen zum Grundstück
              </label>
              <textarea
                id="plotNotes"
                value={plotNotes}
                onChange={(e) => setPlotNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Speichern...' : 'Änderungen speichern'}
            </button>
            <Link
              href={`/cockpit/projects/${params.id}`}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              Abbrechen
            </Link>
          </div>
          
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
          >
            Projekt löschen
          </button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Projekt löschen bestätigen
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Möchten Sie das Projekt "{projectName}" wirklich endgültig löschen? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                  >
                    {isDeleting ? 'Lösche...' : 'Endgültig löschen'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}