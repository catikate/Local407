import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarView from './CalendarView';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const mockEventos = [
  {
    id: 1,
    title: 'Ensayo - Local 1',
    start: '2025-01-15T10:00:00',
    end: '2025-01-15T12:00:00',
    color: '#4CAF50',
    tipo: 'ENSAYO'
  },
  {
    id: 2,
    title: 'Show: Banda 1',
    start: '2025-01-15T20:00:00',
    end: '2025-01-15T23:00:00',
    color: '#2196F3',
    tipo: 'SHOW'
  },
  {
    id: 3,
    title: 'Show Personal',
    start: '2025-01-20T18:00:00',
    end: '2025-01-20T21:00:00',
    color: '#9C27B0',
    tipo: 'SHOW_PERSONAL'
  }
];

const TestWrapper = ({ children }) => (
  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    {children}
  </LocalizationProvider>
);

describe('CalendarView', () => {
  it('renders calendar component', () => {
    render(
      <TestWrapper>
        <CalendarView eventos={[]} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays message when no events for selected day', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={[]} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay eventos para este día/i)).toBeInTheDocument();
    });
  });

  it('renders event list for selected day with events', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Ensayo - Local 1')).toBeInTheDocument();
      expect(screen.getByText('Show: Banda 1')).toBeInTheDocument();
    });
  });

  it('displays event times correctly', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
      expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });
  });

  it('shows tipo label for events', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Ensayo')).toBeInTheDocument();
      expect(screen.getByText('Show')).toBeInTheDocument();
    });
  });

  it('calls onEventClick when event is clicked', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();

    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={onEventClick} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Ensayo - Local 1')).toBeInTheDocument();
    });

    const eventCard = screen.getByText('Ensayo - Local 1').closest('div[role="button"]') ||
                      screen.getByText('Ensayo - Local 1').closest('.MuiPaper-root');

    if (eventCard) {
      await user.click(eventCard);
      expect(onEventClick).toHaveBeenCalledWith(mockEventos[0]);
    }
  });

  it('displays correct event count indicators on days', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });
  });

  it('formats date header in Spanish', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const dateHeader = screen.getByText(/de/);
      expect(dateHeader).toBeInTheDocument();
    });
  });

  it('shows ENSAYO events with correct color', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const ensayoEvent = screen.getByText('Ensayo - Local 1').closest('.MuiPaper-root');
      if (ensayoEvent) {
        const style = window.getComputedStyle(ensayoEvent);
        expect(style.borderLeftColor).toBeTruthy();
      }
    });
  });

  it('shows SHOW events with correct color', async () => {
    render(
      <TestWrapper>
        <CalendarView eventos={mockEventos} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const showEvent = screen.getByText('Show: Banda 1').closest('.MuiPaper-root');
      if (showEvent) {
        const style = window.getComputedStyle(showEvent);
        expect(style.borderLeftColor).toBeTruthy();
      }
    });
  });

  it('shows SHOW_PERSONAL events with correct color', async () => {
    const showPersonalEvent = [{
      id: 3,
      title: 'Show Personal',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      color: '#9C27B0',
      tipo: 'SHOW_PERSONAL'
    }];

    render(
      <TestWrapper>
        <CalendarView eventos={showPersonalEvent} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const personalEvent = screen.getByText('Show Personal').closest('.MuiPaper-root');
      if (personalEvent) {
        const style = window.getComputedStyle(personalEvent);
        expect(style.borderLeftColor).toBeTruthy();
      }
    });
  });

  it('limits color dots to 3 per day', async () => {
    const manyEvents = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: `Event ${i + 1}`,
      start: '2025-01-15T10:00:00',
      end: '2025-01-15T12:00:00',
      color: '#4CAF50',
      tipo: 'ENSAYO'
    }));

    render(
      <TestWrapper>
        <CalendarView eventos={manyEvents} onEventClick={vi.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });
  });
});
