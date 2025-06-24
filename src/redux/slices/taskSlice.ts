import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@prisma/client'; 

interface TasksState {
  tasks: Task[];
}


const initialState: TasksState = {
  tasks: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    // addTask: (state, action: PayloadAction<Task>) => {
    //   state.tasks.unshift(action.payload);
    // },
    // deleteTask: (state, action: PayloadAction<number>) => {
    //   state.tasks = state.tasks.filter(
    //     (task) => task.id !== action.payload
    //   );
    // },
    // updateTask: (state, action: PayloadAction<Task>) => {
    //   const updatedTask = action.payload;
    //   const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
    //   if (index !== -1) {
    //     state.tasks[index] = updatedTask;
    //   }
    // },
  },
});

export const { setTasks } = tasksSlice.actions;

export default tasksSlice.reducer;