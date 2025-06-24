'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

interface AddTaskProps {
    onTaskAdded: () => void;
}

export default function AddTask({ onTaskAdded }: AddTaskProps) {
    const [task, setTask] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.trim() || loading) return;

        setLoading(true);
        try {
            // We no longer send dueDate from the form.
            await axios.post('/api/tasks', { task, description });
            setTask('');
            setDescription('');
            onTaskAdded();
        } catch (error) {
            console.error("Failed to add task:", error);
            alert("Error: Could not add task.");
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <input 
                ref={inputRef} 
                type="text" 
                value={task} 
                onChange={(e) => setTask(e.target.value)} 
                placeholder="New task title..." 
                required 
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add a description (optional)..." 
                className="w-full p-3 h-20 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
            />
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full p-3 font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? "Adding..." : <><Plus size={18} /> Add Task</>}
            </button>
        </form>
    );
}
