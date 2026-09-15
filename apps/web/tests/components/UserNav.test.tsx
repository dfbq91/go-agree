import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserNav } from '../../src/components/ui/UserNav';
import { es } from '../../src/locales/es';

describe('UserNav Component', () => {
  it('renders user email and accessible logout button with Spanish label', () => {
    render(<UserNav userEmail="usuario@ejemplo.com" />);

    expect(screen.getByText('usuario@ejemplo.com')).toBeDefined();
    const logoutBtn = screen.getByRole('button', { name: es.nav.logout });
    expect(logoutBtn).toBeDefined();
    expect(logoutBtn.textContent).toContain(es.nav.logout);
  });

  it('triggers onLogout callback when logout button is clicked', async () => {
    const handleLogout = vi.fn().mockResolvedValue(undefined);
    render(<UserNav userEmail="usuario@ejemplo.com" onLogout={handleLogout} />);

    const logoutBtn = screen.getByRole('button', { name: es.nav.logout });
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
