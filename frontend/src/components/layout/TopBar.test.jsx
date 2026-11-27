import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopBar from './TopBar';
import { AuthContext } from '../../context/AuthContext';
import notificationService, { NOTIFICATIONS_CHANGED_EVENT } from '../../services/notificationService';

vi.mock('../../services/notificationService', async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, default: { getUnreadCount: vi.fn() } };
});

const renderTopBar = () =>
  render(
    <AuthContext.Provider value={{ user: { id: 7, nombre: 'Test' }, isAuthenticated: true, loading: false }}>
      <MemoryRouter>
        <TopBar title="Dashboard" />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('TopBar - notificaciones sin leer', () => {
  beforeEach(() => {
    // Solo el intervalo: waitFor/findBy necesitan setTimeout real
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    notificationService.getUnreadCount.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el número real de notificaciones sin leer', async () => {
    notificationService.getUnreadCount.mockResolvedValue(4);
    renderTopBar();

    expect(await screen.findByText('4')).toBeInTheDocument();
    expect(notificationService.getUnreadCount).toHaveBeenCalledWith(7);
    expect(screen.getByRole('button', { name: 'Notificaciones (4 sin leer)' })).toBeInTheDocument();
  });

  it('no muestra el contador cuando no hay notificaciones sin leer', async () => {
    notificationService.getUnreadCount.mockResolvedValue(0);
    renderTopBar();

    await vi.waitFor(() => expect(notificationService.getUnreadCount).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('se refresca periódicamente', async () => {
    notificationService.getUnreadCount.mockResolvedValueOnce(1).mockResolvedValue(5);
    renderTopBar();
    expect(await screen.findByText('1')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(2);
  });

  it('se refresca cuando se marcan o eliminan notificaciones', async () => {
    notificationService.getUnreadCount.mockResolvedValueOnce(3).mockResolvedValue(2);
    renderTopBar();
    expect(await screen.findByText('3')).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
    });

    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('conserva el último valor si falla la petición', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    notificationService.getUnreadCount.mockResolvedValueOnce(3).mockRejectedValue(new Error('network'));
    renderTopBar();
    expect(await screen.findByText('3')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(2);
    expect(screen.getByText('3')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
