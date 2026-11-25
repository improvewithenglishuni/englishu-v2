const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'stills';
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, (process.env.CARD||'card.html')));
  await p.evaluate(() => window.ready); await p.waitForTimeout(300);
  const el = await p.$('#stage');
  const T = await p.evaluate(() => window.TOTAL || 81);
  const frames = mode === 'stills' ? (process.env.FR ? process.env.FR.split(',').map(Number) : [0, 6, 10, 14, 18, 22, 26, 40, 60, T - 1]) : [...Array(T).keys()];
  const dir = path.join(__dirname, mode === 'stills' ? 'stills' : 'frames'); fs.mkdirSync(dir, { recursive: true });
  for (const f of frames) { await p.evaluate(f => setFrame(f), f); await el.screenshot({ path: `${dir}/f${String(f).padStart(3, '0')}.png` }); }
  await b.close();
})();
