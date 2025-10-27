import { Entry, Theme } from '../types';

// --- Constantes de Chave ---
const LOGGED_IN_USER_KEY = 'gratitude-journal-user';
const ENTRIES_KEY_PREFIX = 'gratitude-entries-';
const THEME_KEY = 'gratitude-journal-theme';

// --- Lógica do Serviço para gerenciar o armazenamento local ---
export const storageService = {
  getCurrentUser: (): string | null => {
    return localStorage.getItem(LOGGED_IN_USER_KEY);
  },
  setCurrentUser: (username: string): void => {
    localStorage.setItem(LOGGED_IN_USER_KEY, username);
  },
  clearCurrentUser: (): void => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  },
  getTheme: (): Theme => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    // Fallback para a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  setTheme: (theme: Theme): void => {
    localStorage.setItem(THEME_KEY, theme);
  },
  loadEntries: (username: string): Entry[] => {
    try {
      const storedEntries = localStorage.getItem(`${ENTRIES_KEY_PREFIX}${username}`);
      if (storedEntries) {
        return JSON.parse(storedEntries);
      }
    } catch (err) { console.error("Falha ao carregar entradas", err); }
    return [];
  },
  saveEntries: (username: string, entries: Entry[]): void => {
    try {
      localStorage.setItem(`${ENTRIES_KEY_PREFIX}${username}`, JSON.stringify(entries));
    } catch (err) { console.error("Falha ao salvar entradas", err); }
  }
};
