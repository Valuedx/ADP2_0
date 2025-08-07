import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import documentReducer from '../store/documentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documentReducer,
  },
});

// ✅ Add and export RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
