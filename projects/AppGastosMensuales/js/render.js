import { CAT_MAP } from './constants.js';
import { fmt, fmtDate, esc, sumBy, groupByCat } from './utils.js';

// ── KPI Cards ─────────────────────────────────────────────────────────────────

export function renderKPIs({ expenses, incomes, prevExpenses, prevIncomes }) {
  const totalExp = sumBy(expenses);
  const totalInc = sumBy(incomes);
  const balance  = totalInc - totalExp;
  const prevE    = sumBy(prevExpenses);
  const prevI    = sumBy(prevIncomes);

  // Balance (verde si positivo, rojo si negativo)
  const balCard = document.getElementById('kpiBalance');
  balCard.classList.toggle('negative', balance < 0);
  balCard.querySelector('.kpi-icon').textContent = balance >= 0 ? '✅' : '⚠️';
  setText('kBalVal', fmt(balance));
  document.getElementById('kBalVal').style.color = balance >= 0 ? 'var(--green)' : 'var(--red)';
  setText('kBalSub', balance >= 0 ? 'Estás en verde 🎉' : 'Gastos superiores a ingresos');

  // Ingresos
  setText('kIncVal', fmt(totalInc));
  setHTML('kIncSub', deltaHTML(totalInc, prevI) || `${incomes.length} ingreso${incomes.length !== 1 ? 's' : ''}`);

  // Gastos
  setText('kExpVal', fmt(totalExp));
  setHTML('kExpSub', deltaHTML(totalExp, prevE) || `${expenses.length} gasto${expenses.length !== 1 ? 's' : ''}`);

  // Conteo total
  const total = expenses.length + incomes.length;
  setText('kCountVal', String(total));
  setText('kCountSub', `${expenses.length} gasto${expenses.length !== 1 ? 's' : ''} · ${incomes.length} ingreso${incomes.length !== 1 ? 's' : ''}`);
}

// ── Barra de progreso ingresos vs gastos ──────────────────────────────────────

export function renderBalanceBar(expenses, incomes) {
  const totalExp  = sumBy(expenses);
  const totalInc  = sumBy(incomes);
  const remaining = totalInc - totalExp;
  const pct       = totalInc > 0 ? Math.max(0, Math.min(100, (remaining / totalInc) * 100)) : 0;

  document.getElementById('balBar').style.width = pct + '%';
  setText('barLabelExp', 'Gastos '   + fmt(totalExp));
  setText('barLabelInc', 'Ingresos ' + fmt(totalInc));

  const label = document.getElementById('balPct');
  if (totalInc > 0) {
    label.textContent  = remaining >= 0 ? 'Ahorrás ' + fmt(remaining) : 'Déficit ' + fmt(Math.abs(remaining));
    label.style.color  = remaining >= 0 ? 'var(--green)' : 'var(--red)';
  } else {
    label.textContent = '';
  }
}

// ── Barras de categorías ──────────────────────────────────────────────────────

export function renderCatRows(elementId, transactions) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const bc    = groupByCat(transactions);
  const total = sumBy(transactions);

  if (!total) {
    el.innerHTML = '<div style="color:var(--text3);font-size:.8rem;padding:4px 0">Sin datos este mes</div>';
    return;
  }

  el.innerHTML = Object.entries(bc)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => {
      const c   = CAT_MAP[cat] || { color: '#888', icon: '?' };
      const pct = Math.round((val / total) * 100);
      return `
        <div class="cat-row">
          <div class="cat-row-head">
            <div class="cat-name">${c.icon} ${cat}</div>
            <div class="cat-val" style="color:${c.color}">${fmt(val)}<span class="cat-pct">${pct}%</span></div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${c.color}"></div></div>
        </div>`;
    })
    .join('');
}

// ── Lista de transacciones ────────────────────────────────────────────────────

export function renderTxList(elementId, transactions, { showDelete = false, emptyIcon = '🧾', emptyMsg = 'Sin movimientos' } = {}) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (!transactions.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">${emptyIcon}</div>${emptyMsg}</div>`;
    return;
  }

  el.innerHTML = transactions.map(t => txHTML(t, showDelete)).join('');
}

// ── Privados ──────────────────────────────────────────────────────────────────

function txHTML(t, showDelete) {
  const c     = CAT_MAP[t.categoria] || { color: '#888', icon: t.type === 'income' ? '💰' : '💸' };
  const isInc = t.type === 'income';

  // Fondo del ícono mezclando el color de la categoría con blanco o verde claro
  const bgColor = isInc
    ? `color-mix(in srgb, ${c.color} 12%, #f0fdf4)`
    : `color-mix(in srgb, ${c.color} 10%, #fff)`;

  return `
    <div class="tx-item" id="tx-${t.id}">
      <div class="tx-icon" style="background:${bgColor}">${c.icon}</div>
      <div class="tx-body">
        <div class="tx-title">${esc(t.descripcion)}</div>
        <div class="tx-meta">${t.categoria} · ${fmtDate(t.fecha)}</div>
      </div>
      <div class="tx-amount ${isInc ? 'income' : 'expense'}">${isInc ? '+' : '−'}${fmt(t.monto)}</div>
      ${showDelete ? `<button class="btn-del" data-id="${t.id}">✕</button>` : ''}
    </div>`;
}

/** Genera el badge de delta (↑ +12% vs mes anterior) */
function deltaHTML(curr, prev) {
  if (!prev) return null;
  const pct   = Math.abs(((curr - prev) / prev) * 100).toFixed(0);
  const isUp  = curr > prev;
  const cls   = isUp ? 'delta-up' : 'delta-dn';
  const arrow = isUp ? '↑' : '↓';
  return `<span class="kpi-delta ${cls}">${arrow} ${pct}%</span> vs mes anterior`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
