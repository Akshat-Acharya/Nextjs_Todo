'use client';

import { useState } from "react";
import axios from "axios";
import {
  Trash2,
  Edit,
  Save,
  X,
  Calendar,
  Circle,
  CheckCircle,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import type { Task } from '@prisma/client'; // Assuming Task type from Prisma Client
import toast from 'react-hot-toast';
import { z } from 'zod';

// Define TaskFrequency enum values for client-side use
// This enum MUST exactly match the one in your schema.prisma
enum TaskFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

// Client-side schema for task update validation
const clientUpdateTaskSchema = z.object({
  task: z.string().min(1, { message: "Task title cannot be empty." }),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  // Validate frequency against the enum values
  frequency: z.nativeEnum(TaskFrequency, {
    errorMap: () => ({ message: "Invalid frequency selected." }),
  }).default(TaskFrequency.DAILY),
});

export default function TodoTasks({
  task,
  onTaskMutated,
}: {
  task: Task;
  onTaskMutated: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [editData, setEditData] = useState({
    task: task.task,
    description: task.description || "",
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
    // Ensure task.frequency is a valid TaskFrequency enum member
    frequency: task.frequency in TaskFrequency ? task.frequency as TaskFrequency : TaskFrequency.DAILY,
  });

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/tasks/${task.id}`);
      setShowConfirmDialog(false);
      onTaskMutated();
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task", error);
      toast.error("Error: Could not delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      clientUpdateTaskSchema.parse({
        task: editData.task,
        description: editData.description,
        dueDate: editData.dueDate || null,
        frequency: editData.frequency,
      });
    } catch (validationError: any) {
      if (validationError instanceof z.ZodError) {
        validationError.errors.forEach(err => toast.error(err.message));
      } else {
        toast.error("An unexpected validation error occurred.");
      }
      return;
    }

    try {
      await axios.put(`/api/tasks/${task.id}`, {
        task: editData.task,
        description: editData.description.trim() || null,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
        frequency: editData.frequency,
      });
      setIsEditing(false);
      onTaskMutated();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task", error);
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => toast.error(err.message || "Validation Error"));
      } else {
        toast.error("Error: Could not update task.");
      }
    }
  };

  const handleToggleComplete = async () => {
    setIsToggling(true);
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        isCompleted: !task.isCompleted,
      });
      onTaskMutated();
      toast.success(task.isCompleted ? "Task marked incomplete!" : "Task completed!");
    } catch (error) {
      console.error("Failed to update task status", error);
      toast.error("Error: Could not update task status.");
    } finally {
      setIsToggling(false);
    }
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Defensive function for formatting frequency
  const formatFrequencyForDisplay = (freq: string | TaskFrequency | null | undefined): string => {
    if (typeof freq === 'string' && freq in TaskFrequency) {
        const enumValue = freq as TaskFrequency;
        return enumValue.charAt(0) + enumValue.slice(1).toLowerCase();
    }
    // Fallback if freq is not a valid enum string or is null/undefined
    return "N/A"; 
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-blue-200">
        <input
          type="text"
          value={editData.task}
          onChange={(e) => setEditData({ ...editData, task: e.target.value })}
          className="w-full p-3  text-black border bg-gray-300 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          placeholder="Task title"
        />
        <textarea
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          className="w-full p-3 h-20  text-black bg-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-400"
          placeholder="Description"
        />
        <input
          type="date"
          value={editData.dueDate}
          onChange={(e) =>
            setEditData({ ...editData, dueDate: e.target.value })
          }
          className="w-full p-3 bg-gray-300 text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 "
        />
        {/* Frequency Selector in Edit Mode */}
        <select
          value={editData.frequency}
          onChange={(e) => setEditData({ ...editData, frequency: e.target.value as TaskFrequency })}
          className="w-full p-3  text-black border bg-gray-300 cursor-pointer border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
        >
          {/* Ensure the mapping is correct and 'freq' is truly a string here */}
          {Object.values(TaskFrequency).map((freq) => (
            <option key={freq} value={freq} className=" text-white">
              {formatFrequencyForDisplay(freq)}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <button
            onClick={handleUpdate}
            className="p-2 rounded-full text-blue-500 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <Save size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`p-4 bg-white rounded-lg group transition-all duration-300 border border-gray-200 shadow-sm ${
          task.isCompleted ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-grow">
            <button
              onClick={handleToggleComplete}
              disabled={isToggling}
              className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
            >
              {isToggling ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-blue-400 rounded-full animate-spin cursor-pointer"></div>
              ) : task.isCompleted ? (
                <CheckCircle
                  size={24}
                  className="text-green-500 transition-transform hover:scale-110"
                />
              ) : (
                <Circle
                  size={24}
                  className="text-gray-400 group-hover:text-blue-500 transition-transform group-hover:scale-110"
                />
              )}
            </button>
            <div className="flex-grow">
              <p
                className={`font-semibold text-gray-800 ${
                  task.isCompleted ? "line-through text-gray-500" : ""
                }`}
              >
                {task.task}
              </p>
              {task.description && (
                <p
                  className={`text-sm mt-1 ${
                    task.isCompleted ? "text-gray-600 line-through" : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {/* Due Date & Frequency Display */}
        {(formattedDueDate || task.frequency) && ( // Ensure task.frequency is valid before rendering this section
            <div className="mt-3 pl-10 flex items-center gap-4 text-xs">
                {formattedDueDate && (
                    <div className={`flex items-center gap-1 ${task.isCompleted ? "text-gray-500" : "text-blue-600"}`}>
                        <Calendar size={14} />
                        <span>{formattedDueDate}</span>
                    </div>
                )}
                {/* Only display frequency if it's a valid enum member */}
                {task.frequency && (typeof task.frequency === 'string' && task.frequency in TaskFrequency) && (
                    <div className={`flex items-center gap-1 ${task.isCompleted ? "text-gray-500" : "text-gray-500"}`}>
                        <Repeat size={14} />
                        <span>{formatFrequencyForDisplay(task.frequency)}</span>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-4 flex-shrink-0">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Task</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-wait transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500"
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
