// Graba una partida de Atrapa al fantasma jugada sola.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: __dirname + '/vidf', size: { width: 1280, height: 800 } } });
  const t0 = Date.now();
  await ctx.route('**/api/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"ilimitado":true,"logueado":false}' }));
  await ctx.addInitScript(() => { localStorage.setItem('aej-lang', 'es'); localStorage.setItem('aej-curso', '2'); localStorage.removeItem('aej-miclase'); localStorage.removeItem('aej-comp'); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8766/juegos/fantasmas.html'); await p.waitForTimeout(1800);
  await p.evaluate(() => { const g = document.querySelector('.seg[data-key="goal"] button[data-v="5"]'); if (g) g.click(); const c = document.querySelector('.seg[data-key="cuantos"] button[data-v="6"]'); if (c) c.click(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const s = document.getElementById('btnStart'); s.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); s.click(); });
  const tStart = (Date.now() - t0) / 1000;
  await p.waitForTimeout(3500);
  const turnos = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0];
  let k = 0, fallo = false;
  while (k < 120) {
    if (await p.evaluate(() => !!document.querySelector('#end.show, .ov.show#end'))) break;
    const eq = turnos[k % turnos.length]; k++;
    const r = await p.evaluate(([eq, fallar]) => {
      const cue = (document.getElementById('cue' + eq) || {}).textContent || '';
      const gs = [...document.querySelectorAll('#zona' + eq + ' .fant')].filter(e => e.className === 'fant');
      const ev = s => Function('return (' + s.replace(/[×·x]/g, '*').replace(/[÷:]/g, '/').replace(/[−–]/g, '-') + ')')();
      const ok = n => { try { if (cue.indexOf('?') >= 0) { const [l, rr] = cue.replace('?', n).split('='); return rr !== undefined ? Math.abs(ev(l) - ev(rr)) < 1e-9 : false; } return Math.abs(ev(cue.split('=')[0]) - n) < 1e-9; } catch (e) { return false; } };
      let g = gs.find(e => ok(+e.querySelector('b').textContent));
      if (fallar) g = gs.find(e => !ok(+e.querySelector('b').textContent));
      if (!g) return { cue, n: gs.length, hit: false };
      g.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' }));
      return { cue, n: gs.length, hit: true, num: g.querySelector('b').textContent };
    }, [eq, eq === 1 && !fallo && k > 5]);
    if (eq === 1 && !fallo && k > 5) fallo = true;
    if (k < 6) console.log(JSON.stringify(r));
    await p.waitForTimeout(r.hit ? 1100 + Math.random() * 500 : 400);
  }
  await p.waitForTimeout(3500);
  const tEnd = (Date.now() - t0) / 1000;
  await p.screenshot({ path: __dirname + '/fin-fantasmas.png' });
  const v = p.video(); await ctx.close(); const path = await v.path();
  fs.writeFileSync(__dirname + '/fantasmas.json', JSON.stringify({ video: path, inicio: tStart, fin: tEnd }));
  console.log(path, tStart, tEnd, errs.join('|')); await b.close();
})();
