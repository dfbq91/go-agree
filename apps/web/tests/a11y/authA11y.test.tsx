import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { GoogleAuthButton } from '../../src/components/auth/GoogleAuthButton';
import { LoginForm } from '../../src/components/auth/LoginForm';
import { RegisterForm } from '../../src/components/auth/RegisterForm';
import { ResetPasswordForm } from '../../src/components/auth/ResetPasswordForm';
import { ContractList } from '../../src/components/dashboard/ContractList';
import { UserNav } from '../../src/components/ui/UserNav';

describe('WCAG 2.1 AA Accessibility Audit (axe-core)', () => {
  const axeOptions: axe.RunOptions = {
    rules: {
      // happy-dom / jsdom does not calculate CSS render trees for contrast
      'color-contrast': { enabled: false },
    },
  };

  it('LoginForm passes accessibility checks without violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('RegisterForm passes accessibility checks without violations', async () => {
    const { container } = render(<RegisterForm />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('ResetPasswordForm passes accessibility checks without violations', async () => {
    const { container } = render(<ResetPasswordForm />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('GoogleAuthButton passes accessibility checks without violations', async () => {
    const { container } = render(<GoogleAuthButton />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('UserNav passes accessibility checks without violations', async () => {
    const { container } = render(<UserNav userEmail="usuario@ejemplo.com" />);
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it('ContractList empty and populated states pass accessibility checks without violations', async () => {
    const { container: emptyContainer } = render(<ContractList contracts={[]} />);
    const emptyResults = await axe.run(emptyContainer, axeOptions);
    expect(emptyResults.violations).toEqual([]);

    const { container: listContainer } = render(
      <ContractList
        contracts={[
          {
            id: 'c-1',
            userId: 'u-1',
            title: 'Acuerdo Confidencial',
            status: 'in_progress',
            currentQuestionIndex: 1,
            updatedAt: new Date(),
          },
        ]}
      />
    );
    const listResults = await axe.run(listContainer, axeOptions);
    expect(listResults.violations).toEqual([]);
  });
});
