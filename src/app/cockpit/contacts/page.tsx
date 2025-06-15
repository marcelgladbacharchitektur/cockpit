'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Building2, User, Briefcase, Building, Users2, CircleEllipsis, Search } from 'lucide-react';
import ContactCardSkeleton from '@/components/skeletons/ContactCardSkeleton';

interface Person {
  id: string;
  titlePrefix?: string;
  firstName: string;
  lastName: string;
  titleSuffix?: string;
}

interface Address {
  id: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  label?: string;
}

interface ContactGroup {
  id: string;
  name: string;
  category: string;
  website?: string;
  persons: Person[];
  addresses: Address[];
}

const categoryConfig = {
  AUSFUEHRENDE_FIRMA: { label: 'Ausführende Firma', color: 'bg-green-100 text-green-800', icon: Building2 },
  PLANER: { label: 'Planer', color: 'bg-blue-100 text-blue-800', icon: Briefcase },
  AUFTRAGGEBER: { label: 'Auftraggeber', color: 'bg-purple-100 text-purple-800', icon: User },
  BEHOERDE: { label: 'Behörde', color: 'bg-orange-100 text-orange-800', icon: Building },
  VERTRETER: { label: 'Vertreter', color: 'bg-yellow-100 text-yellow-800', icon: Users2 },
  SONSTIGER: { label: 'Sonstiger', color: 'bg-gray-100 text-gray-800', icon: CircleEllipsis },
};

export default function ContactsPage() {
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALLE');

  useEffect(() => {
    const fetchContactGroups = async () => {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        setContactGroups(data);
      } catch (error) {
        console.error('Error fetching contact groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactGroups();
  }, []);

  const formatPersonName = (person: Person) => {
    const parts = [];
    if (person.titlePrefix) parts.push(person.titlePrefix);
    parts.push(person.firstName);
    parts.push(person.lastName);
    if (person.titleSuffix) parts.push(person.titleSuffix);
    return parts.join(' ');
  };

  const formatAddress = (address: Address) => {
    const parts = [];
    if (address.street && address.houseNumber) {
      parts.push(`${address.street} ${address.houseNumber}`);
    }
    if (address.postalCode && address.city) {
      parts.push(`${address.postalCode} ${address.city}`);
    }
    return parts.join(', ');
  };

  // Filter contacts based on search and category
  const filteredContacts = contactGroups.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.persons.some(person => 
        formatPersonName(person).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      group.addresses.some(address => 
        formatAddress(address).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (group.website && group.website.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'ALLE' || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kontakte</h1>
        <Link
          href="/cockpit/contacts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neuer Kontakt
        </Link>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="search"
            placeholder="Suche nach Name, Person, Adresse oder Website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALLE">Alle Kategorien</option>
            <option value="AUFTRAGGEBER">Auftraggeber</option>
            <option value="PLANER">Planer</option>
            <option value="AUSFUEHRENDE_FIRMA">Ausführende Firma</option>
            <option value="BEHOERDE">Behörde</option>
            <option value="VERTRETER">Vertreter</option>
            <option value="SONSTIGER">Sonstiger</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ContactCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((group) => {
            const config = categoryConfig[group.category as keyof typeof categoryConfig] || categoryConfig.SONSTIGER;
            const Icon = config.icon;
            
            return (
              <Link
                key={group.id}
                href={`/cockpit/contacts/${group.id}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {group.persons.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      {group.persons.slice(0, 2).map(person => formatPersonName(person)).join(', ')}
                      {group.persons.length > 2 && ` +${group.persons.length - 2} weitere`}
                    </p>
                  </div>
                )}

                {group.addresses.length > 0 && group.addresses[0].city && (
                  <div className="text-sm text-gray-500">
                    <p>{formatAddress(group.addresses[0])}</p>
                  </div>
                )}

                {group.website && (
                  <div className="text-sm text-gray-500 mt-2">
                    <p className="truncate">{group.website}</p>
                  </div>
                )}
              </Link>
            );
          })}
          
          {filteredContacts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Kontakte vorhanden.</p>
              <Link
                href="/cockpit/contacts/new"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Ersten Kontakt anlegen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}