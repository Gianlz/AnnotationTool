import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

type ViewType = 'whiteboard' | 'kanban';

type ViewContextType = {
  currentView: ViewType;
  setView: (view: ViewType) => void;
};

const ViewContext = createContext<ViewContextType>({
  currentView: 'whiteboard',
  setView: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useViewContext = () => useContext(ViewContext);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('whiteboard');

  const setView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const value = useMemo(() => ({ currentView, setView }), [currentView, setView]);

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
};
