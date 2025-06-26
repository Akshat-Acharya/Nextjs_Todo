'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react'; // Import useCallback
import { X, Search } from 'lucide-react';
import { Transition } from '@headlessui/react'; // For nice transitions, optional but good UX
import SearchBar from './SearchBar'; // Re-use your existing SearchBar
import TodoTasks from './TodoTasks'; // To display search results
import axios from 'axios'; // For fetching search results
import type { Task } from '@prisma/client'; // Assuming Task type
import toast from 'react-hot-toast'; // Using react-hot-toast for notifications

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(''); // State to store the active search query
  const modalRef = useRef<HTMLDivElement>(null); // Ref for closing on outside click

  // Memoize handleSearch using useCallback.
  // This function is passed to SearchBar and also called internally.
  const handleSearch = useCallback(async (query: string) => {
    setCurrentSearchQuery(query); // Update the state with the new query

    if (!query.trim()) {
      // If the query is empty, clear results. Only update if state actually changes.
      if (searchResults.length > 0) { // Check if results are not already empty
        setSearchResults([]);
      }
      setLoading(false); // Ensure loading is reset if query is empty
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/tasks?search=${query}`); // Assuming your API supports search
      setSearchResults(response.data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setSearchResults([]);
      toast.error("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  }, [searchResults.length]); // Dependency: only recreate if searchResults.length changes dramatically

  // Callback for TodoTasks to re-fetch results after a task mutation (e.g., complete, delete)
  // This will re-run the last active search query to update the modal's results.
  const handleTaskMutatedInModal = useCallback(() => {
    handleSearch(currentSearchQuery); // Re-run the last recorded search query
  }, [handleSearch, currentSearchQuery]); // Dependencies ensure this callback is stable

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close modal when clicking outside of it
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]); // Dependency: onClose

  // Effect to manage event listeners when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clear results and reset query state when modal closes
      setSearchResults([]);
      setCurrentSearchQuery('');
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, handleClickOutside]); // Dependencies: isOpen, onClose, handleClickOutside

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-70 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        {/* Modal content */}
        <div className="flex items-center justify-center min-h-screen p-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div ref={modalRef} className="relative bg-white rounded-lg shadow-xl transform transition-all sm:max-w-xl sm:w-full p-6 text-left">
              {/* Close button */}
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1 cursor-pointer transition-colors"
                onClick={onClose}
              >
                <X size={24} aria-hidden="true" />
              </button>

              <h3 className="text-lg font-bold leading-6 text-gray-900 mb-4">Search Tasks</h3>
              
              {/* Search Bar inside modal */}
              <div className="mb-4">
                <SearchBar onSearch={handleSearch} /> {/* Pass memoized handleSearch */}
              </div>

              {/* Search Results Display */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(task => (
                    // Pass the memoized handleTaskMutatedInModal callback
                    <TodoTasks key={task.id} task={task} onTaskMutated={handleTaskMutatedInModal} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {currentSearchQuery ? "No results found for your search." : "Start typing to search tasks..."}
                  </div>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
}
