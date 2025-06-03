import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  currency: 'USD' | 'EUR' | 'GBP';
  language: 'en' | 'fr' | 'de';
  theme: 'dark' | 'light';
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP') => void;
  setLanguage: (language: 'en' | 'fr' | 'de') => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      language: 'en',
      theme: 'dark',
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('light', theme === 'light');
        set({ theme });
      },
    }),
    {
      name: 'settings-store',
    }
  )
);