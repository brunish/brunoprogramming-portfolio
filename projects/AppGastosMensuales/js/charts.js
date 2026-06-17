import { CAT_MAP } from './constants.js';
import { fmt, sumBy, groupByCat, offsetYM } from './utils.js';

// Instancias activas de Chart.js (para destruirlas antes de re-renderizar)
const charts = {};

function destroyChart(name) {
  if (charts[name]) {
    charts[name].destroy();
    charts[name] = null;
  }
}

// Muestra/oculta el canvas y el mensaje de "sin datos"
function toggleEmpty(canvasId, emptyId, isEmpty) {
  document.getElementById(canvasId).style.display = isEmpty ? 'none' : 'block';
  document.getElementById(emptyId).classList.toggle('show', isEmpty);
}

// Opciones de tooltip compartidas (tema claro)
const tooltipStyle = {
  backgroundColor: '#fff',
  borderColor: '#e8eaf0',
  borderWidth: 1,
  titleColor: '#0f1117',
  bodyColor: '#4a5068',
};

// ── Gráfico principal: dona o barras de gastos por categoría ─────────────────

export function renderMainChart(expenses, chartType) {
  const bc      = groupByCat(expenses);
  const isEmpty = !Object.keys(bc).length;

  toggleEmpty('mainChart', 'mainEmpty', isEmpty);
  destroyChart('main');
  if (isEmpty) return;

  const labels = Object.keys(bc);
  const data   = Object.values(bc);
  const colors = labels.map(l => CAT_MAP[l]?.color || '#888');
  const total  = sumBy(expenses);

  charts.main = new Chart(document.getElementById('mainChart'), {
    type: chartType,
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: chartType === 'doughnut' ? '58%' : undefined,
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 10 }, padding: 8, boxWidth: 9, boxHeight: 9, color: '#4a5068' },
        },
        tooltip: {
          ...tooltipStyle,
          callbacks: { label: ctx => ` ${fmt(ctx.raw)} (${Math.round((ctx.raw / total) * 100)}%)` },
        },
      },
    },
  });
}

// ── Gráfico de barras: gasto por día del mes ──────────────────────────────────

export function renderBarChart(expenses) {
  toggleEmpty('barChart', 'barEmpty', !expenses.length);
  destroyChart('bar');
  if (!expenses.length) return;

  const byDay = expenses.reduce((acc, t) => {
    const day = t.fecha.slice(8); // "DD"
    acc[day]  = (acc[day] || 0) + t.monto;
    return acc;
  }, {});
  const days = Object.keys(byDay).sort();

  charts.bar = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: days.map(d => +d),
      datasets: [{
        data: days.map(d => byDay[d]),
        backgroundColor: 'rgba(91,94,244,.75)',
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
      },
      scales: {
        x: { ticks: { color: '#9aa0b8', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#9aa0b8', font: { size: 10 }, callback: v => '$' + v.toLocaleString('es-AR') }, grid: { color: '#f1f3f8' } },
      },
    },
  });
}

// ── Gráfico de línea: evolución ingresos vs gastos (últimos 6 meses) ─────────

export function renderLineChart(allTransactions, currentYM) {
  const months   = Array.from({ length: 6 }, (_, i) => offsetYM(currentYM, i - 5));
  const getTotal = (ym, type) => sumBy(allTransactions.filter(t => t.fecha.slice(0, 7) === ym && t.type === type));

  const expVals = months.map(ym => getTotal(ym, 'expense'));
  const incVals = months.map(ym => getTotal(ym, 'income'));
  const hasData = expVals.some(v => v > 0) || incVals.some(v => v > 0);

  toggleEmpty('lineChart', 'lineEmpty', !hasData);
  destroyChart('line');
  if (!hasData) return;

  const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const labels = months.map(ym => MONTH_LABELS[+ym.split('-')[1] - 1]);

  const makeDataset = (label, data, borderColor, bgColor) => ({
    label, data, borderColor, fill: true,
    backgroundColor: bgColor,
    borderWidth: 2, pointRadius: 3, pointBackgroundColor: borderColor, tension: 0.35,
  });

  charts.line = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset('Gastos',   expVals, '#f43f5e', 'rgba(244,63,94,.08)'),
        makeDataset('Ingresos', incVals, '#22c55e', 'rgba(34,197,94,.08)'),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { size: 10 }, color: '#4a5068', boxWidth: 10, boxHeight: 10 } },
        tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
      },
      scales: {
        x: { ticks: { color: '#9aa0b8', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#9aa0b8', font: { size: 10 }, callback: v => '$' + v.toLocaleString('es-AR') }, grid: { color: '#f1f3f8' } },
      },
    },
  });
}
