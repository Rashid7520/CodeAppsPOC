import { useContext, useEffect } from 'react';
import { DEFAULT_HEADER, PageHeaderContext, type PageHeaderContextValue } from './pageHeaderStore';

export function usePageHeaderContext(): PageHeaderContextValue {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeaderContext must be used within PageHeaderProvider');
  return ctx;
}

/**
 * Call from any page to set the title/subtitle shown in the shared app shell
 * header. Resets to the default header on unmount so navigating away never
 * leaves a stale title behind.
 */
export function usePageHeader(title: string, subtitle?: string) {
  const { setHeader } = usePageHeaderContext();

  useEffect(() => {
    setHeader({ title, subtitle });
    return () => setHeader(DEFAULT_HEADER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle]);
}
