'use client';

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '' }: { onSearch: (query: string) => void, initialQuery?: string }) {
    const [searchText, setSearchText] = useState(initialQuery);
      const [debouncedSearchText] = useDebounce(searchText, 500);

    useEffect(() => {
        onSearch(debouncedSearchText);
    }, [debouncedSearchText, onSearch]);

    return (
        <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type='text'
                placeholder="Search Task by title or description..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full p-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
        </div>
    );
}