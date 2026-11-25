// Graba el simulador de domótica de reservadeportes.com/automatizacion-pistas-deportivas/ mientras se usa: puerta, luces, intensidad y cubierta.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, recordVideo: { dir: __dirname + '/vsim', size: { width: 1280, height: 860 } } });
  const t0 = Date.now(); const p = await ctx.newPage();
  await p.goto('https://www.reservadeportes.com/automatizacion-pistas-deportivas/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.evaluate(() => { document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')); });
  const sim = await p.$('.sim'); await sim.scrollIntoViewIfNeeded();
  await p.evaluate(() => { const s = document.querySelector('.sim'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - (innerHeight - s.offsetHeight) / 2); });
  await p.waitForTimeout(1200);
  const box = await sim.boundingBox(); const tIni = (Date.now() - t0) / 1000;
  const clic = async c => { const el = await p.$('.simtile[data-ctrl="' + c + '"]'); const bb = await el.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 12 }); await p.waitForTimeout(150); await p.mouse.down(); await p.mouse.up(); };
  await p.waitForTimeout(800);
  await clic('door'); await p.waitForTimeout(1800);
  await clic('lights'); await p.waitForTimeout(1800);
  const r = await (await p.$('#dimmer')).boundingBox();
  await p.mouse.move(r.x + r.width * 0.8, r.y + r.height / 2, { steps: 10 }); await p.mouse.down();
  await p.mouse.move(r.x + r.width * 0.3, r.y + r.height / 2, { steps: 25 }); await p.waitForTimeout(400);
  await p.mouse.move(r.x + r.width * 1.0, r.y + r.height / 2, { steps: 35 }); await p.mouse.up(); await p.waitForTimeout(1000);
  await clic('cover'); await p.waitForTimeout(2200);
  await clic('door'); await p.waitForTimeout(2000);
  const tFin = (Date.now() - t0) / 1000;
  const v = p.video(); await ctx.close(); const path = await v.path();
  fs.writeFileSync(__dirname + '/sim.json', JSON.stringify({ video: path, ini: tIni, fin: tFin, box }));
  console.log(path, tIni, tFin, JSON.stringify(box)); await b.close();
})();
