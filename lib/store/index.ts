import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import cookieReducer from './slices/cookieSlice';
import { authMiddleware } from './middleware';
import { reduxStorage, isClient } from './storage';

// Configure persistence for auth slice only
const authPersistConfig = {
  key: 'auth',
  storage: reduxStorage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Exclude rememberMe from persistence
  // Prevent persistence during SSR
  skip: !isClient(),
  // Add these options to prevent SSR issues
  serialize: true,
  deserialize: true,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    theme: themeReducer,
    cookies: cookieReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    }).concat(authMiddleware),
});

export const persistor = persistStore(store);

// Define the root state type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
