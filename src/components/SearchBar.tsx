'use client';

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce"; // Assuming use-debounce is installed
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [searchText, setSearchText] = useState(initialQuery);
  const [debouncedSearchText] = useDebounce(searchText, 500); // Debounce for 500ms

  // Effect to trigger search when debounced text changes
  useEffect(() => {
    onSearch(debouncedSearchText);
  }, [debouncedSearchText, onSearch]); // Dependencies ensure this runs when needed

  return (
    // Relative positioning for the icon.
    // Removed mb-6. Parent components (like SearchModal or TodoList) should handle bottom margin.
    <div className="relative"> 
      {/* Search icon positioned absolutely inside the input field */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
      
      {/* Input field with light theme styling */}
      <input 
        type='text'
        placeholder="Search Task by title or description..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        // Tailwind classes for light background, subtle border, rounded corners,
        // padding (with extra on the left for the icon), and focus effects.
        className="w-full p-3 pl-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-500 shadow-sm" 
      />
    </div>
  );
}
