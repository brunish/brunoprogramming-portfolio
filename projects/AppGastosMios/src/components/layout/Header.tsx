import { Moon, Sun, LayoutDashboard, Settings2, History } from 'lucide-react'
import { useStore } from '../../store'
import { monthKeyToLabel } from '../../utils/date'

export function Header() {
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)
  const activeView = useStore(s => s.activeView)
  const setActiveView = useStore(s => s.setActiveView)
  const activeMonthKey = useStore(s => s.activeMonthKey)

  const navItems = [
    { id: 'dashboard' as const, label: 'Inicio', icon: LayoutDashboard },
    { id: 'fixed' as const, label: 'Fijos', icon: Settings2 },
    { id: 'history' as const, label: 'Historial', icon: History },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Mis gastos
            </span>
            <span className="hidden sm:block text-xs text-neutral-400 capitalize">
              {monthKeyToLabel(activeMonthKey)}
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === id
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
