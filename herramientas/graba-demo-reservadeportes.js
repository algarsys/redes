// Graba el paso 1 de reservadeportes.com/demo-interactiva/: el vecino reserva pádel en el móvil y la reserva entra
// en directo en el panel del ayuntamiento. Cada toque se marca con un círculo naranja.
// Uso: node herramientas/graba-demo-reservadeportes.js <carpeta_salida>   (deja video.webm, demo.json con tiempos y fin.png)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.resolve(process.argv[2] || 'vdemo'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const W = 1360, H = 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: out, size: { width: W, height: H } } });
  const t0 = Date.now(); const p = await ctx.newPage(); const t = () => (Date.now() - t0) / 1000;
  await p.goto('https://www.reservadeportes.com/demo-interactiva/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.addStyleTag({ content: 'header,.dm-stepbar{visibility:hidden !important} .toque{position:fixed;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(245,130,31,.45);border:4px solid #F5821F;pointer-events:none;z-index:99999;animation:tq .7s ease-out forwards}@keyframes tq{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.5);opacity:0}}' });
  await p.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    addEventListener('pointerdown', e => { const d = document.createElement('div'); d.className = 'toque'; d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 800); }, true);
    const s = document.querySelector('#reserva .dm-stage__body'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 140);
  });
  await p.waitForTimeout(1500);
  const box = await (await p.$('#reserva .dm-stage__body')).boundingBox();
  const m = { ini: t() };
  const toca = async sel => { await p.hover(sel); await p.waitForTimeout(250); await p.click(sel); };
  await p.waitForTimeout(900);
  m.padel = t(); await toca('#dmPhone .ap-tile--padel'); await p.waitForTimeout(1500);
  m.hora = t(); await toca('#dmPhone .ap-slot[data-p="2"][data-h="18:00"]'); await p.waitForTimeout(1700);
  m.pagar = t(); await toca('#apPagar'); await p.waitForTimeout(5000);
  m.fin = t();
  await p.screenshot({ path: path.join(out, 'fin.png') });
  const v = p.video(); await ctx.close(); const vp = await v.path();
  fs.renameSync(vp, path.join(out, 'video.webm'));
  fs.writeFileSync(path.join(out, 'demo.json'), JSON.stringify({ box, marcas: m }, null, 1));
  console.log(JSON.stringify({ box, marcas: m })); await b.close();
})();
