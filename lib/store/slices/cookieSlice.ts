import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
}

const initialState: CookieState = {
  hasConsented: false,
  preferences: {
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  },
  showBanner: true,
};

const cookieSlice = createSlice({
  name: 'cookies',
  initialState,
  reducers: {
    acceptAllCookies: (state) => {
      state.hasConsented = true;
      state.preferences = {
        necessary: true,
        analytics: true,
        marketing: true,
      };
      state.showBanner = false;
      // Save to localStorage
      localStorage.setItem(
        'cookiePreferences',
        JSON.stringify(state.preferences)
      );
    },
    rejectNonNecessaryCookies: (state) => {
      state.hasConsented = true;
      state.preferences = {
        necessary: true,
        analytics: false,
        marketing: false,
      };
      state.showBanner = false;
      // Save to localStorage
      localStorage.setItem(
        'cookiePreferences',
        JSON.stringify(state.preferences)
      );
    },
    saveCookiePreferences: (
      state,
      action: PayloadAction<CookiePreferences>
    ) => {
      state.hasConsented = true;
      state.preferences = action.payload;
      state.showBanner = false;
      // Save to localStorage
      localStorage.setItem(
        'cookiePreferences',
        JSON.stringify(state.preferences)
      );
    },
    loadCookiePreferences: (state) => {
      const saved = localStorage.getItem('cookiePreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        state.preferences = { ...preferences, necessary: true };
        state.hasConsented = true;
        state.showBanner = false;
      }
    },
    showCookieBanner: (state) => {
      state.showBanner = true;
    },
    hideCookieBanner: (state) => {
      state.showBanner = false;
    },
  },
});

export const {
  acceptAllCookies,
  rejectNonNecessaryCookies,
  saveCookiePreferences,
  loadCookiePreferences,
  showCookieBanner,
  hideCookieBanner,
} = cookieSlice.actions;

export default cookieSlice.reducer;
