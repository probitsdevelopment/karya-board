import { API_ENDPOINTS } from '../../constants/apiConfig';

// Action Types
export const FETCH_COLUMNS_REQUEST = 'FETCH_COLUMNS_REQUEST';
export const FETCH_COLUMNS_SUCCESS = 'FETCH_COLUMNS_SUCCESS';
export const FETCH_COLUMNS_FAILURE = 'FETCH_COLUMNS_FAILURE';

export const ADD_COLUMN_REQUEST = 'ADD_COLUMN_REQUEST';
export const ADD_COLUMN_SUCCESS = 'ADD_COLUMN_SUCCESS';
export const ADD_COLUMN_FAILURE = 'ADD_COLUMN_FAILURE';

export const UPDATE_COLUMN_REQUEST = 'UPDATE_COLUMN_REQUEST';
export const UPDATE_COLUMN_SUCCESS = 'UPDATE_COLUMN_SUCCESS';
export const UPDATE_COLUMN_FAILURE = 'UPDATE_COLUMN_FAILURE';

export const DELETE_COLUMN_REQUEST = 'DELETE_COLUMN_REQUEST';
export const DELETE_COLUMN_SUCCESS = 'DELETE_COLUMN_SUCCESS';
export const DELETE_COLUMN_FAILURE = 'DELETE_COLUMN_FAILURE';

export interface Column {
  id: string;
  title: string;
  position: number;
}

// Action Creators
export const fetchColumnsRequest = () => ({
  type: FETCH_COLUMNS_REQUEST as typeof FETCH_COLUMNS_REQUEST,
});

export const fetchColumnsSuccess = (columns: Column[]) => ({
  type: FETCH_COLUMNS_SUCCESS as typeof FETCH_COLUMNS_SUCCESS,
  payload: columns,
});

export const fetchColumnsFailure = (error: string) => ({
  type: FETCH_COLUMNS_FAILURE as typeof FETCH_COLUMNS_FAILURE,
  payload: error,
});

export const addColumnRequest = () => ({
  type: ADD_COLUMN_REQUEST as typeof ADD_COLUMN_REQUEST,
});

export const addColumnSuccess = (column: Column) => ({
  type: ADD_COLUMN_SUCCESS as typeof ADD_COLUMN_SUCCESS,
  payload: column,
});

export const addColumnFailure = (error: string) => ({
  type: ADD_COLUMN_FAILURE as typeof ADD_COLUMN_FAILURE,
  payload: error,
});

export const updateColumnRequest = () => ({
  type: UPDATE_COLUMN_REQUEST as typeof UPDATE_COLUMN_REQUEST,
});

export const updateColumnSuccess = (column: Column) => ({
  type: UPDATE_COLUMN_SUCCESS as typeof UPDATE_COLUMN_SUCCESS,
  payload: column,
});

export const updateColumnFailure = (error: string) => ({
  type: UPDATE_COLUMN_FAILURE as typeof UPDATE_COLUMN_FAILURE,
  payload: error,
});

export const deleteColumnRequest = () => ({
  type: DELETE_COLUMN_REQUEST as typeof DELETE_COLUMN_REQUEST,
});

export const deleteColumnSuccess = (id: string) => ({
  type: DELETE_COLUMN_SUCCESS as typeof DELETE_COLUMN_SUCCESS,
  payload: id,
});

export const deleteColumnFailure = (error: string) => ({
  type: DELETE_COLUMN_FAILURE as typeof DELETE_COLUMN_FAILURE,
  payload: error,
});

// Thunk Actions
export const fetchColumns = () => {
  return async (dispatch: any) => {
    dispatch(fetchColumnsRequest());
    try {
      const response = await fetch(API_ENDPOINTS.COLUMNS);
      const data = await response.json();
      dispatch(fetchColumnsSuccess(data));
    } catch (error) {
      dispatch(fetchColumnsFailure((error as Error).message));
    }
  };
};

export const addColumn = (title: string) => {
  return async (dispatch: any) => {
    dispatch(addColumnRequest());
    try {
      const response = await fetch(API_ENDPOINTS.COLUMNS);
      const columns = await response.json();
      
      const maxId = columns.length > 0
        ? Math.max(...columns.map((col: Column) => parseInt(col.id) || 0))
        : 0;
      
      const maxPosition = columns.length > 0
        ? Math.max(...columns.map((col: Column) => col.position))
        : 0;

      const newColumn = {
        id: String(maxId + 1),
        title,
        position: maxPosition + 1,
      };

      const addResponse = await fetch(API_ENDPOINTS.COLUMNS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newColumn),
      });

      const data = await addResponse.json();
      dispatch(addColumnSuccess(data));
      return { payload: data };
    } catch (error) {
      dispatch(addColumnFailure((error as Error).message));
      throw error;
    }
  };
};

export const updateColumn = ({ id, title, position }: { id: string; title?: string; position?: number }) => {
  return async (dispatch: any) => {
    dispatch(updateColumnRequest());
    try {
      const updateData: { title?: string; position?: number } = {};
      if (title !== undefined) updateData.title = title;
      if (position !== undefined) updateData.position = position;

      const response = await fetch(`${API_ENDPOINTS.COLUMNS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      dispatch(updateColumnSuccess(data));
    } catch (error) {
      dispatch(updateColumnFailure((error as Error).message));
    }
  };
};

export const deleteColumn = (id: string) => {
  return async (dispatch: any) => {
    dispatch(deleteColumnRequest());
    try {
      await fetch(`${API_ENDPOINTS.COLUMNS}/${id}`, {
        method: 'DELETE',
      });
      dispatch(deleteColumnSuccess(id));
    } catch (error) {
      dispatch(deleteColumnFailure((error as Error).message));
    }
  };
};

export type ColumnAction =
  | ReturnType<typeof fetchColumnsRequest>
  | ReturnType<typeof fetchColumnsSuccess>
  | ReturnType<typeof fetchColumnsFailure>
  | ReturnType<typeof addColumnRequest>
  | ReturnType<typeof addColumnSuccess>
  | ReturnType<typeof addColumnFailure>
  | ReturnType<typeof updateColumnRequest>
  | ReturnType<typeof updateColumnSuccess>
  | ReturnType<typeof updateColumnFailure>
  | ReturnType<typeof deleteColumnRequest>
  | ReturnType<typeof deleteColumnSuccess>
  | ReturnType<typeof deleteColumnFailure>;
