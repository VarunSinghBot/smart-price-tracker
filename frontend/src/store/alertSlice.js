import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as alertApi from '../utils/alertApi';

// Async thunks
export const fetchAlerts = createAsyncThunk(
    'alerts/fetchAlerts',
    async (activeOnly = true, { rejectWithValue }) => {
        try {
            const response = await alertApi.getAlerts(activeOnly);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
        }
    }
);

export const addAlert = createAsyncThunk(
    'alerts/addAlert',
    async ({ productId, targetPrice }, { rejectWithValue }) => {
        try {
            const response = await alertApi.createAlert(productId, targetPrice);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create alert');
        }
    }
);

export const modifyAlert = createAsyncThunk(
    'alerts/modifyAlert',
    async ({ alertId, updates }, { rejectWithValue }) => {
        try {
            const response = await alertApi.updateAlert(alertId, updates);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update alert');
        }
    }
);

export const removeAlert = createAsyncThunk(
    'alerts/removeAlert',
    async (alertId, { rejectWithValue }) => {
        try {
            await alertApi.deleteAlert(alertId);
            return alertId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete alert');
        }
    }
);

export const toggleAlert = createAsyncThunk(
    'alerts/toggleAlert',
    async (alertId, { rejectWithValue }) => {
        try {
            const response = await alertApi.deactivateAlert(alertId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle alert');
        }
    }
);

const initialState = {
    alerts: [],
    loading: false,
    error: null,
};

const alertSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch alerts
            .addCase(fetchAlerts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlerts.fulfilled, (state, action) => {
                state.loading = false;
                state.alerts = action.payload;
            })
            .addCase(fetchAlerts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add alert
            .addCase(addAlert.fulfilled, (state, action) => {
                state.alerts.push(action.payload);
            })
            // Modify alert
            .addCase(modifyAlert.fulfilled, (state, action) => {
                const index = state.alerts.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.alerts[index] = action.payload;
                }
            })
            // Remove alert
            .addCase(removeAlert.fulfilled, (state, action) => {
                state.alerts = state.alerts.filter(a => a.id !== action.payload);
            })
            // Toggle alert
            .addCase(toggleAlert.fulfilled, (state, action) => {
                const index = state.alerts.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.alerts[index] = action.payload;
                }
            });
    },
});

export const { clearError } = alertSlice.actions;
export default alertSlice.reducer;
