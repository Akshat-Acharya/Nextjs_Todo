'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setTasks } from '../redux/slices/taskSlice';
import axios from 'axios';

import AddTask from './AddTask';
import TodoTasks from './TodoTasks';
import SearchBar from './SearchBar'; 

export default function TodoList() {
    const dispatch = useDispatch<AppDispatch>();
    const { tasks } = useSelector((state: RootState) => state.tasks);

    const fetchAndSetTasks = useCallback(async (query: string) => {
        try {
            const response = await axios.get(`/api/tasks?search=${query}`);
            dispatch(setTasks(response.data));
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            dispatch(setTasks([])); 
        }
    }, [dispatch]);

    useEffect(() => {
        fetchAndSetTasks('');
    }, [fetchAndSetTasks]);

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <AddTask onTaskAdded={() => fetchAndSetTasks('')} />
            
            <SearchBar onSearch={fetchAndSetTasks} />
            
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TodoTasks key={task.id} task={task} onTaskMutated={() => fetchAndSetTasks('')} />
                    ))
                ) : (
                     <div className="text-center py-10">
                        <p className="text-gray-500">No tasks found. Try a different search!</p>
                    </div>
                )}
            </div>
        </div>
    );
}