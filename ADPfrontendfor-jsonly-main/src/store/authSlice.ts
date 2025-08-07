import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  username: string | null; // <-- add username here
  // Backend user type fields
  userType: 'default' | 'power' | 'admin' | null;
  documentsProcessed: number;
  maxDocumentsAllowed: number | null;
  canProcessMore: boolean;
  usageWarnings: string[];
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  userId: localStorage.getItem('userId'),
  username: localStorage.getItem('username'),
  userType: (localStorage.getItem('userType') as 'default' | 'power' | 'admin') || null,
  documentsProcessed: 0,
  maxDocumentsAllowed: 20,
  canProcessMore: true,
  usageWarnings: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<Partial<AuthState>>) => {
      const {
        accessToken,
        refreshToken,
        userId,
        username,
        userType,
        documentsProcessed,
        maxDocumentsAllowed,
        canProcessMore,
        usageWarnings,
      } = action.payload;

      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }
      }
      if (refreshToken !== undefined) {
        state.refreshToken = refreshToken;
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
      }
      if (userId !== undefined) {
        state.userId = userId;
        if (userId) {
          localStorage.setItem('userId', userId);
        } else {
          localStorage.removeItem('userId');
        }
      }
      if (username !== undefined) {
        state.username = username;
        if (username) {
          localStorage.setItem('username', username);
        } else {
          localStorage.removeItem('username');
        }
      }
      if (userType !== undefined) {
        state.userType = userType;
        if (userType) {
          localStorage.setItem('userType', userType);
        } else {
          localStorage.removeItem('userType');
        }
      }
      if (documentsProcessed !== undefined)
        state.documentsProcessed = documentsProcessed;
      if (maxDocumentsAllowed !== undefined)
        state.maxDocumentsAllowed = maxDocumentsAllowed;
      if (canProcessMore !== undefined) state.canProcessMore = canProcessMore;
      if (usageWarnings !== undefined) state.usageWarnings = usageWarnings;
    },
    clearAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.username = null;
      state.userType = null;
      state.documentsProcessed = 0;
      state.maxDocumentsAllowed = 20;
      state.canProcessMore = true;
      state.usageWarnings = [];

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userType');
    },
    updateUsageStats: (
      state,
      action: PayloadAction<{
        documentsProcessed?: number;
        maxDocumentsAllowed?: number | null;
        canProcessMore?: boolean;
        warnings?: string[];
      }>
    ) => {
      const {
        documentsProcessed,
        maxDocumentsAllowed,
        canProcessMore,
        warnings,
      } = action.payload;
      if (typeof documentsProcessed === 'number') {
        state.documentsProcessed = documentsProcessed;
      }
      if (maxDocumentsAllowed !== undefined) {
        state.maxDocumentsAllowed = maxDocumentsAllowed;
      }
      if (typeof canProcessMore === 'boolean') {
        state.canProcessMore = canProcessMore;
      }
      if (warnings) {
        state.usageWarnings = warnings;
      }
    },
  },
});

export const { setAuthData, clearAuthData, updateUsageStats } = authSlice.actions;
export default authSlice.reducer;
