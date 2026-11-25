// Lista de juegos de la portada (servida en local, http://127.0.0.1:8766/): marcas/tirayafloja/juegos.json
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.addInitScript(() => { localStorage.setItem('aej-lang', 'es'); });
  await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(1500);
  const src = await p.content();
  const l = [], re = /\{ id: '([^']+)', t: '([^']*)', d: '((?:[^'\\]|\\.)*)', area: '([^']*)', stages: \[([^\]]*)\], tags: \[([^\]]*)\], url: '([^']*)'/g; let m;
  const vistos = {};
  while ((m = re.exec(src))) { if (vistos[m[1]]) continue; vistos[m[1]] = 1; l.push({ id: m[1], nombre: m[2], desc: m[3].replace(/\\'/g, "'"), area: m[4], etapas: m[5].replace(/'/g, '').split(',').map(s => s.trim()).filter(Boolean), temas: m[6].replace(/'/g, '').split(',').map(s => s.trim()).filter(Boolean), url: 'https://www.tirayafloja.com/' + m[7] }); }
  fs.writeFileSync(__dirname + '/../marcas/tirayafloja/juegos.json', JSON.stringify(l, null, 1));
  const por = {}; l.forEach(x => por[x.area] = (por[x.area] || 0) + 1); console.log(l.length, por); console.log(l.slice(0, 2));
  await b.close();
})();
