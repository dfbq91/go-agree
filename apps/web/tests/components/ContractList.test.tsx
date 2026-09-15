import type { ContractGenerationSummaryDTO } from '@go-agree/application';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContractList } from '../../src/components/dashboard/ContractList';
import { es } from '../../src/locales/es';

describe('ContractList Component (Dashboard UI & Spanish Localization)', () => {
  it('renders empty state when no contracts exist', () => {
    render(<ContractList contracts={[]} />);

    expect(screen.getByText(es.dashboard.emptyTitle)).toBeDefined();
    expect(screen.getByText(es.dashboard.emptySubtitle)).toBeDefined();
    expect(screen.getByText(es.dashboard.createFirstContract)).toBeDefined();
  });

  it('renders list of contracts with status badges and actions', () => {
    const mockContracts: ContractGenerationSummaryDTO[] = [
      {
        id: 'c-1',
        userId: 'u-1',
        title: 'Contrato de Confidencialidad',
        status: 'in_progress',
        currentQuestionIndex: 2,
        updatedAt: new Date(),
      },
      {
        id: 'c-2',
        userId: 'u-1',
        title: 'Acuerdo de Servicios',
        status: 'completed',
        currentQuestionIndex: 10,
        updatedAt: new Date(),
      },
    ];

    render(<ContractList contracts={mockContracts} />);

    expect(screen.getByText('Contrato de Confidencialidad')).toBeDefined();
    expect(screen.getByText('Acuerdo de Servicios')).toBeDefined();
    expect(screen.getByText(es.dashboard.statusInProgress)).toBeDefined();
    expect(screen.getByText(es.dashboard.statusCompleted)).toBeDefined();
    expect(screen.getByText(`${es.dashboard.resumeDraft} →`)).toBeDefined();
    expect(screen.getByText(`${es.dashboard.viewDocument} →`)).toBeDefined();
  });
});
