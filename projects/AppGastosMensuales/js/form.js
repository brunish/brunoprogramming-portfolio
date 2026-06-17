import { EXP_CATS, INC_CATS } from './constants.js';

// ── Construir pickers de categorías ──────────────────────────────────────────

export function buildCatPickers() {
  document.getElementById('catPicker').innerHTML = EXP_CATS.map(c => `
    <div class="cat-chip" data-cat="${c.name}" style="color:${c.color}">
      <span class="cat-chip-emoji">${c.icon}</span>
      <span class="cat-chip-label">${c.name}</span>
    </div>`
  ).join('');

  document.getElementById('incCatPicker').innerHTML = INC_CATS.map(c => `
    <div class="income-cat-chip" data-cat="${c.name}">
      <span>${c.icon}</span><span>${c.name}</span>
    </div>`
  ).join('');
}

// ── Cambiar entre tipo Gasto / Ingreso ────────────────────────────────────────

export function applyFormType(type) {
  document.getElementById('typeExpense').classList.toggle('active', type === 'expense');
  document.getElementById('typeIncome').classList.toggle('active',  type === 'income');

  document.getElementById('catSection').style.display    = type === 'expense' ? '' : 'none';
  document.getElementById('incCatSection').style.display = type === 'income'  ? '' : 'none';

  const btn       = document.getElementById('submitBtn');
  btn.className   = `btn-submit ${type}`;
  btn.textContent = type === 'expense' ? 'Registrar gasto' : 'Registrar ingreso';

  document.getElementById('inDesc').placeholder =
    type === 'expense' ? 'Ej: Almuerzo, Uber…' : 'Ej: Sueldo de junio, Proyecto X…';
}

// ── Resetear el formulario después de guardar ─────────────────────────────────

export function resetForm() {
  document.getElementById('txForm').reset();
  document.getElementById('inDate').value = new Date().toISOString().split('T')[0];
  document.querySelectorAll('.cat-chip, .income-cat-chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('inCat').value    = '';
  document.getElementById('inIncCat').value = '';
}

// ── Selección de categoría (gastos) ──────────────────────────────────────────

export function selectExpCat(name) {
  document.querySelectorAll('#catPicker .cat-chip').forEach(c =>
    c.classList.toggle('selected', c.dataset.cat === name)
  );
  document.getElementById('inCat').value = name;
}

// ── Selección de categoría (ingresos) ────────────────────────────────────────

export function selectIncCat(name) {
  document.querySelectorAll('#incCatPicker .income-cat-chip').forEach(c =>
    c.classList.toggle('selected', c.dataset.cat === name)
  );
  document.getElementById('inIncCat').value = name;
}
