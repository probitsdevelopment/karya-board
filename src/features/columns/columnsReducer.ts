import {
  FETCH_COLUMNS_REQUEST,
  FETCH_COLUMNS_SUCCESS,
  FETCH_COLUMNS_FAILURE,
  ADD_COLUMN_SUCCESS,
  UPDATE_COLUMN_SUCCESS,
  DELETE_COLUMN_SUCCESS,
} from './columnActions';
import type { Column, ColumnAction } from './columnActions';

export interface ColumnsState {
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: ColumnsState = {
  columns: [],
  loading: false,
  error: null,
};

export const columnsReducer = (state = initialState, action: ColumnAction): ColumnsState => {
  switch (action.type) {
    case FETCH_COLUMNS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_COLUMNS_SUCCESS:
      return {
        ...state,
        loading: false,
        columns: action.payload.sort((a, b) => a.position - b.position),
      };

    case FETCH_COLUMNS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_COLUMN_SUCCESS:
      return {
        ...state,
        columns: [...state.columns, action.payload].sort((a, b) => a.position - b.position),
      };

    case UPDATE_COLUMN_SUCCESS:
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.id ? action.payload : col
        ).sort((a, b) => a.position - b.position),
      };

    case DELETE_COLUMN_SUCCESS:
      return {
        ...state,
        columns: state.columns.filter(col => col.id !== action.payload),
      };

    default:
      return state;
  }
};
