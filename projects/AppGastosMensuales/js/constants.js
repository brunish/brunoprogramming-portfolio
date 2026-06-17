// Categorías de gastos
export const EXP_CATS = [
  { name: 'Comida',           icon: '🍔', color: '#ea580c' },
  { name: 'Transporte',       icon: '🚌', color: '#2563eb' },
  { name: 'Entretenimiento',  icon: '🎬', color: '#9333ea' },
  { name: 'Salud',            icon: '💊', color: '#059669' },
  { name: 'Ropa',             icon: '👕', color: '#db2777' },
  { name: 'Hogar',            icon: '🏠', color: '#ca8a04' },
  { name: 'Otros',            icon: '📦', color: '#475569' },
];

// Categorías de ingresos
export const INC_CATS = [
  { name: 'Sueldo',    icon: '💼', color: '#16a34a' },
  { name: 'Freelance', icon: '💻', color: '#0891b2' },
  { name: 'Inversión', icon: '📈', color: '#7c3aed' },
  { name: 'Regalo',    icon: '🎁', color: '#db2777' },
  { name: 'Otros',     icon: '💰', color: '#059669' },
];

// Mapa unificado para lookup rápido por nombre
export const CAT_MAP = Object.fromEntries(
  [...EXP_CATS, ...INC_CATS].map(c => [c.name, c])
);

// Metadata de cada vista (título y subtítulo en la topbar)
export const VIEW_META = {
  dashboard:    { title: 'Dashboard',     sub: 'Resumen del mes'         },
  agregar:      { title: 'Agregar',       sub: 'Registrá un movimiento'  },
  gastos:       { title: 'Gastos',        sub: 'Historial de egresos'    },
  ingresos:     { title: 'Ingresos',      sub: 'Historial de ingresos'   },
  estadisticas: { title: 'Estadísticas',  sub: 'Análisis detallado'      },
};
