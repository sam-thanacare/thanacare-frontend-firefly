import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';

  const saved = localStorage.getItem('theme') as Theme;
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    return saved;
  }

  return 'system';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  systemTheme: getSystemTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload;
    },
  },
});

export const { setTheme, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
