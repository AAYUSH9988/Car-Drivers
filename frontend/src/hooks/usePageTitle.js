import { useEffect } from 'react';

const BASE = 'GoPilot';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — The Art of Arrival`;
    return () => {
      document.title = `${BASE} — The Art of Arrival`;
    };
  }, [title]);
};

export default usePageTitle;
