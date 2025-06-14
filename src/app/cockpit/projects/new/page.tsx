'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('AKQUISE');
  const [budget, setBudget] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data: any = {
        name,
        status,
      };

      // Only include budget if provided
      if (budget) {
        data.budget = parseFloat(budget);
      }

      // Only include plotArea if provided
      if (plotArea) {
        data.plotArea = parseFloat(plotArea);
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/cockpit/projects');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Fehler beim Erstellen des Projekts');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Netzwerkfehler beim Erstellen des Projekts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Neues Projekt anlegen</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Projektname
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Bürogebäude Hauptstraße"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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

        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium mb-2">
            Budget in € (optional)
          </label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. 50000"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="plotArea" className="block text-sm font-medium mb-2">
            Grundstücksfläche in m² (optional)
          </label>
          <input
            type="number"
            id="plotArea"
            value={plotArea}
            onChange={(e) => setPlotArea(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. 1500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Wird angelegt...' : 'Projekt anlegen'}
        </button>
      </form>
    </main>
  );
}