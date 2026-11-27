// Capture DealSleuth screenshots + interaction tests in headless Chrome via
// playwright-core (from the npx cache, as previous entries did). Run from the
// repo root. Serves app/ on 127.0.0.1:8082 — start `node serve.ts --port 8082` first.
const { chromium } = require('/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { join, resolve } = require('node:path');
const { statSync, readFileSync } = require('node:fs');

const here = resolve(__dirname);
const BASE = 'http://127.0.0.1:8082';
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/cft-dl/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
  });
  const errors = [];
  const externalRequests = [];
  const track = (page, label) => {
    page.on('pageerror', (e) => errors.push(`pageerror ${label}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console ${label}: ${m.text()}`); });
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(BASE) && !u.startsWith('data:')) externalRequests.push(`${label}: ${u}`);
    });
  };

  for (const shot of shots) {
    const page = await browser.newPage({ viewport: shot.viewport, deviceScaleFactor: 1 });
    track(page, shot.file);
    await page.goto(`${BASE}/${shot.path}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    if (shot.action === 'filter-tvs') {
      await page.click('.chip[data-cat="TVs & Home Theater"]');
      await page.waitForTimeout(400);
    }
    if (shot.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(300);
    const out = join(here, 'screenshots', shot.file);
    await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
    const size = statSync(out).size;
    console.log('SHOT_OK', shot.file, `${size} bytes`, size <= 262144 ? 'UNDER_256K' : 'OVER_256K!');
    await page.close();
  }

  // --- Interaction tests on a fresh page ---
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  track(page, 'interactions');
  await page.goto(`${BASE}/#/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
  const countAll = await page.locator('.card').count();
  console.log('INTERACT cards on load:', countAll);
  await page.fill('#q', 'airpods');
  await page.waitForTimeout(300);
  console.log('INTERACT search "airpods":', await page.locator('.card').count(), 'cards');
  await page.fill('#q', '');
  await page.click('.chip[data-cat="Gaming"]');
  await page.waitForTimeout(300);
  console.log('INTERACT category Gaming:', await page.locator('.card').count(), 'cards');
  await page.click('.chip[data-cat="All categories"]');
  await page.selectOption('#sort', 'price-asc');
  await page.waitForTimeout(300);
  const firstPrice = await page.locator('.card .price').first().textContent();
  console.log('INTERACT sort lowest price, first card price:', firstPrice);
  await page.goto(`${BASE}/#/deal/airpods-pro-3`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
  console.log('INTERACT detail page title:', await page.locator('.detail h2').textContent());
  console.log('INTERACT detail price:', await page.locator('.dp-price').textContent());

  console.log('ERRORS:', errors.length ? errors : 'none');
  console.log('EXTERNAL_REQUESTS:', externalRequests.length ? externalRequests : 'none');
  await browser.close();
  if (errors.length || externalRequests.length) process.exit(1);
})().catch((e) => { console.error('CAPTURE_FAILED', e); process.exit(1); });
