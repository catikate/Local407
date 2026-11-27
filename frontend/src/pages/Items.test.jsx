import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Items from './Items';
import { AuthContext } from '../context/AuthContext';
import itemService from '../services/itemService';
import localService from '../services/localService';
import bandaService from '../services/bandaService';
import usuarioService from '../services/usuarioService';

vi.mock('../services/itemService');
vi.mock('../services/localService');
vi.mock('../services/bandaService');
vi.mock('../services/usuarioService');
vi.mock('../services/prestamoService');

const mockUser = { id: 1, nombre: 'Test', apellido: 'User', email: 'test@example.com' };
const local1 = { id: 1, nombre: 'Local 1' };
const local2 = { id: 2, nombre: 'Local 2' };

const itemDisponible = {
  id: 5,
  descripcion: 'Amplificador',
  cantidad: 2,
  prestado: false,
  propietarioNombre: 'Test User',
  localOriginal: local1,
  localActual: local1,
};
const itemPrestado = {
  id: 6,
  descripcion: 'Guitarra',
  cantidad: 1,
  prestado: true,
  propietarioNombre: 'Test User',
  localOriginal: local1,
  localActual: local2,
};

const renderItems = () =>
  render(
    <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true, loading: false }}>
      <MemoryRouter initialEntries={['/items']}>
        <Routes>
          <Route path="/items" element={<Items />} />
          <Route path="/prestamos" element={<div>Página de préstamos</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('Items', () => {
  beforeEach(() => {
    itemService.getByUsuario.mockResolvedValue([itemDisponible, itemPrestado]);
    localService.getAll.mockResolvedValue({ data: [local1, local2] });
    bandaService.getAll.mockResolvedValue({ data: [] });
    usuarioService.getAll.mockResolvedValue({ data: [] });
  });

  it('abre el formulario de préstamo con el item preseleccionado', async () => {
    const user = userEvent.setup();
    renderItems();

    const card = (await screen.findByText('Amplificador')).closest('.space-y-3');
    await user.click(within(card).getByRole('button', { name: 'Prestar' }));

    expect(await screen.findByText('Nuevo Préstamo')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Amplificador - Local 1')).toBeInTheDocument();
  });

  it('muestra el detalle del item', async () => {
    const user = userEvent.setup();
    renderItems();

    const card = (await screen.findByText('Guitarra')).closest('.space-y-3');
    await user.click(within(card).getByRole('button', { name: 'Ver' }));

    const dialog = await screen.findByRole('dialog', { name: 'Detalle del item' });
    expect(within(dialog).getByText('Guitarra')).toBeInTheDocument();
    expect(within(dialog).getByText('Test User')).toBeInTheDocument();
    expect(within(dialog).getByText('Local 2')).toBeInTheDocument();
    expect(within(dialog).getByText('Prestado')).toBeInTheDocument();

    await user.click(within(dialog).getAllByRole('button', { name: 'Cerrar' })[0]);
    expect(screen.queryByRole('dialog', { name: 'Detalle del item' })).not.toBeInTheDocument();
  });

  it('abre el formulario para añadir un item', async () => {
    const user = userEvent.setup();
    renderItems();

    await screen.findByText('Amplificador');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(await screen.findByText('Nuevo Item')).toBeInTheDocument();
  });

  it('Devolver lleva a la página de préstamos', async () => {
    const user = userEvent.setup();
    renderItems();

    const card = (await screen.findByText('Guitarra')).closest('.space-y-3');
    await user.click(within(card).getByRole('button', { name: 'Devolver' }));

    expect(await screen.findByText('Página de préstamos')).toBeInTheDocument();
  });
});
