'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useEffect } from 'react';
import { setTasks } from '../redux/slices/taskSlice';
import { getTasksData } from '../lib/auth'; 

// Import the components
import AuthForm from '../components/AuthForm';
import TodoList from '../components/TodoList';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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

  // If the user is not authenticated, show the self-contained AuthForm page.
  // The AuthForm component itself handles the centering and light background.
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // If authenticated, show the main application UI
  return (
    <div className="w-full min-h-screen bg-white text-foreground">
     
      <div className="flex">
      
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <header className="flex items-center justify-between mb-8">
             
           
            </header>
            <div className="animate-fadeIn">
              <TodoList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}