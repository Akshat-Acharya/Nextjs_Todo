'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setTasks } from '../redux/slices/taskSlice'; 
import AddTask from './AddTask';
import TodoTasks from './TodoTasks';
import { getTasksData } from '@/lib/auth';

export default function TodoList() {
    const {tasks} = useSelector((state: RootState) => state.tasks);
    const dispatch = useDispatch<AppDispatch>();

    
    const handleTaskMutation = async () => {
        try {
            const response = await getTasksData()
            dispatch(setTasks(response));
        } catch (error) {
            console.error("Failed to refetch tasks:", error);
        }
    };


    return (
        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <AddTask onTaskAdded={handleTaskMutation} />
            
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No tasks yet. Add one to get started!</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TodoTasks key={task.id} task={task} onTaskMutated={handleTaskMutation} />
                    ))
                )}
            </div>
        </div>
    );
}
