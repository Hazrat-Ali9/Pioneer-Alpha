// components/Sidebar.tsx
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

interface SidebarProps {
  currentPage: 'todos' | 'profile';
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const userData = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
  const user = userData ? JSON.parse(userData) : null;

  return (
    <div className="w-70 text-white bg-gray-900 shadow-lg min-h-screen flex flex-col">
      {/* Header */}
       

      {/* User Profile */}
      <div className="col-span-1 py-4">
        <div className=" p-6 text-center ">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
            {user?.profilePhoto ? (
              <Image
                src={user.profilePhoto}
                alt="Profile"
                width={68}
                height={68}
                className="rounded-full object-cover border-4 border-indigo-400"
              />
            ) : (
              <User size={44} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="mt-3 text-lg font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 text-white">
        <nav className="space-y-2">
          <button
            onClick={() => router.push('/todos')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentPage === 'todos'
                ? 'bg-indigo-600 text-white font-bold shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Todos</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentPage === 'profile'
                ? 'bg-indigo-600 text-white font-bold shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Account Information</span>
          </button>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-red-700 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}