import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Async thunk for finding similar products
export const findSimilarProducts = createAsyncThunk(
    'productMatcher/findSimilar',
    async ({ url, platforms, limit, minConfidence }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                `${API_BASE_URL}/scraper/find-similar`,
                {
                    url,
                    platforms,
                    limit,
                    minConfidence,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to find similar products'
            );
        }
    }
);

const productMatcherSlice = createSlice({
    name: 'productMatcher',
    initialState: {
        sourceProduct: null,
        matches: [],
        matchesByPlatform: {},
        searchQuery: '',
        platformsSearched: [],
        totalMatches: 0,
        searchDuration: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearMatches: (state) => {
            state.sourceProduct = null;
            state.matches = [];
            state.matchesByPlatform = {};
            state.searchQuery = '';
            state.platformsSearched = [];
            state.totalMatches = 0;
            state.searchDuration = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(findSimilarProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(findSimilarProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.sourceProduct = action.payload.sourceProduct;
                state.matches = action.payload.matches;
                state.matchesByPlatform = action.payload.matchesByPlatform;
                state.searchQuery = action.payload.searchQuery;
                state.platformsSearched = action.payload.platformsSearched;
                state.totalMatches = action.payload.totalMatches;
                state.searchDuration = action.payload.searchDuration;
            })
            .addCase(findSimilarProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMatches } = productMatcherSlice.actions;
export default productMatcherSlice.reducer;
