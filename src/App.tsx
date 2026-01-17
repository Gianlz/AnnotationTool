import { useMemo } from 'react';
import { WhiteboardView } from './views/WhiteboardView';
import { KanbanView } from './views/KanbanView';
import { useViewContext, ViewProvider } from './context/ViewContext';
import { AppMenu } from './components/shared/whiteboard/AppMenu';

const ViewRenderer = () => {
  const { currentView } = useViewContext();

  const viewComponent = useMemo(() => {
    switch (currentView) {
      case 'kanban':
        return <KanbanView />;
      case 'whiteboard':
      default:
        return <WhiteboardView />;
    }
  }, [currentView]);

  return (
    <>
      {viewComponent}
      {currentView !== 'whiteboard' && <AppMenu />}
    </>
  );
};

function App() {
  return (
    <ViewProvider>
      <ViewRenderer />
    </ViewProvider>
  );
}

export default App;
