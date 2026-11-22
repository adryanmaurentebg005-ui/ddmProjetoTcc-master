import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { applyTheme, ThemeMode, theme } from '../constants/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'denuncia-urbana-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>('automatic');
  const [systemScheme, setSystemScheme] = React.useState<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');
  const [, setHydrated] = React.useState(false);

  React.useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'automatic') {
        setModeState(saved);
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));

    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => subscription.remove();
  }, []);

  const isDark = mode === 'dark' || (mode === 'automatic' && systemScheme === 'dark');

  // Synchronize the shared palette before descendants render on mode changes.
  applyTheme(isDark ? 'dark' : 'light');

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY, nextMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = React.useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme deve ser usado dentro de ThemeProvider.');
  return value;
}

export { theme };
