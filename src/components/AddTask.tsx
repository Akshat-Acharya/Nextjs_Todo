'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Flag, Bell, Tag, Repeat } from 'lucide-react'; // Added Repeat icon for frequency
import toast from 'react-hot-toast'; // Using react-hot-toast for notifications
import { z } from 'zod'; // Import Zod for client-side validation hint (actual validation on server)

// Define TaskFrequency enum values for client-side use
enum TaskFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

// Client-side schema for form validation before sending (optional, but good practice)
// This mirrors the Prisma schema closely but for the POST payload
const clientAddTaskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(), // Will be YYYY-MM-DD string from input
  frequency: z.nativeEnum(TaskFrequency).default(TaskFrequency.DAILY),
});

interface AddTaskProps {
  onTaskAdded: () => void;
  initialExpanded?: boolean;
  onClose?: () => void;
}

export default function AddTask({ onTaskAdded, initialExpanded = false, onClose }: AddTaskProps) {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(''); // YYYY-MM-DD format
  const [frequency, setFrequency] = useState<TaskFrequency>(TaskFrequency.DAILY);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const taskInputRef = useRef<HTMLInputElement>(null);
  // No explicit ref for description now that it's conditionally rendered

  useEffect(() => {
    if (isExpanded) {
      taskInputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using Zod (optional but recommended)
    try {
      clientAddTaskSchema.parse({
        title: task,
        description: description,
        dueDate: dueDate || null,
        frequency: frequency,
      });
    } catch (validationError: any) {
      if (validationError instanceof z.ZodError) {
        validationError.errors.forEach(err => toast.error(err.message));
      } else {
        toast.error("An unexpected validation error occurred.");
      }
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/tasks', { 
        task: task, // Matches Prisma 'task' field
        description: description.trim() || null, // Send null if empty
        dueDate: dueDate ? new Date(dueDate).toISOString() : null, // Convert to ISO string for backend
        frequency: frequency, // Matches Prisma 'frequency' field
      });
      
      setTask('');
      setDescription('');
      setDueDate('');
      setFrequency(TaskFrequency.DAILY); // Reset to default
      setIsDescriptionFocused(false); 
      setIsExpanded(false); 
      onTaskAdded(); 
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Failed to add task:", error);
      // More specific error handling if backend sends Zod errors back
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => toast.error(err.message || "Validation Error"));
      } else {
        toast.error("Error: Could not add task. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTask('');
    setDescription('');
    setDueDate('');
    setFrequency(TaskFrequency.DAILY);
    setIsDescriptionFocused(false);
    setIsExpanded(false); 
    onClose && onClose(); 
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 p-3 cursor-pointer text-gray-500 rounded-md hover:bg-gray-100 transition-colors duration-200 border border-transparent hover:border-gray-200"
      >
        <Plus size={18} /> Add Task
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <form onSubmit={handleAddTask} className="space-y-3">
        {/* Task Title Input */}
        <input
          ref={taskInputRef}
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task title"
          className="w-full p-2 text-lg text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 placeholder-gray-500"
          onFocus={() => setIsExpanded(true)}
        />

        {/* Description Input (expandable) */}
        {(isDescriptionFocused || description) ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={isDescriptionFocused ? 3 : 1}
            className="w-full p-2 text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 resize-none placeholder-gray-500 transition-all duration-200 ease-in-out"
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => {
              if (!description.trim()) {
                setIsDescriptionFocused(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsDescriptionFocused(true)}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Add description
          </button>
        )}

        {/* Action Buttons Row (Date, Priority, Reminders, Frequency) */}
        <div className="flex items-center space-x-2 text-gray-500 text-sm flex-wrap"> {/* flex-wrap for responsiveness */}
          {/* Due Date Input */}
          <label className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer">
            <Calendar size={16} />
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent outline-none text-gray-700 cursor-pointer"
              title="Due Date"
            />
          </label>

          {/* Frequency Selector */}
          <label className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer">
            <Repeat size={16} />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
              className="bg-transparent outline-none text-gray-700 cursor-pointer appearance-none pr-6" // pr-6 for space for default arrow
              title="Task Frequency"
            >
              {Object.values(TaskFrequency).map((freq) => (
                <option key={freq} value={freq}>
                  {freq.charAt(0) + freq.slice(1).toLowerCase()} {/* e.g., "Daily" */}
                </option>
              ))}
            </select>
            {/* Optional: custom arrow icon for select if default is hidden by appearance-none */}
            {/* <ChevronDown size={16} className="ml-[-1.5rem] pointer-events-none" /> */}
          </label>

          {/* Placeholder for Priority (no state management for it in this example) */}
          {/* <button type="button" className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors">
            <Flag size={16} /> Priority
          </button> */}
          {/* Placeholder for Reminders */}
          {/* <button type="button" className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors">
            <Bell size={16} /> Reminders
          </button> */}
          {/* Placeholder for Labels */}
          {/* <button type="button" className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors">
            <Tag size={16} /> Label
          </button> */}
        </div>

        {/* Cancel and Add Task Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !task.trim()}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Adding..." : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}
