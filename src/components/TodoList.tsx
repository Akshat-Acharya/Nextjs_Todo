'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setTasks } from '../redux/slices/taskSlice';
import axios from 'axios';
// Removed Plus icon import as the top-right button is gone

import AddTask from './AddTask'; // Your refined AddTask component
import TodoTasks from './TodoTasks'; // Component to render individual tasks
import SearchBar from './SearchBar'; // Your SearchBar component

export default function TodoList() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  // Removed: const [isAddingTask, setIsAddingTask] = useState(false); // No longer needed

  const fetchAndSetTasks = useCallback(async (query: string = '') => {
    try {
      const response = await axios.get(`/api/tasks?search=${query}`);
      dispatch(setTasks(response.data));
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      dispatch(setTasks([]));
      // Optionally, show a toast notification for task fetch error
      // toast.error("Failed to load tasks.");
    }
  }, [dispatch]);

  // Fetch tasks on initial load
  useEffect(() => {
    fetchAndSetTasks();
  }, [fetchAndSetTasks]);

  const handleTaskAdded = () => {
    fetchAndSetTasks(); // Refresh tasks after a new one is added
    // Removed: setIsAddingTask(false); // No longer needed
  };

  // Removed: const handleCloseAddTask = () => { ... } // No longer needed

  return (
    // Outer container for the main content area (Inbox section)
    // Retaining the clean, white card-like appearance for the overall Inbox container
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-xl  p-6">
      
      {/* Inbox Header */}
      {/* Removed "Add Task" button from here */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Inbox</h2>
      </div>

      {/* Search Bar */}
      {/* <div className="mb-8">
         <SearchBar onSearch={fetchAndSetTasks} />
      </div> */}

      {/* Task List Display Area */}
      {/* Added border-t for visual separation similar to Todoist, adjusted max-h */}
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 pt-4 border-t border-gray-200">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TodoTasks key={task.id} task={task} onTaskMutated={() => fetchAndSetTasks('')} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Add a Task...</p>
          </div>
        )}
      </div>

      {/* Add Task Form - now always visible at the bottom */}
      {/* Added mt-8 for spacing between task list and add form */}
      <div className="mt-8">
        <AddTask onTaskAdded={handleTaskAdded} /> {/* Removed initialExpanded and onClose props */}
      </div>

    </div>
  );
}
