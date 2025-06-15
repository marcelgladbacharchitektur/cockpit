'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/cockpit', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Projekte', href: '/cockpit/projects', icon: <Briefcase className="w-5 h-5" /> },
  { name: 'Kontakte', href: '/cockpit/contacts', icon: <Users className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/cockpit') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Cockpit
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Architekturbüro Gladbach
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Marcel Gladbach
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Architekt
          </p>
        </div>
      </div>
    </aside>
  );
}