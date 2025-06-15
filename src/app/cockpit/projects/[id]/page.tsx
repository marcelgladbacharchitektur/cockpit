'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Upload, Download, Plus, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

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
    fileName: string;
    filePath: string;
    fileSize: number;
    description?: string;
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentType, setUploadDocumentType] = useState('VERTRAG');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Time tracking states
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [timeEntryDate, setTimeEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeEntryStartTime, setTimeEntryStartTime] = useState('09:00');
  const [timeEntryEndTime, setTimeEntryEndTime] = useState('17:00');
  const [timeEntryDescription, setTimeEntryDescription] = useState('');
  const [isSubmittingTimeEntry, setIsSubmittingTimeEntry] = useState(false);
  const [timeEntryError, setTimeEntryError] = useState('');
  
  // Tracked plans states
  const [trackedPlans, setTrackedPlans] = useState<any[]>([]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionNumber, setVersionNumber] = useState('1');
  const [versionDescription, setVersionDescription] = useState('');
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [planError, setPlanError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/projects/${params.id}/time-entries`);
        if (response.ok) {
          const data = await response.json();
          setTimeEntries(data.entries);
          setTotalHours(data.totalHours);
        }
      } catch (error) {
        console.error('Error fetching time entries:', error);
      }
    };

    if (params.id) {
      fetchTimeEntries();
    }
  }, [params.id]);

  useEffect(() => {
    const fetchTrackedPlans = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/projects/${params.id}/tracked-plans`);
        if (response.ok) {
          const data = await response.json();
          setTrackedPlans(data);
        }
      } catch (error) {
        console.error('Error fetching tracked plans:', error);
      }
    };

    if (params.id) {
      fetchTrackedPlans();
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      VERTRAG: 'Vertrag',
      ANGEBOT: 'Angebot',
      RECHNUNG: 'Rechnung',
      PLAN: 'Plan',
      GUTACHTEN: 'Gutachten',
      PROTOKOLL: 'Protokoll',
      KORRESPONDENZ: 'Korrespondenz',
      SONSTIGES: 'Sonstiges',
    };
    return labels[type] || type;
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !project) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('documentType', uploadDocumentType);
    formData.append('description', uploadDescription);

    try {
      const response = await fetch(`/api/projects/${project.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh project data to show new document
        const projectResponse = await fetch(`/api/projects/${params.id}`);
        const data = await projectResponse.json();
        setProject(data);
        
        // Reset form and close modal
        setUploadFile(null);
        setUploadDescription('');
        setShowUploadModal(false);
        toast.success('Dokument erfolgreich hochgeladen');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Hochladen';
        setUploadError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = 'Netzwerkfehler beim Hochladen';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTimeEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmittingTimeEntry(true);
    setTimeEntryError('');

    try {
      const startDateTime = new Date(`${timeEntryDate}T${timeEntryStartTime}:00`);
      const endDateTime = new Date(`${timeEntryDate}T${timeEntryEndTime}:00`);

      const response = await fetch(`/api/projects/${project.id}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          description: timeEntryDescription,
        }),
      });

      if (response.ok) {
        // Refresh time entries
        const timeResponse = await fetch(`/api/projects/${params.id}/time-entries`);
        const data = await timeResponse.json();
        setTimeEntries(data.entries);
        setTotalHours(data.totalHours);
        
        // Reset form and close modal
        setTimeEntryDescription('');
        setShowTimeEntryModal(false);
        toast.success('Zeiteintrag erfolgreich gespeichert');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Speichern des Zeiteintrags';
        setTimeEntryError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Time entry error:', error);
      const errorMessage = 'Netzwerkfehler beim Speichern';
      setTimeEntryError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingTimeEntry(false);
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.round(diffMinutes % 60);
    return `${hours}h ${minutes}min`;
  };

  const handleCreateTrackedPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsCreatingPlan(true);
    setPlanError('');

    try {
      const response = await fetch(`/api/projects/${project.id}/tracked-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPlanTitle,
        }),
      });

      if (response.ok) {
        // Refresh tracked plans
        const plansResponse = await fetch(`/api/projects/${params.id}/tracked-plans`);
        const data = await plansResponse.json();
        setTrackedPlans(data);
        
        // Reset form and close modal
        setNewPlanTitle('');
        setShowNewPlanModal(false);
        toast.success('Plantyp erfolgreich erstellt');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Erstellen des Plantyps';
        setPlanError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating tracked plan:', error);
      const errorMessage = 'Netzwerkfehler beim Erstellen';
      setPlanError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleVersionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionFile || !selectedPlanId) return;

    setIsUploadingVersion(true);
    setPlanError('');

    const formData = new FormData();
    formData.append('file', versionFile);
    formData.append('versionNumber', versionNumber);
    formData.append('description', versionDescription);

    try {
      const response = await fetch(`/api/plans/${selectedPlanId}/versions`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh tracked plans
        const plansResponse = await fetch(`/api/projects/${params.id}/tracked-plans`);
        const data = await plansResponse.json();
        setTrackedPlans(data);
        
        // Reset form and close modal
        setVersionFile(null);
        setVersionDescription('');
        setShowVersionModal(false);
        toast.success('Version erfolgreich hochgeladen');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Hochladen der Version';
        setPlanError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = 'Netzwerkfehler beim Hochladen';
      setPlanError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Link in Zwischenablage kopiert');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getVerificationUrl = (versionId: string) => {
    return `${window.location.origin}/verify/${versionId}`;
  };

  const openNewVersionModal = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = trackedPlans.find(p => p.id === planId);
    if (plan && plan.versions.length > 0) {
      setVersionNumber((plan.versions[0].versionNumber + 1).toString());
    } else {
      setVersionNumber('1');
    }
    setShowVersionModal(true);
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/cockpit/projects" className="text-blue-500 hover:underline">
          ← Zurück zur Projektliste
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {project.projectNumber} - {project.name}
            </h1>
            <div className="text-gray-600">
              Status: <span className="font-semibold">{project.status}</span>
            </div>
          </div>
          <Link
            href={`/cockpit/projects/${project.id}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Projekt bearbeiten
          </Link>
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

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dokumente</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Upload className="w-4 h-4" />
              Dokument hochladen
            </button>
          </div>
          
          {project.documents.length > 0 ? (
            <div className="space-y-3">
              {project.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <div className="font-medium">{doc.fileName}</div>
                        <div className="text-sm text-gray-600">
                          {getDocumentTypeLabel(doc.documentType)} • Version {doc.version} • {formatFileSize(doc.fileSize)}
                        </div>
                        {doc.description && (
                          <div className="text-sm text-gray-600 mt-1">{doc.description}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Hochgeladen am {formatDate(doc.createdAt)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`/api/documents/${doc.id}`}
                      download
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keine Dokumente vorhanden.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Zeiterfassung</h2>
              <p className="text-sm text-gray-600">Gesamt: {totalHours} Stunden</p>
            </div>
            <button
              onClick={() => setShowTimeEntryModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Zeit erfassen
            </button>
          </div>
          
          {timeEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dauer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beschreibung
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(entry.startTime).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {' '}
                        {new Date(entry.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDuration(entry.startTime, entry.endTime)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Keine Zeiteinträge vorhanden.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Versionierte Pläne</h2>
            <button
              onClick={() => setShowNewPlanModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Neuen Plantyp anlegen
            </button>
          </div>
          
          {trackedPlans.length > 0 ? (
            <div className="space-y-6">
              {trackedPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                    <button
                      onClick={() => openNewVersionModal(plan.id)}
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Neue Version hochladen
                    </button>
                  </div>
                  
                  {plan.versions.length > 0 ? (
                    <div className="space-y-2">
                      {plan.versions.map((version: any, index: number) => (
                        <div 
                          key={version.id} 
                          className={`p-3 rounded ${index === 0 ? 'bg-green-50 border-green-200 border' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Version {version.versionNumber}</span>
                                {index === 0 && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Aktuell
                                  </span>
                                )}
                              </div>
                              {version.description && (
                                <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Erstellt am {new Date(version.createdAt).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <a
                                href={getVerificationUrl(version.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600"
                                title="Verifizierungsseite öffnen"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => copyToClipboard(getVerificationUrl(version.id), version.id)}
                                className="text-gray-500 hover:text-gray-700"
                                title="Verifizierungs-Link kopieren"
                              >
                                {copiedId === version.id ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                            ID: {version.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Versionen hochgeladen.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keine versionierten Pläne vorhanden.</p>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Dokument hochladen
              </h3>
              <form onSubmit={handleFileUpload}>
                <div className="mb-4">
                  <label htmlFor="file" className="block text-sm font-medium mb-2">
                    PDF-Datei *
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="documentType" className="block text-sm font-medium mb-2">
                    Dokumenttyp *
                  </label>
                  <select
                    id="documentType"
                    value={uploadDocumentType}
                    onChange={(e) => setUploadDocumentType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="VERTRAG">Vertrag</option>
                    <option value="ANGEBOT">Angebot</option>
                    <option value="RECHNUNG">Rechnung</option>
                    <option value="PLAN">Plan</option>
                    <option value="GUTACHTEN">Gutachten</option>
                    <option value="PROTOKOLL">Protokoll</option>
                    <option value="KORRESPONDENZ">Korrespondenz</option>
                    <option value="SONSTIGES">Sonstiges</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    id="description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Optionale Beschreibung des Dokuments..."
                  />
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
                    {uploadError}
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadDescription('');
                      setUploadError('');
                    }}
                    disabled={isUploading}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isUploading ? 'Hochladen...' : 'Hochladen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Time Entry Modal */}
      {showTimeEntryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Zeit erfassen
              </h3>
              <form onSubmit={handleTimeEntrySubmit}>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium mb-2">
                    Datum *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={timeEntryDate}
                    onChange={(e) => setTimeEntryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                      Startzeit *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={timeEntryStartTime}
                      onChange={(e) => setTimeEntryStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                      Endzeit *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={timeEntryEndTime}
                      onChange={(e) => setTimeEntryEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="timeDescription" className="block text-sm font-medium mb-2">
                    Beschreibung der Tätigkeit *
                  </label>
                  <textarea
                    id="timeDescription"
                    value={timeEntryDescription}
                    onChange={(e) => setTimeEntryDescription(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Was wurde gemacht?"
                  />
                </div>

                {timeEntryError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
                    {timeEntryError}
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeEntryModal(false);
                      setTimeEntryDescription('');
                      setTimeEntryError('');
                    }}
                    disabled={isSubmittingTimeEntry}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTimeEntry}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isSubmittingTimeEntry ? 'Speichern...' : 'Speichern'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Plan Type Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Neuen Plantyp anlegen
              </h3>
              <form onSubmit={handleCreateTrackedPlan}>
                <div className="mb-4">
                  <label htmlFor="planTitle" className="block text-sm font-medium mb-2">
                    Plantitel *
                  </label>
                  <input
                    type="text"
                    id="planTitle"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="z.B. Grundriss Erdgeschoss"
                  />
                </div>

                {planError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
                    {planError}
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewPlanModal(false);
                      setNewPlanTitle('');
                      setPlanError('');
                    }}
                    disabled={isCreatingPlan}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingPlan}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isCreatingPlan ? 'Erstellen...' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Version Upload Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Neue Version hochladen
              </h3>
              <form onSubmit={handleVersionUpload}>
                <div className="mb-4">
                  <label htmlFor="versionFile" className="block text-sm font-medium mb-2">
                    PDF-Datei *
                  </label>
                  <input
                    type="file"
                    id="versionFile"
                    accept=".pdf"
                    onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="versionNumber" className="block text-sm font-medium mb-2">
                    Versionsnummer *
                  </label>
                  <input
                    type="number"
                    id="versionNumber"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="versionDescription" className="block text-sm font-medium mb-2">
                    Änderungsbeschreibung
                  </label>
                  <textarea
                    id="versionDescription"
                    value={versionDescription}
                    onChange={(e) => setVersionDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Was wurde in dieser Version geändert?"
                  />
                </div>

                {planError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
                    {planError}
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVersionModal(false);
                      setVersionFile(null);
                      setVersionDescription('');
                      setPlanError('');
                    }}
                    disabled={isUploadingVersion}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingVersion || !versionFile}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isUploadingVersion ? 'Hochladen...' : 'Hochladen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}