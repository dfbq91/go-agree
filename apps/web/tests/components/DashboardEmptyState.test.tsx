import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardEmptyState } from '../../src/components/dashboard/DashboardEmptyState';
import { es } from '../../src/locales/es';

describe('DashboardEmptyState Component (User Story 6)', () => {
  it('renders illustration, localized Spanish copy, and CTA button pointing to /questionnaire', () => {
    render(<DashboardEmptyState />);

    // Title & Subtitle
    expect(screen.getByText(es.dashboard.emptyTitle)).toBeDefined();
    expect(screen.getByText(es.dashboard.emptySubtitle)).toBeDefined();

    // CTA Link
    const ctaLink = screen.getByRole('link', {
      name: new RegExp(es.dashboard.createFirstContract, 'i'),
    });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/questionnaire');
  });
});
