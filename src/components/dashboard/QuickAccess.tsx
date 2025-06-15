import Link from 'next/link';
import { FolderPlus, UserPlus } from 'lucide-react';

export default function QuickAccess() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/cockpit/projects/new"
          className="flex items-center justify-center gap-3 p-6 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FolderPlus className="w-8 h-8" />
          <span className="text-lg font-medium">Neues Projekt</span>
        </Link>
        
        <Link
          href="/cockpit/contacts/new"
          className="flex items-center justify-center gap-3 p-6 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <UserPlus className="w-8 h-8" />
          <span className="text-lg font-medium">Neuer Kontakt</span>
        </Link>
      </div>
    </div>
  );
}