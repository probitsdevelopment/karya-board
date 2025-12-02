import { API_ENDPOINTS } from '../../constants/apiConfig';

// Action Types
export const FETCH_TASKS_REQUEST = 'FETCH_TASKS_REQUEST';
export const FETCH_TASKS_SUCCESS = 'FETCH_TASKS_SUCCESS';
export const FETCH_TASKS_FAILURE = 'FETCH_TASKS_FAILURE';

export const ADD_TASK_REQUEST = 'ADD_TASK_REQUEST';
export const ADD_TASK_SUCCESS = 'ADD_TASK_SUCCESS';
export const ADD_TASK_FAILURE = 'ADD_TASK_FAILURE';

export const UPDATE_TASK_REQUEST = 'UPDATE_TASK_REQUEST';
export const UPDATE_TASK_SUCCESS = 'UPDATE_TASK_SUCCESS';
export const UPDATE_TASK_FAILURE = 'UPDATE_TASK_FAILURE';

export const DELETE_TASK_REQUEST = 'DELETE_TASK_REQUEST';
export const DELETE_TASK_SUCCESS = 'DELETE_TASK_SUCCESS';
export const DELETE_TASK_FAILURE = 'DELETE_TASK_FAILURE';

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

// Action Creators
export const fetchTasksRequest = () => ({
  type: FETCH_TASKS_REQUEST as typeof FETCH_TASKS_REQUEST,
});

export const fetchTasksSuccess = (tasks: Task[]) => ({
  type: FETCH_TASKS_SUCCESS as typeof FETCH_TASKS_SUCCESS,
  payload: tasks,
});

export const fetchTasksFailure = (error: string) => ({
  type: FETCH_TASKS_FAILURE as typeof FETCH_TASKS_FAILURE,
  payload: error,
});

export const addTaskRequest = () => ({
  type: ADD_TASK_REQUEST as typeof ADD_TASK_REQUEST,
});

export const addTaskSuccess = (task: Task) => ({
  type: ADD_TASK_SUCCESS as typeof ADD_TASK_SUCCESS,
  payload: task,
});

export const addTaskFailure = (error: string) => ({
  type: ADD_TASK_FAILURE as typeof ADD_TASK_FAILURE,
  payload: error,
});

export const updateTaskRequest = () => ({
  type: UPDATE_TASK_REQUEST as typeof UPDATE_TASK_REQUEST,
});

export const updateTaskSuccess = (task: Task) => ({
  type: UPDATE_TASK_SUCCESS as typeof UPDATE_TASK_SUCCESS,
  payload: task,
});

export const updateTaskFailure = (error: string) => ({
  type: UPDATE_TASK_FAILURE as typeof UPDATE_TASK_FAILURE,
  payload: error,
});

export const deleteTaskRequest = () => ({
  type: DELETE_TASK_REQUEST as typeof DELETE_TASK_REQUEST,
});

export const deleteTaskSuccess = (id: string) => ({
  type: DELETE_TASK_SUCCESS as typeof DELETE_TASK_SUCCESS,
  payload: id,
});

export const deleteTaskFailure = (error: string) => ({
  type: DELETE_TASK_FAILURE as typeof DELETE_TASK_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchTasks = () => {
  return async (dispatch: any) => {
    dispatch(fetchTasksRequest());
    try {
      const response = await fetch(API_ENDPOINTS.TASKS);
      const data = await response.json();
      
      // Handle nested array structure from db.json
      let tasks: Task[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        tasks = data[0];
      } else if (Array.isArray(data)) {
        tasks = data;
      }
      
      dispatch(fetchTasksSuccess(tasks));
    } catch (error) {
      dispatch(fetchTasksFailure((error as Error).message));
    }
  };
};

export const addTask = (task: Omit<Task, 'req-id'>) => {
  return async (dispatch: any) => {
    dispatch(addTaskRequest());
    try {
      const response = await fetch(API_ENDPOINTS.TASKS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await response.json();
      dispatch(addTaskSuccess(data));
    } catch (error) {
      dispatch(addTaskFailure((error as Error).message));
    }
  };
};

export const updateTask = ({ id, ...updates }: Partial<Task> & { id: string }) => {
  return async (dispatch: any) => {
    dispatch(updateTaskRequest());
    try {
      const response = await fetch(`${API_ENDPOINTS.TASKS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      dispatch(updateTaskSuccess(data));
    } catch (error) {
      dispatch(updateTaskFailure((error as Error).message));
    }
  };
};

export const deleteTask = (id: string) => {
  return async (dispatch: any) => {
    dispatch(deleteTaskRequest());
    try {
      await fetch(`${API_ENDPOINTS.TASKS}/${id}`, {
        method: 'DELETE',
      });
      dispatch(deleteTaskSuccess(id));
    } catch (error) {
      dispatch(deleteTaskFailure((error as Error).message));
    }
  };
};

export type TaskAction =
  | ReturnType<typeof fetchTasksRequest>
  | ReturnType<typeof fetchTasksSuccess>
  | ReturnType<typeof fetchTasksFailure>
  | ReturnType<typeof addTaskRequest>
  | ReturnType<typeof addTaskSuccess>
  | ReturnType<typeof addTaskFailure>
  | ReturnType<typeof updateTaskRequest>
  | ReturnType<typeof updateTaskSuccess>
  | ReturnType<typeof updateTaskFailure>
  | ReturnType<typeof deleteTaskRequest>
  | ReturnType<typeof deleteTaskSuccess>
  | ReturnType<typeof deleteTaskFailure>;
