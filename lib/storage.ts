import { ExamState } from '@/types/exam'

const STORAGE_KEY = 'nursing-exam'

export function saveState(state: ExamState) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  )
}

export function loadState(): ExamState | null {
  if (typeof window === 'undefined') return null

  const data = localStorage.getItem(STORAGE_KEY)

  if (!data) return null

  return JSON.parse(data)
}

export function clearState() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY)
}