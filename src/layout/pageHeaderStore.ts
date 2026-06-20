import { createContext } from 'react';

export interface PageHeaderState {
  title: string;
  subtitle?: string;
}

export interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (header: PageHeaderState) => void;
}

export const DEFAULT_HEADER: PageHeaderState = {
  title: 'Executive Mobility Tracker',
  subtitle: 'Track executive vehicle assignments and availability',
};

export const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined);
