import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const PORT = 3012;
const BASE_URL = `http://localhost:${PORT}/preview-questionnaire`;
const OUTPUT_DIR = path.resolve('/Users/dbetan2/Documents/go-agree/screenshots');
const ARTIFACT_DIR = path.resolve(
  '/Users/dbetan2/.gemini/antigravity/brain/b6d452b2-db22-49e6-81c7-5ed9c0ba63a1'
);

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // wait and retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

async function main() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: '/Users/dbetan2/Documents/go-agree/apps/web',
    stdio: 'ignore',
  });

  try {
    console.log('Waiting for server to be ready...');
    await waitForServer(BASE_URL);
    console.log('Server is ready!');

    console.log('Launching browser with Playwright...');
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

    const desktopPath = path.join(OUTPUT_DIR, 'questionnaire-redesign-desktop.png');
    await pageDesktop.screenshot({ path: desktopPath, fullPage: true });
    console.log(`Desktop screenshot saved to ${desktopPath}`);

    const artifactDesktop = path.join(ARTIFACT_DIR, 'questionnaire-redesign-desktop.png');
    fs.copyFileSync(desktopPath, artifactDesktop);
    console.log(`Copied to artifact dir: ${artifactDesktop}`);
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

    const mobilePath = path.join(OUTPUT_DIR, 'questionnaire-redesign-mobile.png');
    await pageMobile.screenshot({ path: mobilePath, fullPage: true });
    console.log(`Mobile screenshot saved to ${mobilePath}`);

    const artifactMobile = path.join(ARTIFACT_DIR, 'questionnaire-redesign-mobile.png');
    fs.copyFileSync(mobilePath, artifactMobile);
    console.log(`Copied to artifact dir: ${artifactMobile}`);
    await contextMobile.close();

    await browser.close();
    console.log('Finished capturing Questionnaire screenshots successfully!');
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
