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
} from "lucide-react";
import type { Task } from '@prisma/client';

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
    // Defensively check for dueDate before formatting
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
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
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Error: Could not delete task.");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editData.task.trim()) return;
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        task: editData.task,
        description: editData.description,
        dueDate: editData.dueDate,
      });
      setIsEditing(false);
      onTaskMutated();
    } catch (error) {
      console.error("Failed to update task", error);
      alert("Error: Could not update task.");
    }
  };

  const handleToggleComplete = async () => {
    setIsToggling(true);
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        isCompleted: !task.isCompleted,
      });
      onTaskMutated();
    } catch (error) {
      console.error("Failed to update task status", error);
      alert("Error: Could not update task status.");
    } finally {
      setIsToggling(false);
    }
  };

  // --- THE FIX ---
  // Create a variable for the formatted date, but only if task.dueDate exists.
  // This prevents the new Date() constructor from receiving null or undefined.
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null; // If no due date, this will be null.

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-700/70 rounded-lg space-y-3 border border-indigo-500/50">
        <input
          type="text"
          value={editData.task}
          onChange={(e) => setEditData({ ...editData, task: e.target.value })}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          className="w-full p-2 h-20 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <input
          type="date"
          value={editData.dueDate}
          onChange={(e) =>
            setEditData({ ...editData, dueDate: e.target.value })
          }
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
          <button
            onClick={handleUpdate}
            className="p-2 rounded-full text-green-400 hover:text-white hover:bg-green-500/50 transition-colors"
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
        className={`p-4 bg-gray-800/50 rounded-lg group transition-all duration-300 ${
          task.isCompleted ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-grow">
            <button
              onClick={handleToggleComplete}
              disabled={isToggling}
              className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              {isToggling ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
              ) : task.isCompleted ? (
                <CheckCircle
                  size={24}
                  className="text-green-400 transition-transform hover:scale-110"
                />
              ) : (
                <Circle
                  size={24}
                  className="text-gray-600 group-hover:text-indigo-400 transition-transform group-hover:scale-110"
                />
              )}
            </button>
            <div className="flex-grow">
              <p
                className={`font-semibold text-gray-100 ${
                  task.isCompleted ? "line-through text-gray-500" : ""
                }`}
              >
                {task.task}
              </p>
              {task.description && (
                <p
                  className={`text-sm mt-1 ${
                    task.isCompleted ? "text-gray-600" : "text-gray-400"
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
              className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-gray-700/50"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-gray-700/50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {/* We only render the due date if it exists */}
        {formattedDueDate && (
            <div
            className={`mt-3 pl-10 flex items-center gap-2 text-xs ${
                task.isCompleted ? "text-gray-500" : "text-indigo-400"
            }`}
            >
            <Calendar size={14} />
            <span>Due: {formattedDueDate}</span>
            </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fadeIn">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
            <div className="flex items-center">
              <div className="bg-red-900/50 p-2 rounded-full mr-4 flex-shrink-0">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Task</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Are you sure? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-800 disabled:cursor-wait transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
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