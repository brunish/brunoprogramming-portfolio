// ── LocalStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'finanzas_v3';

export function loadData() {
  const raw  = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : { transactions: [] };
  if (!data.transactions) data.transactions = []; // migración de formato viejo
  return data;
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Fechas ────────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_LONG  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/** Devuelve el año-mes actual en formato "YYYY-MM" */
export function todayYM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "2025-06" → "Junio 2025" */
export function ymLabel(ym) {
  const [y, m] = ym.split('-');
  return `${MONTHS_LONG[+m - 1]} ${y}`;
}

/** Suma o resta meses a un "YYYY-MM": offsetYM("2025-01", -1) → "2024-12" */
export function offsetYM(ym, months) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "2025-06-15" → "15 jun" */
export function fmtDate(str) {
  const [, m, d] = str.split('-');
  return `${+d} ${MONTHS_SHORT[+m - 1]}`;
}

// ── Formato de números ────────────────────────────────────────────────────────

/** 1234.5 → "$1.234,50" */
export function fmt(n) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Helpers de datos ──────────────────────────────────────────────────────────

export function sumBy(list) {
  return list.reduce((sum, t) => sum + t.monto, 0);
}

/** Agrupa una lista de transacciones por categoría: { Comida: 1200, ... } */
export function groupByCat(list) {
  return list.reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.monto;
    return acc;
  }, {});
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

export function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
