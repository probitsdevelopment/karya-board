import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Task {
  'req-id': string;
  'training-title': string;
  'client-name': string;
  'mode-of-training': string;
  probability: number;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  'trainers-selected': {
    ai: number;
    manual: number;
  };
  'due-date': string;
  comments: number;
  'attached-docs': number;
  'requiremnet-created': string;
  'assigned-to': string;
  'card-bucket': string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch('http://localhost:3001/tasks');
  return response.json();
});

export const addTask = createAsyncThunk('tasks/addTask', async (task: Omit<Task, 'id'>) => {
  const response = await fetch('http://localhost:3001/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return response.json();
});

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...updates }: Partial<Task> & { id: string }) => {
    const response = await fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  }
);

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  await fetch(`http://localhost:3001/tasks/${id}`, { method: 'DELETE' });
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Handle nested array structure from db.json
        const payload = action.payload;
        if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
          state.tasks = payload[0];
        } else if (Array.isArray(payload)) {
          state.tasks = payload;
        } else {
          state.tasks = [];
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task['req-id'] === action.payload['req-id']);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task['req-id'] !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
