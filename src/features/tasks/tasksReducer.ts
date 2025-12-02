import {
  FETCH_TASKS_REQUEST,
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILURE,
  ADD_TASK_SUCCESS,
  UPDATE_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
  REORDER_TASK_SAME_COLUMN,
  MOVE_TASK_TO_OTHER_COLUMN,
} from './taskActions';
import type { Task, TaskAction } from './taskActions';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const tasksReducer = (state = initialState, action: TaskAction): TasksState => {
  switch (action.type) {
    case FETCH_TASKS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_TASKS_SUCCESS:
      return {
        ...state,
        loading: false,
        tasks: action.payload,
      };

    case FETCH_TASKS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_TASK_SUCCESS:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case UPDATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          (task['req-id'] === action.payload['req-id'] || task.id === action.payload.id) 
            ? action.payload 
            : task
        ),
      };

    case DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.filter(task => task['req-id'] !== action.payload),
      };

    /**
     * Handle reordering tasks within the same column
     * This creates visual reordering effect for same-column drag
     * Note: Backend doesn't persist order (no position field in db.json)
     */
    case REORDER_TASK_SAME_COLUMN: {
      const { columnId, sourceIndex, destinationIndex } = action.payload;
      
      // Filter tasks in this column only
      const columnTasks = state.tasks.filter(t => t['card-bucket'] === columnId);
      const otherTasks = state.tasks.filter(t => t['card-bucket'] !== columnId);
      
      // Reorder immutably
      const reorderedTasks = Array.from(columnTasks);
      const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
      reorderedTasks.splice(destinationIndex, 0, movedTask);
      
      return {
        ...state,
        tasks: [...otherTasks, ...reorderedTasks],
      };
    }

    /**
     * Handle moving task from one column to another
     * Updates the task's card-bucket property (optimistic update)
     * Backend PATCH happens via thunk after this
     */
    case MOVE_TASK_TO_OTHER_COLUMN: {
      const { taskId, destinationColumnId } = action.payload;
      
      return {
        ...state,
        tasks: state.tasks.map(task =>
          (task['req-id'] === taskId || task.id === taskId)
            ? { ...task, 'card-bucket': destinationColumnId }
            : task
        ),
      };
    }

    default:
      return state;
  }
};
