'use client';
import React, { useState } from 'react'; // Import useState
import { Search, ClipboardCheck } from 'lucide-react'; // Import icons from lucide-react
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import SearchModal from './SearchModal'; // Import the new SearchModal component

const Sidebar = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // State for modal visibility

  if (!isAuthenticated) {
    return (<div></div>); // Render nothing if not authenticated
  }

  return (
    <div >
      <aside className="w-72 h-full bg-gray-100 text-foreground flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Workspace</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {/* Search Task Button (opens modal) */}
            <li>
              <button
                onClick={() => setIsSearchModalOpen(true)} // Open modal on click
                className="flex items-center p-2 h-10 cursor-pointer rounded-md hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium w-full text-left"
              >
                <Search className="h-5 w-5 mr-3" />
                <span>Search Task</span>
              </button>
            </li>

            {/* Tasks Row */}
            <li>
              <a
                href="#" // You might want to make this a Link from next/link to navigate to a tasks page
                className="flex items-center p-2 h-10 rounded-md hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200 text-sm font-medium w-full text-left"
              >
                <ClipboardCheck className="h-5 w-5 mr-3" />
                <span>Tasks</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          {/* You can place a user profile or settings link here */}
        </div>
      </aside>

      {/* Search Modal Component */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
