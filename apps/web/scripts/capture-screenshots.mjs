import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://go-agree.netlify.app';
const TEST_EMAIL = 'e2e_test_runner@gmail.com';
const TEST_PASSWORD = 'Password123!';
const OUTPUT_DIR = path.resolve('/Users/dbetan2/Documents/go-agree/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

async function capture() {
  console.log(`[Capture] Starting capture against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Capturing for viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch,
    });
    const page = await context.newPage();

    // 1. Landing Page
    console.log(`[Landing] Navigating to ${BASE_URL}...`);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const landingPath = path.join(OUTPUT_DIR, `landing-${vp.name}.png`);
    await page.screenshot({ path: landingPath, fullPage: false });
    console.log(`[Landing] Saved to ${landingPath}`);

    // 2. Login Page
    console.log(`[Login] Navigating to ${BASE_URL}/login...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const loginPath = path.join(OUTPUT_DIR, `login-${vp.name}.png`);
    await page.screenshot({ path: loginPath, fullPage: false });
    console.log(`[Login] Saved to ${loginPath}`);

    // 3. Authenticate
    console.log(`[Auth] Logging in via ${BASE_URL}/api/auth/login...`);
    const loginRes = await context.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    if (!loginRes.ok()) {
      console.warn(`[Auth] Direct API login failed status: ${loginRes.status()}. Trying UI login...`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => null);
    } else {
      console.log('[Auth] Login successful via API.');
    }

    // 4. Dashboard
    console.log(`[Dashboard] Navigating to ${BASE_URL}/dashboard...`);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const dashboardPath = path.join(OUTPUT_DIR, `dashboard-${vp.name}.png`);
    await page.screenshot({ path: dashboardPath, fullPage: false });
    console.log(`[Dashboard] Saved to ${dashboardPath}`);

    // 5. Questionnaire
    console.log(`[Questionnaire] Navigating to ${BASE_URL}/questionnaire...`);
    await page.goto(`${BASE_URL}/questionnaire`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const questionnairePath = path.join(OUTPUT_DIR, `questionnaire-${vp.name}.png`);
    await page.screenshot({ path: questionnairePath, fullPage: false });
    console.log(`[Questionnaire] Saved to ${questionnairePath}`);

    // 6. Summary: Let's see if we can open an existing summary or answer the questionnaire to summary
    console.log(`[Summary] Navigating to summary mode...`);
    const url = page.url();
    let contractId = null;
    if (url.includes('id=')) {
      contractId = new URL(url).searchParams.get('id');
    }
    
    // Check if there is already a completed contract on dashboard to link to summary
    if (!contractId) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      const completedLink = await page.locator('a[href*="mode=summary"]').first();
      if (await completedLink.isVisible()) {
        const href = await completedLink.getAttribute('href');
        await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
      } else {
        // Just go to /questionnaire with mode=summary
        await page.goto(`${BASE_URL}/questionnaire?mode=summary`, { waitUntil: 'networkidle' });
      }
    } else {
      await page.goto(`${BASE_URL}/questionnaire?id=${contractId}&mode=summary`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(1500);

    const summaryPath = path.join(OUTPUT_DIR, `summary-${vp.name}.png`);
    await page.screenshot({ path: summaryPath, fullPage: false });
    console.log(`[Summary] Saved to ${summaryPath}`);

    await context.close();
  }

  await browser.close();
  console.log('[Capture] All screenshots captured successfully in ./screenshots!');
}

capture().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
