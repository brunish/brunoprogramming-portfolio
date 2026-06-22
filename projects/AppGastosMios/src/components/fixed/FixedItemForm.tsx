import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useStore } from '../../store'
import type { FixedItem, MovementType } from '../../types'

interface FixedItemFormProps {
  onClose: () => void
  editing?: FixedItem
}

export function FixedItemForm({ onClose, editing }: FixedItemFormProps) {
  const addFixedItem = useStore(s => s.addFixedItem)
  const editFixedItem = useStore(s => s.editFixedItem)

  const [type, setType] = useState<MovementType>(editing?.type ?? 'expense')
  const [name, setName] = useState(editing?.name ?? '')
  const [amount, setAmount] = useState(editing?.amount?.toString() ?? '')
  const [dayOfMonth, setDayOfMonth] = useState(editing?.dayOfMonth?.toString() ?? '')
  const [category, setCategory] = useState(editing?.category ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'El nombre es obligatorio'
    if (!amount || Number(amount) <= 0) next.amount = 'Ingresá un monto válido'
    if (dayOfMonth && (Number(dayOfMonth) < 1 || Number(dayOfMonth) > 31))
      next.dayOfMonth = 'Debe ser un día entre 1 y 31'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const data = {
      type,
      name: name.trim(),
      amount: Number(amount),
      dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
      category: category.trim() || undefined,
      paused: false,
    }
    if (editing) {
      editFixedItem(editing.id, data)
    } else {
      addFixedItem(data)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['expense', 'income'] as MovementType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              type === t
                ? t === 'expense'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            {t === 'expense' ? 'Gasto fijo' : 'Ingreso fijo'}
          </button>
        ))}
      </div>

      <Input
        id="name"
        label="Nombre"
        type="text"
        placeholder="Ej: Alquiler"
        value={name}
        onChange={e => setName(e.target.value)}
        error={errors.name}
        autoFocus
      />
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
      />
      <Input
        id="dayOfMonth"
        label="Día del mes (opcional)"
        type="number"
        min="1"
        max="31"
        placeholder="Ej: 10"
        value={dayOfMonth}
        onChange={e => setDayOfMonth(e.target.value)}
        error={errors.dayOfMonth}
      />
      <Input
        id="category"
        label="Categoría (opcional)"
        type="text"
        placeholder="Ej: Vivienda"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={type === 'income' ? 'income' : 'expense'}
          className="flex-1 justify-center"
        >
          {editing ? 'Guardar cambios' : 'Agregar'}
        </Button>
      </div>
    </form>
  )
}
