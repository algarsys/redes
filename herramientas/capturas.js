// Captura cada juego en plena partida (o en su pantalla de inicio si no tiene botón de empezar), con la web servida en
// local en http://127.0.0.1:8766/. Sale marcas/tirayafloja/capturas/<id>.jpg a 1280x800.
const { chromium } = require('playwright'); const fs = require('fs');
const J = JSON.parse(fs.readFileSync(__dirname + '/../marcas/tirayafloja/juegos.json', 'utf8'));
const CURSO = { infantil: 0, primaria1: 2, primaria2: 4, primaria3: 6 };
(async () => {
  const b = await chromium.launch(); const hechos = [];
  for (const g of J) {
    const dst = __dirname + '/../marcas/tirayafloja/capturas/' + g.id + '.jpg';
    if (fs.existsSync(dst)) { hechos.push(g.id); continue; }
    const c = g.etapas.length ? CURSO[g.etapas[Math.floor(g.etapas.length / 2)]] : 3;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.route('**/api/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"ilimitado":true,"logueado":false}' }));
    await ctx.addInitScript(c => { localStorage.setItem('aej-lang', 'es'); localStorage.setItem('aej-curso', String(c)); localStorage.removeItem('aej-miclase'); }, c);
    const p = await ctx.newPage(); let err = '';
    p.on('pageerror', e => err = e.message);
    try {
      await p.goto('http://127.0.0.1:8766/juegos/' + g.id + '.html', { timeout: 15000 }); await p.waitForTimeout(1500);
      const hay = await p.evaluate(() => { const s = document.getElementById('btnStart'); if (!s || !s.offsetParent) return false; s.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); s.click(); return true; });
      await p.waitForTimeout(hay ? 4500 : 500);
      await p.screenshot({ path: dst, type: 'jpeg', quality: 85 });
      hechos.push(g.id); console.log('ok', g.id, hay ? 'partida' : 'inicio', err);
    } catch (e) { console.log('FALLO', g.id, e.message.slice(0, 80)); }
    await ctx.close();
  }
  console.log('hechas', hechos.length, 'de', J.length); await b.close();
})();
