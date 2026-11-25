// Uso: node herramientas/foto.js plantilla.html salida.(png|jpg) [ancho] [alto] ['{"datos":"en JSON"}']
// Si la plantilla tiene window.pinta(datos), la llama con el JSON antes de la foto.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [, , html, out, w = '1080', h = '1350', datos] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(html));
  if (datos) { await p.evaluate(d => window.pinta && window.pinta(d), JSON.parse(datos)); }
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  await p.screenshot({ path: out, type: /\.jpe?g$/.test(out) ? 'jpeg' : 'png', quality: /\.jpe?g$/.test(out) ? 92 : undefined });
  await b.close();
})();
