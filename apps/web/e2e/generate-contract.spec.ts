import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = 'e2e_test_runner@gmail.com';
const TEST_PASSWORD = 'Password123!';
const TEST_USER_ID = 'e3fe3109-bc62-4eb0-ab24-d2d56050efe6';

test.describe('Contract Generation & Dashboard Status E2E', () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  test.beforeEach(async () => {
    // Clean up any contracts for the test user before starting
    await supabase.from('contract_generations').delete().eq('user_id', TEST_USER_ID);
    // Reset free quota counter if needed
    await supabase
      .from('user_subscriptions')
      .update({ free_contracts_used: 0, plan_type: 'free', status: 'active' })
      .eq('user_id', TEST_USER_ID);
  });

  test('reproduces issue: check if "Actualización pendiente" appears after contract generation', async ({ page }) => {
    test.setTimeout(120000);
    // 1. Log in via API request (which sets browser context cookies)
    const loginRes = await page.request.post('/api/auth/login', {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    expect(loginRes.ok()).toBeTruthy();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('[E2E] Logged in successfully. Current URL:', page.url());

    // 2. Start new contract questionnaire
    await page.goto('/questionnaire');
    await page.waitForLoadState('networkidle');
    console.log('[E2E] Navigated to /questionnaire. URL:', page.url());

    // Function to click next or review
    const clickNext = async () => {
      const nextBtn = page.locator('button:has-text("Siguiente"), button:has-text("Revisar respuestas")');
      await expect(nextBtn).toBeVisible({ timeout: 5000 });
      await nextBtn.click();
    };

    // Q0: Party role -> Client
    console.log('[E2E] Answering Q0: Contratante');
    await page.locator('#opt-q0_party_role-client').check();
    await expect(page.locator('#opt-q0_party_role-client')).toBeChecked();
    await clickNext();

    // Q1: Legal personality -> Individual
    console.log('[E2E] Answering Q1: Persona natural');
    await expect(page.locator('#opt-q1_legal_personality-individual')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q1_legal_personality-individual').check();
    await expect(page.locator('#opt-q1_legal_personality-individual')).toBeChecked();
    await clickNext();

    // Q2: Description
    console.log('[E2E] Answering Q2: Description');
    await expect(page.locator('#input-q2_description_conditions')).toBeVisible({ timeout: 10000 });
    await page.locator('#input-q2_description_conditions').fill('Desarrollo de software y consultoría técnica especializada');
    await clickNext();

    // Q3: Domicile
    console.log('[E2E] Answering Q3: Domicile');
    await expect(page.locator('#input-q3_domicile')).toBeVisible({ timeout: 10000 });
    await page.locator('#input-q3_domicile').fill('Bogotá D.C., Colombia');
    await clickNext();

    // Q4: Breach impact
    console.log('[E2E] Answering Q4: Breach impact');
    await expect(page.locator('#input-q4_breach_impact')).toBeVisible({ timeout: 10000 });
    await page.locator('#input-q4_breach_impact').fill('Retraso en el cronograma y pérdidas comerciales');
    await clickNext();

    // Q5: Modality -> one_time (Triggers background analysis)
    console.log('[E2E] Answering Q5: Entrega única');
    const analyzePromise = page.waitForResponse(
      (resp) => resp.url().includes('/analyze'),
      { timeout: 15000 }
    ).catch(() => null);

    await expect(page.locator('#opt-q5_modality-one_time')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q5_modality-one_time').check();
    await expect(page.locator('#opt-q5_modality-one_time')).toBeChecked();
    await clickNext();

    // Q5a: Delivery timeframe
    console.log('[E2E] Answering Q5a: Plazo');
    await expect(page.locator('#input-q5a_delivery_timeframe')).toBeVisible({ timeout: 10000 });
    await page.locator('#input-q5a_delivery_timeframe').fill('30 días hábiles');
    await clickNext();

    // Wait for background analysis to settle so dynamic questions are loaded before reaching summary
    console.log('[E2E] Waiting for background analysis to complete...');
    await analyzePromise;
    await page.waitForTimeout(1000);

    // Q6: Service profile -> not_applicable
    console.log('[E2E] Answering Q6: No aplica');
    await expect(page.locator('#opt-q6_service_profile-not_applicable')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q6_service_profile-not_applicable').check();
    await expect(page.locator('#opt-q6_service_profile-not_applicable')).toBeChecked();
    await clickNext();

    // Q8: Termination notice -> days_30
    console.log('[E2E] Answering Q8: 30 días');
    await expect(page.locator('#opt-q8_termination_notice-days_30')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q8_termination_notice-days_30').check();
    await expect(page.locator('#opt-q8_termination_notice-days_30')).toBeChecked();
    await clickNext();

    // Q9: Renewal -> fixed_term
    console.log('[E2E] Answering Q9: Plazo fijo');
    await expect(page.locator('#opt-q9_renewal-fixed_term')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q9_renewal-fixed_term').check();
    await expect(page.locator('#opt-q9_renewal-fixed_term')).toBeChecked();
    await clickNext();

    // Q10: Additional termination (optional)
    console.log('[E2E] Answering Q10: Causales adicionales');
    await expect(page.locator('#input-q10_additional_termination')).toBeVisible({ timeout: 10000 });
    await page.locator('#input-q10_additional_termination').fill('Ninguna causal adicional');
    await clickNext();

    // Q11: Dispute resolution -> ordinary_courts
    console.log('[E2E] Answering Q11: Tribunales ordinarios');
    await expect(page.locator('#opt-q11_dispute_resolution-ordinary_courts')).toBeVisible({ timeout: 10000 });
    await page.locator('#opt-q11_dispute_resolution-ordinary_courts').check();
    await expect(page.locator('#opt-q11_dispute_resolution-ordinary_courts')).toBeChecked();
    await clickNext();

    // Answer any subsequent dynamic questions until reaching summary
    const confirmBtn = page.locator('button:has-text("Confirmar y generar contrato")');
    while (!(await confirmBtn.isVisible())) {
      await page.waitForTimeout(400);
      if (await confirmBtn.isVisible()) {
        break;
      }
      console.log('[E2E] Answering question step...');
      const textarea = page.locator('textarea');
      if (await textarea.isVisible()) {
        await textarea.fill('Acuerdo según las mejores prácticas comerciales');
      } else {
        const firstRadio = page.locator('input[type="radio"], input[type="checkbox"]').first();
        if (await firstRadio.isVisible()) {
          await firstRadio.check();
        }
      }
      const nextBtn = page.locator('button:has-text("Siguiente"), button:has-text("Revisar respuestas")');
      await expect(nextBtn).toBeVisible({ timeout: 10000 });
      await nextBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Now on Summary screen
    console.log('[E2E] Reached summary screen. URL:', page.url());
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });

    // 4. Click confirm & generate
    console.log('[E2E] Clicking "Confirmar y generar contrato"...');
    await confirmBtn.click();

    // 5. Wait for redirection to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('[E2E] Redirected to dashboard. Current URL:', page.url());
    await page.waitForLoadState('networkidle');

    // 6. Inspect the dashboard database state
    const { data: dbContracts } = await supabase
      .from('contract_generations')
      .select('id, title, status, created_at, updated_at')
      .eq('user_id', TEST_USER_ID);
    console.log('[E2E DB] contract_generations in DB:', dbContracts);

    const contractId = dbContracts?.[0]?.id;
    if (contractId) {
      const { data: dbDocs } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('contract_id', contractId);
      console.log('[E2E DB] contract_documents in DB:', dbDocs);

      if (dbContracts?.[0] && dbDocs) {
        const contractUpdatedAt = new Date(dbContracts[0].updated_at).getTime();
        for (const doc of dbDocs) {
          const docCreatedAt = new Date(doc.created_at).getTime();
          console.log(`[E2E DB check] format=${doc.file_format} contract.updated_at=${contractUpdatedAt} doc.created_at=${docCreatedAt} diff(contract - doc)=${contractUpdatedAt - docCreatedAt}ms`);
        }
      }
    }

    // 7. Check whether "Actualización pendiente" or "Descargar" is displayed on the dashboard
    const pendingBadges = page.locator('a:has-text("Actualización pendiente")');
    const downloadDropdownBtns = page.locator('button:has-text("Descargar")');

    const pendingCount = await pendingBadges.count();
    const downloadCount = await downloadDropdownBtns.count();

    console.log('[E2E UI check] "Actualización pendiente" count:', pendingCount);
    console.log('[E2E UI check] "Descargar" count:', downloadCount);

    // Take screenshot of dashboard for evidence
    await page.screenshot({ path: 'e2e-dashboard-result.png', fullPage: true });

    // Assert the behavior
    expect(pendingCount, 'Bug detected: "Actualización pendiente" should NOT be visible on a newly completed contract!').toBe(0);
    expect(downloadCount, 'Expected "Descargar" dropdown button to be visible on dashboard!').toBeGreaterThan(0);
  });
});
