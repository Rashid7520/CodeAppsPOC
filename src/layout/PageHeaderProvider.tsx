import React, { useMemo, useState } from 'react';
import { DEFAULT_HEADER, PageHeaderContext, type PageHeaderState } from './pageHeaderStore';

export const PageHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [header, setHeader] = useState<PageHeaderState>(DEFAULT_HEADER);
  const value = useMemo(() => ({ header, setHeader }), [header]);
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
};

export default PageHeaderProvider;
