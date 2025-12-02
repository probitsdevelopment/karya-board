import { combineReducers } from 'redux';
import { columnsReducer } from '../features/columns/columnsReducer';
import { tasksReducer } from '../features/tasks/tasksReducer';
import type { ColumnsState } from '../features/columns/columnsReducer';
import type { TasksState } from '../features/tasks/tasksReducer';

export interface RootState {
  columns: ColumnsState;
  tasks: TasksState;
}

const rootReducer = combineReducers({
  columns: columnsReducer,
  tasks: tasksReducer,
});

export default rootReducer;
