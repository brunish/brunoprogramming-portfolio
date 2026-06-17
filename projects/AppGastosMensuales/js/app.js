import { VIEW_META } from './constants.js';
import { loadData, saveData, todayYM, ymLabel, offsetYM, fmt, sumBy } from './utils.js';
import { renderKPIs, renderBalanceBar, renderCatRows, renderTxList } from './render.js';
import { renderMainChart, renderBarChart, renderLineChart } from './charts.js';
import { buildCatPickers, applyFormType, resetForm, selectExpCat, selectIncCat } from './form.js';

// ── Estado global de la app ───────────────────────────────────────────────────

let data      = loadData();
let currentYM = todayYM();
let chartType = 'doughnut';
let txType    = 'expense'; // 'expense' | 'income'

// ── Filtrado de transacciones ─────────────────────────────────────────────────

function getByMonth(type, ym = currentYM) {
  return data.transactions.filter(t => t.fecha.slice(0, 7) === ym && t.type === type);
}

// ── Render principal ──────────────────────────────────────────────────────────

export function renderAll() {
  const expenses     = getByMonth('expense');
  const incomes      = getByMonth('income');
  const prevYM       = offsetYM(currentYM, -1);
  const prevExpenses = getByMonth('expense', prevYM);
  const prevIncomes  = getByMonth('income',  prevYM);

  setText('monthLabel', ymLabel(currentYM));

  // Dashboard
  renderKPIs({ expenses, incomes, prevExpenses, prevIncomes });
  renderBalanceBar(expenses, incomes);
  renderMainChart(expenses, chartType);
  renderCatRows('catRowsMain', expenses);

  const recent = [...expenses, ...incomes]
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
    .slice(0, 6);
  renderTxList('recentTx', recent, { emptyMsg: 'Sin movimientos este mes' });

  // Gastos (con filtro por categoría)
  const catFilter   = document.getElementById('filterCatG')?.value || '';
  const filteredExp = expenses
    .filter(t => !catFilter || t.categoria === catFilter)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  renderTxList('gastosList', filteredExp, { showDelete: true, emptyMsg: 'Sin gastos este mes' });
  setText('gastosMeta',  filteredExp.length + ' resultado' + (filteredExp.length !== 1 ? 's' : ''));
  setText('gastosTotal', fmt(sumBy(filteredExp)));

  // Ingresos (con filtro por tipo)
  const incCatFilter = document.getElementById('filterCatI')?.value || '';
  const filteredInc  = incomes
    .filter(t => !incCatFilter || t.categoria === incCatFilter)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  renderTxList('ingresosList', filteredInc, { showDelete: true, emptyIcon: '💰', emptyMsg: 'Sin ingresos este mes' });
  setText('ingresosMeta',      filteredInc.length + ' resultado' + (filteredInc.length !== 1 ? 's' : ''));
  setText('ingresosTotalCard', fmt(sumBy(filteredInc)));

  // Estadísticas
  renderCatRows('statsCatRows', expenses);
  renderCatRows('statsIncRows', incomes);
  renderBarChart(expenses);
  renderLineChart(data.transactions, currentYM);
}

// ── Navegación ────────────────────────────────────────────────────────────────

function nav(id, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  if (btn) btn.classList.add('active');

  const meta = VIEW_META[id] || {};
  setText('viewTitle', meta.title || id);
  setText('viewSub',   meta.sub   || '');

  renderAll();
}

function changeMonth(delta) {
  currentYM = offsetYM(currentYM, delta);
  renderAll();
}

function toggleChart() {
  chartType = chartType === 'doughnut' ? 'bar' : 'doughnut';
  renderMainChart(getByMonth('expense'), chartType);
}

// ── Formulario de agregar ─────────────────────────────────────────────────────

