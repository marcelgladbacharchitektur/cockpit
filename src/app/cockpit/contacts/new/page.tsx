'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, User, Briefcase, Building, Users2, CircleEllipsis } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryOptions = [
  { value: 'AUSFUEHRENDE_FIRMA', label: 'Ausführende Firma', icon: Building2 },
  { value: 'PLANER', label: 'Planer', icon: Briefcase },
  { value: 'AUFTRAGGEBER', label: 'Auftraggeber', icon: User },
  { value: 'BEHOERDE', label: 'Behörde', icon: Building },
  { value: 'VERTRETER', label: 'Vertreter', icon: Users2 },
  { value: 'SONSTIGER', label: 'Sonstiger', icon: CircleEllipsis },
];

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Group fields
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('AUFTRAGGEBER');
  const [website, setWebsite] = useState('');

  // Address fields
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Österreich');

  // Person fields (for now, just one person)
  const [titlePrefix, setTitlePrefix] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [titleSuffix, setTitleSuffix] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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
        address: {
          street: street || null,
          houseNumber: houseNumber || null,
          postalCode: postalCode || null,
          city: city || null,
          country: country || null,
          label: 'Hauptadresse',
        },
        persons: [
          {
            titlePrefix: titlePrefix || null,
            firstName,
            lastName,
            titleSuffix: titleSuffix || null,
            email: email || null,
            phone: phone || null,
          },
        ],
      };

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Kontakt erfolgreich erstellt');
        router.push(`/cockpit/contacts/${result.id}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Fehler beim Erstellen des Kontakts';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      const errorMessage = 'Netzwerkfehler beim Erstellen des Kontakts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/cockpit/contacts" className="text-blue-500 hover:underline">
          ← Zurück zur Kontaktliste
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Neuer Kontakt</h1>

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
                placeholder="z.B. Meier Statik GmbH"
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
                placeholder="https://www.beispiel.at"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Adresse</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="street" className="block text-sm font-medium mb-2">
                Straße
              </label>
              <input
                type="text"
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="houseNumber" className="block text-sm font-medium mb-2">
                Hausnummer
              </label>
              <input
                type="text"
                id="houseNumber"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
                PLZ
              </label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                Ort
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium mb-2">
                Land
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Person Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Kontaktperson</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="titlePrefix" className="block text-sm font-medium mb-2">
                Titel (vor dem Namen)
              </label>
              <input
                type="text"
                id="titlePrefix"
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Dr., Ing."
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                Vorname *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Nachname *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="titleSuffix" className="block text-sm font-medium mb-2">
                Titel (nach dem Namen)
              </label>
              <input
                type="text"
                id="titleSuffix"
                value={titleSuffix}
                onChange={(e) => setTitleSuffix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. MSc, BA"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Speichern...' : 'Kontakt speichern'}
          </button>
          <Link
            href="/cockpit/contacts"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}