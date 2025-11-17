// components/TopBar.tsx
'use client';

import { useState, useEffect } from 'react';

export default function TopBar() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setCurrentDate(formattedDate);
    };

    updateDate();
    // Update date every minute to handle day changes
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow-sm border-b px-8 py-4">
      <div className="flex justify-between items-center">
        {/* App Logo */}
        <div className="text-2xl font-bold text-gray-900">
          DREAMY<span className="text-blue-600">SOFTWARE</span>
        </div>
        
        {/* Current Date */}
        <div className="text-lg font-medium text-gray-700">
          {currentDate}
        </div>
      </div>
    </div>
  );
}