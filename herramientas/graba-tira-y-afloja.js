// Graba una partida de Tira y afloja jugada sola: dos equipos contestan (bien casi siempre) hasta que uno gana.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: __dirname + '/vid', size: { width: 1280, height: 800 } } });
  const t0 = Date.now();
  await ctx.route('**/api/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"ilimitado":true,"logueado":false}' }));
  await ctx.addInitScript(() => { localStorage.setItem('aej-lang', 'es'); localStorage.setItem('aej-curso', '2'); localStorage.removeItem('aej-miclase'); localStorage.removeItem('aej-comp'); });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8766/juegos/tira-y-afloja.html'); await p.waitForTimeout(1800);
  await p.evaluate(() => { window.__R = {}; const C = window.Curriculo, o = C.pregunta; C.pregunta = function () { const q = o.apply(this, arguments); window.__R[q.t + (q.ya ? '' : ' = ?')] = q.a; return q; }; });
  await p.evaluate(() => { const s = document.getElementById('btnStart'); s.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); s.click(); });
  const tStart = Date.now() - t0;
  await p.evaluate(() => { if (window.AEJ_NIVEL2) window.AEJ_NIVEL2(3, 1); });
  await p.waitForTimeout(1200);
  // Turnos: Azul contesta dos veces por cada una de Naranja, y Naranja falla una, para que la cuerda se mueva y haya ganador
  const turnos = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  let k = 0, fallo = false;
  while (k < 200) {
    if (await p.evaluate(() => !!document.querySelector('#end.show'))) break;
    const i = turnos[k % turnos.length], id = i ? '#padB' : '#padA'; k++;
    const q = await p.$eval(id + ' .qt', e => e.textContent);
    let a = await p.evaluate(q => window.__R[q], q);
    if (a === undefined) { await p.waitForTimeout(200); continue; }
    if (i === 1 && !fallo && k > 6) { a = a + 1; fallo = true; }
    for (const d of String(a)) { await p.click(id + ' .key[data-k="' + d + '"]', { timeout: 2000 }).catch(() => {}); await p.waitForTimeout(120); }
    await p.click(id + ' .key[data-k="ok"]', { timeout: 2000 }).catch(() => {});
    await p.waitForTimeout(380 + Math.random() * 250);
  }
  await p.waitForTimeout(3500);
  const tEnd = Date.now() - t0;
  await p.screenshot({ path: __dirname + '/fin-tira.png' });
  const v = p.video(); await ctx.close(); const path = await v.path();
  fs.writeFileSync(__dirname + '/tira.json', JSON.stringify({ video: path, inicio: tStart / 1000, fin: tEnd / 1000 }));
  console.log(path, tStart / 1000, tEnd / 1000); await b.close();
})();
