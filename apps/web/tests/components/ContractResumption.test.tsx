import type { ContractDashboardItemDTO } from '@go-agree/application';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContractTableRow } from '../../src/components/dashboard/ContractTableRow';
import { es } from '../../src/locales/es';

describe('ContractResumption & Answer Count (User Story 2)', () => {
  const inProgressContract: ContractDashboardItemDTO = {
    id: 'contract-draft-123',
    userId: 'user-1',
    title: 'Acuerdo en Borrador',
    status: 'in_progress',
    currentQuestionIndex: 3,
    questionsAnsweredCount: 3,
    hasGeneratedDocument: false,
    availableFormats: [],
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-10T12:00:00Z'),
  };

  const completedContract: ContractDashboardItemDTO = {
    id: 'contract-done-456',
    userId: 'user-1',
    title: 'Acuerdo Completado',
    status: 'completed',
    currentQuestionIndex: 10,
    questionsAnsweredCount: 10,
    hasGeneratedDocument: true,
    availableFormats: ['pdf', 'docx'],
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-12T12:00:00Z'),
  };

  it('renders in-progress contract linking to /questionnaire?id={id} and displays answered count', () => {
    render(
      <table>
        <tbody>
          <ContractTableRow contract={inProgressContract} />
        </tbody>
      </table>
    );

    // Title link resumes questionnaire
    const titleLink = screen.getByRole('link', { name: inProgressContract.title });
    expect(titleLink.getAttribute('href')).toBe(`/questionnaire?id=${inProgressContract.id}`);

    // Contextual resumption link in actions column
    const resumeLink = screen.getByRole('link', {
      name: new RegExp(es.dashboard.resumeDraft, 'i'),
    });
    expect(resumeLink.getAttribute('href')).toBe(`/questionnaire?id=${inProgressContract.id}`);

    // Questions answered count format
    expect(screen.getByText('3 respondidas')).toBeDefined();
  });

  it('renders completed contract linking to /questionnaire?id={id}&mode=summary and displays answered count', () => {
    render(
      <table>
        <tbody>
          <ContractTableRow contract={completedContract} />
        </tbody>
      </table>
    );

    // Title link navigates to summary
    const titleLink = screen.getByRole('link', { name: completedContract.title });
    expect(titleLink.getAttribute('href')).toBe(
      `/questionnaire?id=${completedContract.id}&mode=summary`
    );

    // Contextual view summary link in actions column
    const summaryLink = screen.getByRole('link', {
      name: new RegExp(es.dashboard.viewSummary, 'i'),
    });
    expect(summaryLink.getAttribute('href')).toBe(
      `/questionnaire?id=${completedContract.id}&mode=summary`
    );

    // Questions answered count format
    expect(screen.getByText('10 respondidas')).toBeDefined();
  });
});
