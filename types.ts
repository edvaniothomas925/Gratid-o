export interface Entry {
  id: number;
  date: string;
  text: string;
  reflection: string;
}

export type Theme = 'light' | 'dark';
export type SortOrder = 'newest' | 'oldest';
export type NotificationType = 'success' | 'error' | 'info';
