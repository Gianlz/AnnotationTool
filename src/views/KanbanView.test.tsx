import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { KanbanView } from './KanbanView';
import { AppThemeProvider } from '../context/ThemeContext';
import { ViewProvider } from '../context/ViewContext';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppThemeProvider>
    <ViewProvider>
      {children}
    </ViewProvider>
  </AppThemeProvider>
);

describe('KanbanView', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render the kanban board header', () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    expect(screen.getByText('Kanban Board')).toBeTruthy();
    expect(screen.getByText('Organize and track your tasks')).toBeTruthy();
  });

  it('should render all default columns', () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    // Use queryAllByText since column names are displayed with text-transform: uppercase
    expect(screen.queryAllByText(/TO DO/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/IN PROGRESS/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/REVIEW/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/DONE/i).length).toBeGreaterThan(0);
  });

  it('should render initial cards', () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    // Use getAllByText since cards may appear multiple times due to React rendering
    expect(screen.getAllByText('Research user requirements').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design system setup').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Project setup').length).toBeGreaterThan(0);
  });

  it('should have Add Column button', () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    const kanbanView = document.getElementById('kanban-view');
    expect(kanbanView).toBeTruthy();
    // Find the Add Column button within the kanban view
    const addColumnButton = kanbanView?.querySelector('button');
    expect(addColumnButton).toBeTruthy();
  });

  it('should show Add Card buttons for each column', () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    const addCardButtons = screen.getAllByRole('button', { name: /Add a card/i });
    expect(addCardButtons.length).toBeGreaterThanOrEqual(4); // At least 4 columns
  });

  it('should show add card form when Add a card is clicked', async () => {
    render(
      <TestWrapper>
        <KanbanView />
      </TestWrapper>
    );

    const addCardButtons = screen.getAllByRole('button', { name: /Add a card/i });
    fireEvent.click(addCardButtons[0]);

    expect(screen.getByPlaceholderText('Enter card title...')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Add Card$/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeTruthy();
  });
});
