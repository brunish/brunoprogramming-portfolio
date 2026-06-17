import { Utensils, Car, Home, Film, Tag } from 'lucide-react'

export const CATEGORIES = [
  { id: 'food',          label: 'Comida',      icon: Utensils, color: '#ff9f57' },
  { id: 'transport',     label: 'Transporte',  icon: Car,      color: '#57c8ff' },
  { id: 'accommodation', label: 'Alojamiento', icon: Home,     color: '#b8ff57' },
  { id: 'entertainment', label: 'Entretenim.', icon: Film,     color: '#c457ff' },
  { id: 'other',         label: 'Otro',        icon: Tag,      color: '#ff5782' },
]

export const AVATAR_COLORS = [
  '#b8ff57', '#57c8ff', '#ff9f57', '#c457ff', '#ff5782',
  '#57ffb8', '#ffdb57', '#ff57c8', '#57a0ff', '#ff7a57',
]

export const GROUP_EMOJIS = ['✈️', '🏖️', '🏔️', '🎉', '🍕', '🏠', '🚗', '🎮', '🎵', '💼', '🌍', '🎓']

export const STORAGE_KEY = 'splitr_v1'

export const DEMO_GROUP = {
  id: 'g1',
  name: 'Viaje a Bariloche',
  emoji: '🏔️',
  settledPayments: [],
  participants: [
    { id: 'p1', name: 'Ana',    color: AVATAR_COLORS[0] },
    { id: 'p2', name: 'Carlos', color: AVATAR_COLORS[1] },
    { id: 'p3', name: 'Lucía',  color: AVATAR_COLORS[2] },
    { id: 'p4', name: 'Martín', color: AVATAR_COLORS[3] },
  ],
  expenses: [
    { id: 'e1', description: 'Hotel',            amount: 1200, paidBy: 'p1', splitBetween: ['p1', 'p2', 'p3', 'p4'], date: '2024-03-15', category: 'accommodation' },
    { id: 'e2', description: 'Cena del viernes', amount: 480,  paidBy: 'p2', splitBetween: ['p1', 'p2', 'p3', 'p4'], date: '2024-03-15', category: 'food' },
    { id: 'e3', description: 'Nafta ida',         amount: 320,  paidBy: 'p3', splitBetween: ['p1', 'p2', 'p3'],       date: '2024-03-16', category: 'transport' },
    { id: 'e4', description: 'Entradas cine',     amount: 150,  paidBy: 'p4', splitBetween: ['p4', 'p1'],             date: '2024-03-16', category: 'entertainment' },
    { id: 'e5', description: 'Desayunos',         amount: 200,  paidBy: 'p1', splitBetween: ['p1', 'p2', 'p3', 'p4'], date: '2024-03-17', category: 'food' },
  ],
}
