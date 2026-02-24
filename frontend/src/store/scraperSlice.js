import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scraperApi from '../utils/scraperApi';

// Async thunks
export const fetchSupportedPlatforms = createAsyncThunk(
    'scraper/fetchSupportedPlatforms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await scraperApi.getSupportedPlatforms();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch platforms');
        }
    }
);

export const scrapeNewProduct = createAsyncThunk(
    'scraper/scrapeProduct',
    async (url, { rejectWithValue }) => {
        try {
            const response = await scraperApi.scrapeProduct(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to scrape product');
        }
    }
);

export const scrapeMultiPlatform = createAsyncThunk(
    'scraper/scrapeMultiPlatform',
    async (urls, { rejectWithValue }) => {
        try {
            const response = await scraperApi.scrapeMultiPlatform(urls);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to scrape from multiple platforms');
        }
    }
);

export const searchCrossPlatform = createAsyncThunk(
    'scraper/searchCrossPlatform',
    async ({ url, platforms }, { rejectWithValue }) => {
        try {
            const response = await scraperApi.searchCrossPlatform(url, platforms);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search across platforms');
        }
    }
);

export const updatePrice = createAsyncThunk(
    'scraper/updatePrice',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await scraperApi.updateProductPrice(productId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update price');
        }
    }
);

const initialState = {
    supportedPlatforms: [],
    scrapedProduct: null,
    scrapedProducts: [], // For multi-platform results
    searchResults: null, // For cross-platform search results
    scraping: false,
    searching: false,
    updating: false,
    error: null,
};

const scraperSlice = createSlice({
    name: 'scraper',
    initialState,
    reducers: {
        clearScrapedProduct: (state) => {
            state.scrapedProducts = [];
            state.scrapedProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = null;
        },
        addToSearchHistory: (state, action) => {
            // Add product to search history if not already there
            const productExists = state.scrapedProducts.some(p => p.url === action.payload.url);
            if (!productExists) {
                state.scrapedProducts = [action.payload, ...state.scrapedProducts].slice(0, 10);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch supported platforms
            .addCase(fetchSupportedPlatforms.fulfilled, (state, action) => {
                state.supportedPlatforms = action.payload.platforms;
            })
            // Scrape new product
            .addCase(scrapeNewProduct.pending, (state) => {
                state.scraping = true;
                state.error = null;
            })
            .addCase(scrapeNewProduct.fulfilled, (state, action) => {
                state.scraping = false;
                state.scrapedProduct = action.payload;
            })
            .addCase(scrapeNewProduct.rejected, (state, action) => {
                state.scraping = false;
                state.error = action.payload;
            })
            // Scrape multi-platform
            .addCase(scrapeMultiPlatform.pending, (state) => {
                state.scraping = true;
                state.error = null;
                state.scrapedProducts = [];
            })
            .addCase(scrapeMultiPlatform.fulfilled, (state, action) => {
                state.scraping = false;
                state.scrapedProducts = action.payload.products || [];
            })
            .addCase(scrapeMultiPlatform.rejected, (state, action) => {
                state.scraping = false;
                state.error = action.payload;
            })
            // Search cross-platform
            .addCase(searchCrossPlatform.pending, (state) => {
                state.searching = true;
                state.scraping = true;
                state.error = null;
                state.searchResults = null;
                state.scrapedProduct = null;
                state.scrapedProducts = [];
            })
            .addCase(searchCrossPlatform.fulfilled, (state, action) => {
                state.searching = false;
                state.scraping = false;
                state.searchResults = action.payload;
                
                // Populate legacy fields for backwards compatibility
                state.scrapedProduct = action.payload.mainProduct;
                state.scrapedProducts = action.payload.similarProducts || [];
            })
            .addCase(searchCrossPlatform.rejected, (state, action) => {
                state.searching = false;
                state.scraping = false;
                state.error = action.payload;
            })
            // Update price
            .addCase(updatePrice.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updatePrice.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updatePrice.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const { clearScrapedProduct, clearError, clearSearchResults, addToSearchHistory } = scraperSlice.actions;
export default scraperSlice.reducer;
