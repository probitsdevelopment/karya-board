import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Column {
    id: string;
    title: string;
    position: number;
}

interface ColumnsState {
    columns: Column[];
    loading: boolean;
    error: string | null;
}

const initialState: ColumnsState = {
    columns: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchColumns = createAsyncThunk(
    'columns/fetchColumns',
    async () => {
        const response = await fetch('http://localhost:3001/columns');
        const data = await response.json();
        return data as Column[];
    }
);

export const addColumn = createAsyncThunk(
    'columns/addColumn',
    async (title: string) => {
        const response = await fetch('http://localhost:3001/columns');
        const columns = await response.json();
        
        // Calculate the next numeric ID
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

        const addResponse = await fetch('http://localhost:3001/columns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newColumn),
        });

        return await addResponse.json();
    }
);

export const deleteColumn = createAsyncThunk(
    'columns/deleteColumn',
    async (id: string) => {
        await fetch(`http://localhost:3001/columns/${id}`, {
            method: 'DELETE',
        });
        return id;
    }
);

export const updateColumn = createAsyncThunk(
    'columns/updateColumn',
    async ({ id, title, position }: { id: string; title?: string; position?: number }) => {
        const updateData: { title?: string; position?: number } = {};
        if (title !== undefined) updateData.title = title;
        if (position !== undefined) updateData.position = position;

        const response = await fetch(`http://localhost:3001/columns/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        return await response.json();
    }
);

const columnsSlice = createSlice({
    name: 'columns',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch columns
            .addCase(fetchColumns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColumns.fulfilled, (state, action: PayloadAction<Column[]>) => {
                state.loading = false;
                state.columns = action.payload.sort((a, b) => a.position - b.position);
            })
            .addCase(fetchColumns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch columns';
            })
            // Add column
            .addCase(addColumn.fulfilled, (state, action: PayloadAction<Column>) => {
                state.columns.push(action.payload);
                state.columns.sort((a, b) => a.position - b.position);
            })
            // Delete column
            .addCase(deleteColumn.fulfilled, (state, action: PayloadAction<string>) => {
                state.columns = state.columns.filter(col => col.id !== action.payload);
            })
            // Update column
            .addCase(updateColumn.fulfilled, (state, action: PayloadAction<Column>) => {
                const index = state.columns.findIndex(col => col.id === action.payload.id);
                if (index !== -1) {
                    state.columns[index] = action.payload;
                }
            });
    },
});

export default columnsSlice.reducer;
