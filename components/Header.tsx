// components/Header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: 'todos' | 'profile';
}

export default function Header({ currentPage }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const navigateTo = (page: 'todos' | 'profile') => {
    router.push(`/${page}`);
  };

  return (
    <header className=" bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-900">
              BREAKY<span className="text-blue-600">SUITWARE</span>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigateTo('todos')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'todos'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span>Todos</span>
            </button>

            <button
              onClick={() => navigateTo('profile')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'profile'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}