import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DownloadDropdown } from '../../src/components/dashboard/DownloadDropdown';
import { es } from '../../src/locales/es';

describe('DownloadDropdown Component (User Story 3)', () => {
  it('renders disabled trigger with tooltip when document is not generated', () => {
    render(<DownloadDropdown contractId="c-123" hasGeneratedDocument={false} />);

    const button = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('title')).toBe(es.dashboard.download.tooltipNotGenerated);

    // Clicking should not open menu
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders enabled trigger and opens accessible menu on click when document exists', () => {
    render(<DownloadDropdown contractId="c-456" hasGeneratedDocument={true} />);

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('disabled')).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const menu = screen.getByRole('menu');
    expect(menu).toBeDefined();

    // Verify PDF and DOCX options
    const pdfOption = screen.getByRole('menuitem', { name: /Descargar PDF/i });
    const docxOption = screen.getByRole('menuitem', { name: /Descargar Word/i });

    expect(pdfOption).toBeDefined();
    expect(docxOption).toBeDefined();

    // Verify links/actions
    expect(pdfOption.getAttribute('href')).toBe('/api/contracts/c-456/download?format=pdf');
    expect(docxOption.getAttribute('href')).toBe('/api/contracts/c-456/download?format=docx');
  });

  it('closes the menu on Escape key press', () => {
    render(<DownloadDropdown contractId="c-789" hasGeneratedDocument={true} />);

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <DownloadDropdown contractId="c-789" hasGeneratedDocument={true} />
      </div>
    );

    const trigger = screen.getByRole('button', {
      name: new RegExp(es.dashboard.download.action, 'i'),
    });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
