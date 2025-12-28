import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservaForm from './ReservaForm';
import { AuthContext } from '../../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import localService from '../../services/localService';
import bandaService from '../../services/bandaService';

// Mock services
vi.mock('../../services/localService');
vi.mock('../../services/bandaService');

const mockUser = {
  id: 1,
  nombre: 'Test',
  apellido: 'User',
  email: 'test@example.com'
};

const mockLocales = [
  { id: 1, nombre: 'Local 1' },
  { id: 2, nombre: 'Local 2' }
];

const mockBandas = [
  {
    id: 1,
    nombre: 'Banda 1',
    miembros: [{ id: 1, nombre: 'Test' }]
  },
  {
    id: 2,
    nombre: 'Banda 2',
    miembros: [{ id: 1, nombre: 'Test' }]
  }
];

const mockReserva = {
  id: 1,
  tipoEvento: 'ENSAYO',
  local: { id: 1, nombre: 'Local 1' },
  banda: null,
  fechaInicio: '2025-01-15T10:00:00',
  fechaFin: '2025-01-15T12:00:00',
  esReservaDiaCompleto: false,
  notas: 'Test notes'
};

const TestWrapper = ({ children }) => (
  <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true, loading: false }}>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      {children}
    </LocalizationProvider>
  </AuthContext.Provider>
);

describe('ReservaForm', () => {
  beforeEach(() => {
    localService.getAll.mockResolvedValue({ data: mockLocales });
    bandaService.getAll.mockResolvedValue({ data: mockBandas });
  });

  it('renders form with default values for new reserva', async () => {
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Nueva Reserva')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Tipo de Evento/i)).toBeInTheDocument();
  });

  it('renders form with existing reserva data for editing', async () => {
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={mockReserva}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Editar Reserva')).toBeInTheDocument();
    });
  });

  it('shows local as required for ENSAYO', async () => {
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const localField = screen.getByLabelText(/Local$/i);
      expect(localField).toBeInTheDocument();
    });
  });

  it('shows banda as required for SHOW', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Evento/i)).toBeInTheDocument();
    });

    const tipoSelect = screen.getByLabelText(/Tipo de Evento/i);
    await user.click(tipoSelect);

    const showOption = await screen.findByText('Show de Banda');
    await user.click(showOption);

    await waitFor(() => {
      expect(screen.getByText(/Los shows se confirman automáticamente/i)).toBeInTheDocument();
    });
  });

  it('shows dia completo checkbox only for ENSAYO', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Reserva de día completo/i)).toBeInTheDocument();
    });

    const tipoSelect = screen.getByLabelText(/Tipo de Evento/i);
    await user.click(tipoSelect);

    const showOption = await screen.findByText('Show de Banda');
    await user.click(showOption);

    await waitFor(() => {
      expect(screen.queryByText(/Reserva de día completo/i)).not.toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={onClose}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('loads locales and bandas when form opens', async () => {
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(localService.getAll).toHaveBeenCalled();
      expect(bandaService.getAll).toHaveBeenCalled();
    });
  });

  it('disables tipo evento field when editing', async () => {
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={mockReserva}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const tipoSelect = screen.getByLabelText(/Tipo de Evento/i);
      expect(tipoSelect).toBeDisabled();
    });
  });

  it('shows contextual alert for ENSAYO dia completo', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Reserva de día completo/i)).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Reserva de día completo/i);
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText(/requieren la aprobación de todos los usuarios del local/i)).toBeInTheDocument();
    });
  });

  it('shows success alert for SHOW tipo', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Evento/i)).toBeInTheDocument();
    });

    const tipoSelect = screen.getByLabelText(/Tipo de Evento/i);
    await user.click(tipoSelect);

    const showOption = await screen.findByText('Show de Banda');
    await user.click(showOption);

    await waitFor(() => {
      expect(screen.getByText(/Los shows se confirman automáticamente/i)).toBeInTheDocument();
    });
  });

  it('shows success alert for SHOW_PERSONAL tipo', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ReservaForm
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          reserva={null}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Evento/i)).toBeInTheDocument();
    });

    const tipoSelect = screen.getByLabelText(/Tipo de Evento/i);
    await user.click(tipoSelect);

    const showPersonalOption = await screen.findByText('Show Personal');
    await user.click(showPersonalOption);

    await waitFor(() => {
      expect(screen.getByText(/Los shows personales se confirman automáticamente/i)).toBeInTheDocument();
    });
  });
});
