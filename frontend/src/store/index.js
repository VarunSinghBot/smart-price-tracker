import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import scraperReducer from './scraperSlice';
import alertReducer from './alertSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        scraper: scraperReducer,
        alerts: alertReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