function setType(type) {
  txType = type;
  applyFormType(type);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const monto = parseFloat(document.getElementById('inAmount').value);
  const fecha = document.getElementById('inDate').value;
  const desc  = document.getElementById('inDesc').value.trim();
  const cat   = txType === 'expense'
    ? document.getElementById('inCat').value
    : document.getElementById('inIncCat').value;

  if (!monto || monto <= 0 || !fecha || !desc || !cat) {
    showToast('⚠️ Completá todos los campos');
    return;
  }

  data.transactions.push({ id: Date.now(), type: txType, monto, fecha, categoria: cat, descripcion: desc });
  saveData(data);

  currentYM = fecha.slice(0, 7); // enfocar el mes del gasto recién agregado
  resetForm();
  renderAll();
  showToast(txType === 'expense' ? 'Gasto registrado ✓' : 'Ingreso registrado ✓');
  nav('dashboard', document.querySelector('[data-view=dashboard]'));
}

// ── Eliminar transacción ──────────────────────────────────────────────────────

function deleteTx(id) {
  const el = document.getElementById('tx-' + id);
  if (el) el.style.opacity = '0'; // animación de salida
  setTimeout(() => {
    data.transactions = data.transactions.filter(t => t.id !== id);
    saveData(data);
    renderAll();
  }, 180);
  showToast('Eliminado');
}

// ── Filtros ───────────────────────────────────────────────────────────────────

function clearFilters() {
  const g = document.getElementById('filterCatG');
  const i = document.getElementById('filterCatI');
  if (g) g.value = '';
  if (i) i.value = '';
  renderAll();
}

// ── Exportar CSV ──────────────────────────────────────────────────────────────

function exportCSV(type) {
  const list = type
    ? data.transactions.filter(t => t.type === type)
    : data.transactions;

  if (!list.length) { showToast('Sin datos para exportar'); return; }

  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
  const rows    = list.map(t => [t.fecha, t.type, t.categoria, `"${t.descripcion}"`, t.monto]);
  const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');

  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `finanzas_${currentYM}${type ? '_' + type : ''}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV exportado ✓');
}

// ── Modal de confirmación ─────────────────────────────────────────────────────

let modalCallback = null;

function openModal(title, body, onConfirm) {
  setText('modalTitle', title);
  setText('modalBody', body);
  modalCallback = onConfirm;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function askClearAll() {
  openModal(
    '¿Borrar todos los datos?',
    'Se eliminarán todos los movimientos registrados. Esta acción no se puede deshacer.',
    () => { data.transactions = []; saveData(data); renderAll(); showToast('Datos borrados'); }
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── Helpers DOM ───────────────────────────────────────────────────────────────

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── Event listeners ───────────────────────────────────────────────────────────

function setupListeners() {
  // Formulario
  document.getElementById('txForm').addEventListener('submit', handleFormSubmit);

  // Pickers de categoría (delegación de eventos)
  document.getElementById('catPicker').addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (chip) selectExpCat(chip.dataset.cat);
  });
  document.getElementById('incCatPicker').addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (chip) selectIncCat(chip.dataset.cat);
  });

  // Botones de eliminar en listas (delegación global)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-del[data-id]');
    if (btn) deleteTx(Number(btn.dataset.id));
  });

  // Filtros de categoría
  document.getElementById('filterCatG')?.addEventListener('change', renderAll);
  document.getElementById('filterCatI')?.addEventListener('change', renderAll);

  // Modal
  document.getElementById('modalOk').addEventListener('click', () => {
    closeModal();
    if (modalCallback) modalCallback();
  });
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

// ── Exponer funciones al HTML (llamadas desde atributos onclick) ──────────────

Object.assign(window, {
  nav,
  changeMonth,
  toggleChart,
  setType,
  clearFilters,
  exportCSV,
  askClearAll,
  closeModal,
});

// ── Inicialización ────────────────────────────────────────────────────────────

buildCatPickers();
applyFormType('expense');
document.getElementById('inDate').value = new Date().toISOString().split('T')[0];
setupListeners();
renderAll();
