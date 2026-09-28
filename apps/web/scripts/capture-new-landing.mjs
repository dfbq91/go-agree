import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.resolve('/Users/dbetan2/Documents/go-agree/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log(`Starting local server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: '/Users/dbetan2/Documents/go-agree/apps/web',
    stdio: 'ignore',
  });

  // Wait 4 seconds for server to start
  await new Promise((resolve) => setTimeout(resolve, 4000));

  try {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });

    // Desktop
    console.log('Capturing Desktop (1280x800)...');
    const contextDesktop = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const pageDesktop = await contextDesktop.newPage();
    await pageDesktop.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await pageDesktop.waitForTimeout(1000);
    const desktopPath = path.join(OUTPUT_DIR, 'landing-redesign-desktop.png');
    await pageDesktop.screenshot({ path: desktopPath, fullPage: true });
    console.log(`Desktop screenshot saved to ${desktopPath}`);
    await contextDesktop.close();

    // Mobile
    console.log('Capturing Mobile (390x844)...');
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await pageMobile.waitForTimeout(1000);
    const mobilePath = path.join(OUTPUT_DIR, 'landing-redesign-mobile.png');
    await pageMobile.screenshot({ path: mobilePath, fullPage: true });
    console.log(`Mobile screenshot saved to ${mobilePath}`);
    await contextMobile.close();

    await browser.close();
    console.log('Finished capturing all screenshots!');
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
