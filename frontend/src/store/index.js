import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import scraperReducer from './scraperSlice';
import alertReducer from './alertSlice';
import productMatcherReducer from './productMatcherSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        scraper: scraperReducer,
        alerts: alertReducer,
        productMatcher: productMatcherReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
