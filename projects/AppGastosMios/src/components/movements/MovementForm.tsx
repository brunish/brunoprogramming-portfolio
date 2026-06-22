import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useStore } from '../../store'
import { nowISO } from '../../utils/date'
import type { MovementType } from '../../types'

const CATEGORIES = {
  expense: ['Comida', 'Transporte', 'Salud', 'Entretenimiento', 'Ropa', 'Hogar', 'Servicios', 'Otro'],
  income: ['Sueldo', 'Freelance', 'Venta', 'Regalo', 'Inversión', 'Otro'],
}

interface MovementFormProps {
  type: MovementType
  onClose: () => void
}

export function MovementForm({ type, onClose }: MovementFormProps) {
  const addMovement = useStore(s => s.addMovement)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!amount || Number(amount) <= 0) next.amount = 'Ingresá un monto válido'
    if (!description.trim()) next.description = 'La descripción es obligatoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    addMovement({
      type,
      amount: Number(amount),
      description: description.trim(),
      category: category || undefined,
      date: nowISO(),
    })
    onClose()
  }

  const isIncome = type === 'income'
  const accentClass = isIncome ? 'focus:ring-emerald-200 focus:border-emerald-400' : 'focus:ring-rose-200 focus:border-rose-400'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="amount"
        label="Monto ($)"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        error={errors.amount}
        className={accentClass}
        autoFocus
      />
      <Input
        id="description"
        label="Descripción"
        type="text"
        placeholder={isIncome ? 'Ej: Sueldo de junio' : 'Ej: Supermercado'}
        value={description}
        onChange={e => setDescription(e.target.value)}
        error={errors.description}
        className={accentClass}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Categoría (opcional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES[type].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? isIncome
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={isIncome ? 'income' : 'expense'}
          className="flex-1 justify-center"
        >
          Agregar {isIncome ? 'ingreso' : 'gasto'}
        </Button>
      </div>
    </form>
  )
}
