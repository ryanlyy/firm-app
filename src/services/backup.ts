import { useStore } from '../store/useStore'

const BACKUP_KEY = 'yungen_backup_data'
const BACKUP_HISTORY_KEY = 'yungen_backup_history'
const BACKUP_INTERVAL_KEY = 'yungen_backup_interval'
const AUTO_BACKUP_PREFIX = 'yungen_auto_'

export interface BackupMeta {
  id: string
  timestamp: string
  label: string
  type: 'auto' | 'manual'
  size: string
}

export interface BackupData {
  version: '1.0'
  timestamp: string
  data: {
    clients: unknown[]
    lawyers: unknown[]
    cases: unknown[]
    invoices: unknown[]
    events: unknown[]
    documents: unknown[]
  }
}

function getDataSnapshot(): BackupData['data'] {
  const s = useStore.getState()
  return {
    clients: s.clients,
    lawyers: s.lawyers,
    cases: s.cases,
    invoices: s.invoices,
    events: s.events,
    documents: s.documents,
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getBackupInterval(): number {
  const stored = localStorage.getItem(BACKUP_INTERVAL_KEY)
  return stored ? Number(stored) : 24
}

export function setBackupInterval(hours: number): void {
  localStorage.setItem(BACKUP_INTERVAL_KEY, String(hours))
}

export function getBackupHistory(): BackupMeta[] {
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBackupHistory(history: BackupMeta[]): void {
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history))
}

export function createBackup(label: string, type: 'auto' | 'manual'): BackupMeta {
  const now = new Date()
  const id = `${type}_${now.getTime()}`
  const timestamp = now.toISOString()

  const backup: BackupData = {
    version: '1.0',
    timestamp,
    data: getDataSnapshot(),
  }

  const json = JSON.stringify(backup)
  const storageKey = `${AUTO_BACKUP_PREFIX}${id}`
  localStorage.setItem(storageKey, json)

  // Also keep latest in primary key
  localStorage.setItem(BACKUP_KEY, json)

  const meta: BackupMeta = {
    id,
    timestamp,
    label,
    type,
    size: formatSize(new TextEncoder().encode(json).length),
  }

  const history = getBackupHistory()
  history.unshift(meta)
  // Keep max 30 records in history
  const trimmed = history.slice(0, 30)
  saveBackupHistory(trimmed)

  // Only keep data for the 10 most recent backups in localStorage
  const toKeep = new Set(trimmed.slice(0, 10).map((m) => `${AUTO_BACKUP_PREFIX}${m.id}`))
  trimmed.forEach((m) => {
    const key = `${AUTO_BACKUP_PREFIX}${m.id}`
    if (!toKeep.has(key)) {
      localStorage.removeItem(key)
    }
  })

  return meta
}

export function restoreFromBackup(backup: BackupData): boolean {
  try {
    const store = useStore.getState()
    const d = backup.data
    useStore.setState({
      clients: d.clients as typeof store.clients,
      lawyers: d.lawyers as typeof store.lawyers,
      cases: d.cases as typeof store.cases,
      invoices: d.invoices as typeof store.invoices,
      events: d.events as typeof store.events,
      documents: d.documents as typeof store.documents,
    })
    return true
  } catch {
    return false
  }
}

export function restoreFromHistory(id: string): boolean {
  const key = `${AUTO_BACKUP_PREFIX}${id}`
  const raw = localStorage.getItem(key)
  if (!raw) return false
  try {
    const backup: BackupData = JSON.parse(raw)
    return restoreFromBackup(backup)
  } catch {
    return false
  }
}

export function deleteBackupFromHistory(id: string): void {
  const key = `${AUTO_BACKUP_PREFIX}${id}`
  localStorage.removeItem(key)
  const history = getBackupHistory().filter((m) => m.id !== id)
  saveBackupHistory(history)
}

export function exportBackupFile(): void {
  const backup: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: getDataSnapshot(),
  }
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.href = url
  a.download = `云根律所_数据备份_${dateStr}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup: BackupData = JSON.parse(reader.result as string)
        if (!backup.version || !backup.data) {
          reject(new Error('无效的备份文件格式'))
          return
        }
        resolve(backup)
      } catch {
        reject(new Error('文件解析失败，请检查文件格式'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

let autoBackupTimer: ReturnType<typeof setInterval> | null = null

export function startAutoBackup(): void {
  stopAutoBackup()
  const intervalHours = getBackupInterval()
  const intervalMs = intervalHours * 60 * 60 * 1000

  // Initial backup on start
  createBackup('自动备份', 'auto')

  autoBackupTimer = setInterval(() => {
    createBackup('自动备份', 'auto')
  }, intervalMs)
}

export function stopAutoBackup(): void {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer)
    autoBackupTimer = null
  }
}
