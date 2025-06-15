'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailData {
  id?: string;
  email: string;
  label: string;
  _destroy?: boolean;
}

interface PhoneData {
  id?: string;
  phone: string;
  label: string;
  _destroy?: boolean;
}

interface PersonData {
  id?: string;
  titlePrefix: string;
  firstName: string;
  lastName: string;
  titleSuffix: string;
  emails: EmailData[];
  phones: PhoneData[];
  _destroy?: boolean;
}

interface AddressData {
  id?: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  label: string;
  _destroy?: boolean;
}

const categoryOptions = [
  { value: 'AUSFUEHRENDE_FIRMA', label: 'Ausführende Firma' },
  { value: 'PLANER', label: 'Planer' },
  { value: 'AUFTRAGGEBER', label: 'Auftraggeber' },
  { value: 'BEHOERDE', label: 'Behörde' },
  { value: 'VERTRETER', label: 'Vertreter' },
  { value: 'SONSTIGER', label: 'Sonstiger' },
];

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactGroupName, setContactGroupName] = useState('');

  // Group fields
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');

  // Complex fields
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [persons, setPersons] = useState<PersonData[]>([]);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${params.id}`);
        if (!response.ok) {
          setError('Kontakt nicht gefunden');
          return;
        }
        const contact = await response.json();
        
        // Populate form fields
        setGroupName(contact.name || '');
        setContactGroupName(contact.name || ''); // Store for delete confirmation
        setCategory(contact.category || '');
        setWebsite(contact.website || '');
        
        // Map addresses
        setAddresses(contact.addresses.map((addr: any) => ({
          id: addr.id,
          street: addr.street || '',
          houseNumber: addr.houseNumber || '',
          postalCode: addr.postalCode || '',
          city: addr.city || '',
          country: addr.country || 'Österreich',
          label: addr.label || 'Hauptadresse',
        })));
        
        // Map persons with their contact info
        setPersons(contact.persons.map((person: any) => ({
          id: person.id,
          titlePrefix: person.titlePrefix || '',
          firstName: person.firstName || '',
          lastName: person.lastName || '',
          titleSuffix: person.titleSuffix || '',
          emails: person.emails.map((email: any) => ({
            id: email.id,
            email: email.email,
            label: email.label || 'Geschäftlich',
          })),
          phones: person.phones.map((phone: any) => ({
            id: phone.id,
            phone: phone.phone,
            label: phone.label || 'Geschäftlich',
          })),
        })));
      } catch (error) {
        console.error('Error fetching contact:', error);
        setError('Fehler beim Laden des Kontakts');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchContact();
    }
  }, [params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        group: {
          name: groupName,
          category,
          website: website || null,
        },
        addresses: addresses.filter(a => !a._destroy),
        persons: persons.filter(p => !p._destroy).map(person => ({
          ...person,
          emails: person.emails.filter(e => !e._destroy),
          phones: person.phones.filter(p => !p._destroy),
        })),
        // Include IDs of items to delete
        deletions: {
          addresses: addresses.filter(a => a._destroy && a.id).map(a => a.id),
          persons: persons.filter(p => p._destroy && p.id).map(p => p.id),
        },
      };

      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Kontakt erfolgreich aktualisiert');
        router.push(`/cockpit/contacts/${params.id}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Speichern des Kontakts';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      const errorMessage = 'Netzwerkfehler beim Speichern des Kontakts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for managing dynamic fields
  const addAddress = () => {
    setAddresses([...addresses, {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Österreich',
      label: 'Zusätzliche Adresse',
    }]);
  };

  const removeAddress = (index: number) => {
    const updated = [...addresses];
    if (updated[index].id) {
      updated[index]._destroy = true;
    } else {
      updated.splice(index, 1);
    }
    setAddresses(updated);
  };

  const addPerson = () => {
    setPersons([...persons, {
      titlePrefix: '',
      firstName: '',
      lastName: '',
      titleSuffix: '',
      emails: [],
      phones: [],
    }]);
  };

  const removePerson = (index: number) => {
    const updated = [...persons];
    if (updated[index].id) {
      updated[index]._destroy = true;
    } else {
      updated.splice(index, 1);
    }
    setPersons(updated);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kontaktgruppe erfolgreich gelöscht');
        router.push('/cockpit/contacts');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Löschen der Kontaktgruppe';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting contact group:', error);
      const errorMessage = 'Netzwerkfehler beim Löschen der Kontaktgruppe';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const addEmail = (personIndex: number) => {
    const updated = [...persons];
    updated[personIndex].emails.push({
      email: '',
      label: 'Geschäftlich',
    });
    setPersons(updated);
  };

  const removeEmail = (personIndex: number, emailIndex: number) => {
    const updated = [...persons];
    if (updated[personIndex].emails[emailIndex].id) {
      updated[personIndex].emails[emailIndex]._destroy = true;
    } else {
      updated[personIndex].emails.splice(emailIndex, 1);
    }
    setPersons(updated);
  };

  const addPhone = (personIndex: number) => {
    const updated = [...persons];
    updated[personIndex].phones.push({
      phone: '',
      label: 'Geschäftlich',
    });
    setPersons(updated);
  };

  const removePhone = (personIndex: number, phoneIndex: number) => {
    const updated = [...persons];
    if (updated[personIndex].phones[phoneIndex].id) {
      updated[personIndex].phones[phoneIndex]._destroy = true;
    } else {
      updated[personIndex].phones.splice(phoneIndex, 1);
    }
    setPersons(updated);
  };

  if (isLoading) {
    return (
      <div>
        <p>Lade Kontaktdaten...</p>
      </div>
    );
  }

  if (error && isLoading === false && !groupName) {
    return (
      <div>
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Link href="/cockpit/contacts" className="text-blue-500 hover:underline">
          Zurück zur Kontaktliste
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/cockpit/contacts/${params.id}`} className="text-blue-500 hover:underline">
          ← Zurück zur Kontaktansicht
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Kontakt bearbeiten</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Group Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Gruppen-Informationen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium mb-2">
                Name der Gruppe/Firma *
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Kategorie *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Adressen</h2>
            <button
              type="button"
              onClick={addAddress}
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Adresse hinzufügen
            </button>
          </div>
          
          {addresses.filter(a => !a._destroy).map((address, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <input
                  type="text"
                  value={address.label}
                  onChange={(e) => {
                    const updated = [...addresses];
                    updated[index].label = e.target.value;
                    setAddresses(updated);
                  }}
                  placeholder="Bezeichnung (z.B. Hauptadresse)"
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => {
                    const updated = [...addresses];
                    updated[index].street = e.target.value;
                    setAddresses(updated);
                  }}
                  placeholder="Straße"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={address.houseNumber}
                  onChange={(e) => {
                    const updated = [...addresses];
                    updated[index].houseNumber = e.target.value;
                    setAddresses(updated);
                  }}
                  placeholder="Hausnummer"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => {
                    const updated = [...addresses];
                    updated[index].postalCode = e.target.value;
                    setAddresses(updated);
                  }}
                  placeholder="PLZ"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => {
                    const updated = [...addresses];
                    updated[index].city = e.target.value;
                    setAddresses(updated);
                  }}
                  placeholder="Ort"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Persons */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Personen</h2>
            <button
              type="button"
              onClick={addPerson}
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Person hinzufügen
            </button>
          </div>
          
          {persons.filter(p => !p._destroy).map((person, personIndex) => (
            <div key={personIndex} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">Person {personIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removePerson(personIndex)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={person.titlePrefix}
                  onChange={(e) => {
                    const updated = [...persons];
                    updated[personIndex].titlePrefix = e.target.value;
                    setPersons(updated);
                  }}
                  placeholder="Titel (vor dem Namen)"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={person.firstName}
                  onChange={(e) => {
                    const updated = [...persons];
                    updated[personIndex].firstName = e.target.value;
                    setPersons(updated);
                  }}
                  placeholder="Vorname *"
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={person.lastName}
                  onChange={(e) => {
                    const updated = [...persons];
                    updated[personIndex].lastName = e.target.value;
                    setPersons(updated);
                  }}
                  placeholder="Nachname *"
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={person.titleSuffix}
                  onChange={(e) => {
                    const updated = [...persons];
                    updated[personIndex].titleSuffix = e.target.value;
                    setPersons(updated);
                  }}
                  placeholder="Titel (nach dem Namen)"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Emails */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">E-Mails</label>
                  <button
                    type="button"
                    onClick={() => addEmail(personIndex)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    + E-Mail
                  </button>
                </div>
                {person.emails.filter(e => !e._destroy).map((email, emailIndex) => (
                  <div key={emailIndex} className="flex gap-2 mb-2">
                    <input
                      type="email"
                      value={email.email}
                      onChange={(e) => {
                        const updated = [...persons];
                        updated[personIndex].emails[emailIndex].email = e.target.value;
                        setPersons(updated);
                      }}
                      placeholder="E-Mail-Adresse"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      value={email.label}
                      onChange={(e) => {
                        const updated = [...persons];
                        updated[personIndex].emails[emailIndex].label = e.target.value;
                        setPersons(updated);
                      }}
                      placeholder="Label"
                      className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmail(personIndex, emailIndex)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Phones */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Telefonnummern</label>
                  <button
                    type="button"
                    onClick={() => addPhone(personIndex)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    + Telefon
                  </button>
                </div>
                {person.phones.filter(p => !p._destroy).map((phone, phoneIndex) => (
                  <div key={phoneIndex} className="flex gap-2 mb-2">
                    <input
                      type="tel"
                      value={phone.phone}
                      onChange={(e) => {
                        const updated = [...persons];
                        updated[personIndex].phones[phoneIndex].phone = e.target.value;
                        setPersons(updated);
                      }}
                      placeholder="Telefonnummer"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      value={phone.label}
                      onChange={(e) => {
                        const updated = [...persons];
                        updated[personIndex].phones[phoneIndex].label = e.target.value;
                        setPersons(updated);
                      }}
                      placeholder="Label"
                      className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(personIndex, phoneIndex)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              href={`/cockpit/contacts/${params.id}`}
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
            Kontaktgruppe löschen
          </button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Kontaktgruppe löschen bestätigen
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Möchten Sie die Kontaktgruppe "{contactGroupName}" und alle zugehörigen Personen wirklich endgültig löschen? 
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