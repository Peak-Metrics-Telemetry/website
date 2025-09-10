// Mobile Nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Jahr im Footer
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Mini CSV-Loader + Canvas-Plot (ohne externe Libraries)
const fileInput = document.getElementById('csvFile');
const loadBtn = document.getElementById('loadCsvBtn');
const tableBody = document.querySelector('#dataTable tbody');
const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

function parseCSV(text) {
  // Erwartet zwei Spalten: Pixel,Distanz
  return text
    .trim()
    .split(/\r?\n/)
    .map(line => line.split(/[;,]/).map(s => s.trim()))
    .filter(cols => cols.length >= 2 && !isNaN(parseFloat(cols[0])) && !isNaN(parseFloat(cols[1])))
    .map(cols => ({ x: parseFloat(cols[0]), y: parseFloat(cols[1]) }));
}

function renderTable(rows) {
  tableBody.innerHTML = rows.map(r => `<tr><td>${r.x.toFixed(2)}</td><td>${r.y}</td></tr>`).join('');
}

function renderChart(rows) {
  // Sehr einfacher Scatter-Plot
  const padding = 40;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  if (!rows.length) return;

  const xs = rows.map(r => r.x);
  const ys = rows.map(r => r.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  function sx(x){ return padding + ( (x - minX) / (maxX - minX || 1) ) * (w - padding*2); }
  function sy(y){ return h - padding - ( (y - minY) / (maxY - minY || 1) ) * (h - padding*2); }

  // Achsen
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, h - padding);
  ctx.lineTo(w - padding, h - padding);
  ctx.strokeStyle = '#4b5480';
  ctx.stroke();

  // Punkte
  ctx.fillStyle = '#5ee3a1';
  rows.forEach(r => {
    ctx.beginPath();
    ctx.arc(sx(r.x), sy(r.y), 3, 0, Math.PI*2);
    ctx.fill();
  });

  // Einfache lineare Trendlinie (optional)
  const n = rows.length;
  const sumX = rows.reduce((s,r)=>s+r.x,0);
  const sumY = rows.reduce((s,r)=>s+r.y,0);
  const sumXY = rows.reduce((s,r)=>s+r.x*r.y,0);
  const sumX2 = rows.reduce((s,r)=>s+r.x*r.x,0);
  const denom = n*sumX2 - sumX*sumX;
  if (denom !== 0) {
    const m = (n*sumXY - sumX*sumY) / denom;
    const b = (sumY - m*sumX) / n;
    const x1 = minX, y1 = m*x1 + b;
    const x2 = maxX, y2 = m*x2 + b;
    ctx.beginPath();
    ctx.moveTo(sx(x1), sy(y1));
    ctx.lineTo(sx(x2), sy(y2));
    ctx.strokeStyle = '#77a9ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}

loadBtn?.addEventListener('click', async () => {
  const file = fileInput?.files?.[0];
  if (!file) return alert('Bitte CSV auswählen (Spalten: Pixel;Distanz).');
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return alert('CSV konnte nicht gelesen werden. Erwartet: "pixel;distanz" je Zeile.');
  renderTable(rows);
  renderChart(rows);
});

// Initiale Demo-Daten aus der Tabelle zeichnen
(function initFromTable(){
  const rows = Array.from(document.querySelectorAll('#dataTable tbody tr'))
    .map(tr => {
      const tds = tr.querySelectorAll('td');
      return { x: parseFloat(tds[0].textContent), y: parseFloat(tds[1].textContent) };
    });
  renderChart(rows);
})();

