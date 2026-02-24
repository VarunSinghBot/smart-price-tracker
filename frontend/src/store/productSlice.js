import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productApi from '../utils/productApi';

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await productApi.getProducts(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await productApi.getProductById(productId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
        }
    }
);

export const fetchPriceHistory = createAsyncThunk(
    'products/fetchPriceHistory',
    async ({ productId, days }, { rejectWithValue }) => {
        try {
            const response = await productApi.getPriceHistory(productId, days);
            return { productId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch price history');
        }
    }
);

export const removeProduct = createAsyncThunk(
    'products/removeProduct',
    async (productId, { rejectWithValue }) => {
        try {
            await productApi.deleteProduct(productId);
            return productId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
        }
    }
);

export const fetchProductStats = createAsyncThunk(
    'products/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productApi.getProductsByPlatform();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

const initialState = {
    products: [],
    selectedProduct: null,
    priceHistory: {},
    stats: {},
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
    loading: false,
    error: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch price history
            .addCase(fetchPriceHistory.fulfilled, (state, action) => {
                state.priceHistory[action.payload.productId] = action.payload.data;
            })
            // Remove product
            .addCase(removeProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
                if (state.selectedProduct?.id === action.payload) {
                    state.selectedProduct = null;
                }
            })
            // Fetch stats
            .addCase(fetchProductStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
