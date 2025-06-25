'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useEffect } from 'react';
import { setTasks } from '../redux/slices/taskSlice';
import { getTasksData } from '../lib/auth'; 

import AuthForm from '../components/AuthForm';
import TodoList from '../components/TodoList';
import LogoutButton from '../components/LogoutButton';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { isAuthenticated } = auth;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await getTasksData();
        dispatch(setTasks(tasksData));
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, dispatch]);
1
  return ( 
    <div className="w-full min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        {isAuthenticated ? (
          <div className="animate-fadeIn">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Your Tasks
                </h1>
               
              </div>
              <LogoutButton />
            </header>
            <main>
              <TodoList />
            </main>
          </div>
        ) : (
         
          <div className="w-full flex justify-center animate-fadeIn">
            <AuthForm />
          </div>
        )}
      </div>
    </div>
  );
}
