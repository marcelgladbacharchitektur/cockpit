'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, User, Briefcase, Building, Users2, CircleEllipsis, Mail, Phone, MapPin, Globe, Edit } from 'lucide-react';

interface EmailAddress {
  id: string;
  email: string;
  label?: string;
}

interface PhoneNumber {
  id: string;
  phone: string;
  label?: string;
}

interface Person {
  id: string;
  titlePrefix?: string;
  firstName: string;
  lastName: string;
  titleSuffix?: string;
  emails: EmailAddress[];
  phones: PhoneNumber[];
}

interface Address {
  id: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  label?: string;
}

interface ProjectAssignment {
  id: string;
  role: string;
  project: {
    id: string;
    projectNumber: string;
    name: string;
    status: string;
  };
}

interface ContactMetadata {
  id: string;
  key: string;
  value: string;
}

interface ContactGroup {
  id: string;
  name: string;
  category: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  persons: Person[];
  addresses: Address[];
  assignments: ProjectAssignment[];
  metadata: ContactMetadata[];
}

const categoryConfig = {
  AUSFUEHRENDE_FIRMA: { label: 'Ausführende Firma', color: 'bg-green-100 text-green-800', icon: Building2 },
  PLANER: { label: 'Planer', color: 'bg-blue-100 text-blue-800', icon: Briefcase },
  AUFTRAGGEBER: { label: 'Auftraggeber', color: 'bg-purple-100 text-purple-800', icon: User },
  BEHOERDE: { label: 'Behörde', color: 'bg-orange-100 text-orange-800', icon: Building },
  VERTRETER: { label: 'Vertreter', color: 'bg-yellow-100 text-yellow-800', icon: Users2 },
  SONSTIGER: { label: 'Sonstiger', color: 'bg-gray-100 text-gray-800', icon: CircleEllipsis },
};

export default function ContactDetailPage() {
  const params = useParams();
  const [contactGroup, setContactGroup] = useState<ContactGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContactGroup = async () => {
      try {
        const response = await fetch(`/api/contacts/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Kontakt nicht gefunden');
          } else {
            setError('Fehler beim Laden des Kontakts');
          }
          return;
        }
        const data = await response.json();
        setContactGroup(data);
      } catch (error) {
        console.error('Error fetching contact group:', error);
        setError('Netzwerkfehler beim Laden des Kontakts');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchContactGroup();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div>
        <p>Lade Kontaktdetails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded">
          {error}
        </div>
        <Link href="/cockpit/contacts" className="text-blue-500 hover:underline mt-4 inline-block">
          Zurück zur Kontaktliste
        </Link>
      </div>
    );
  }

  if (!contactGroup) {
    return null;
  }

  const config = categoryConfig[contactGroup.category as keyof typeof categoryConfig] || categoryConfig.SONSTIGER;
  const Icon = config.icon;

  const formatPersonName = (person: Person) => {
    const parts = [];
    if (person.titlePrefix) parts.push(person.titlePrefix);
    parts.push(person.firstName);
    parts.push(person.lastName);
    if (person.titleSuffix) parts.push(person.titleSuffix);
    return parts.join(' ');
  };

  const formatAddress = (address: Address) => {
    const lines = [];
    if (address.street && address.houseNumber) {
      lines.push(`${address.street} ${address.houseNumber}`);
    } else if (address.street) {
      lines.push(address.street);
    }
    if (address.postalCode && address.city) {
      lines.push(`${address.postalCode} ${address.city}`);
    } else if (address.city) {
      lines.push(address.city);
    }
    if (address.country && address.country !== 'Österreich') {
      lines.push(address.country);
    }
    return lines;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/cockpit/contacts" className="text-blue-500 hover:underline">
          ← Zurück zur Kontaktliste
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Icon className="w-8 h-8 text-gray-400 mt-1" />
            <div>
              <h1 className="text-3xl font-bold mb-2">{contactGroup.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
          <Link
            href={`/cockpit/contacts/${contactGroup.id}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Kontaktinformationen</h2>
          
          {contactGroup.website && (
            <div className="mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <a 
                href={contactGroup.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {contactGroup.website}
              </a>
            </div>
          )}

          <div className="text-sm text-gray-600 mt-4">
            <p>Erstellt am: {formatDate(contactGroup.createdAt)}</p>
            <p>Zuletzt aktualisiert: {formatDate(contactGroup.updatedAt)}</p>
          </div>
        </div>

        {/* Addresses */}
        {contactGroup.addresses.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Adressen</h2>
            <div className="space-y-4">
              {contactGroup.addresses.map((address) => (
                <div key={address.id}>
                  {address.label && (
                    <p className="text-sm font-medium text-gray-600 mb-1">{address.label}</p>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      {formatAddress(address).map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Persons */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Personen</h2>
          {contactGroup.persons.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {contactGroup.persons.map((person) => (
                <div key={person.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {formatPersonName(person)}
                  </h3>
                  
                  {person.emails.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {person.emails.map((email) => (
                        <div key={email.id} className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${email.email}`} className="text-blue-500 hover:underline">
                            {email.email}
                          </a>
                          {email.label && <span className="text-gray-500">({email.label})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {person.phones.length > 0 && (
                    <div className="space-y-1">
                      {person.phones.map((phone) => (
                        <div key={phone.id} className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${phone.phone}`} className="text-blue-500 hover:underline">
                            {phone.phone}
                          </a>
                          {phone.label && <span className="text-gray-500">({phone.label})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Keine Personen zugeordnet.</p>
          )}
        </div>

        {/* Projects */}
        {contactGroup.assignments.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Beteiligte Projekte</h2>
            <div className="space-y-2">
              {contactGroup.assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/cockpit/projects/${assignment.project.id}`}
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {assignment.project.projectNumber} - {assignment.project.name}
                      </span>
                      <span className="text-gray-600 ml-2">
                        als {assignment.role}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {assignment.project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {contactGroup.metadata.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Zusätzliche Informationen</h2>
            <dl className="space-y-2">
              {contactGroup.metadata.map((meta) => (
                <div key={meta.id}>
                  <dt className="font-medium text-gray-600">{meta.key}:</dt>
                  <dd className="ml-4">{meta.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}