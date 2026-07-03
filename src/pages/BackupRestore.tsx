import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/useAuthStore'
import {
  createBackup, getBackupHistory, restoreFromHistory, deleteBackupFromHistory,
  exportBackupFile, importBackupFile, restoreFromBackup,
  getBackupInterval, setBackupInterval, startAutoBackup,
  type BackupMeta, type BackupData,
} from '../services/backup'
import { Database, Download, Upload, Trash2, RotateCcw, Clock, HardDrive, CheckCircle, AlertTriangle, Settings } from 'lucide-react'

export default function BackupRestore() {
  const { currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'
  const [history, setHistory] = useState<BackupMeta[]>([])
  const [interval, setInterval_] = useState(getBackupInterval())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [intervalInput, setIntervalInput] = useState(String(interval))
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)
  const [importData, setImportData] = useState<BackupData | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(getBackupHistory())
  }, [])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleManualBackup = () => {
    createBackup('手动备份', 'manual')
    setHistory(getBackupHistory())
    showToast('手动备份已创建', true)
  }

  const handleExport = () => {
    exportBackupFile()
    showToast('备份文件已下载', true)
  }

  const handleImportSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importBackupFile(file)
      setImportData(data)
    } catch (err) {
      showToast((err as Error).message, false)
    }
    e.target.value = ''
  }

  const handleImportConfirm = () => {
    if (!importData) return
    const ok = restoreFromBackup(importData)
    setImportData(null)
    if (ok) {
      createBackup('导入恢复前自动备份', 'auto')
      setHistory(getBackupHistory())
      showToast('数据恢复成功，请刷新页面查看最新数据', true)
    } else {
      showToast('数据恢复失败', false)
    }
  }

  const handleRestore = (id: string) => {
    createBackup('恢复前自动备份', 'auto')
    const ok = restoreFromHistory(id)
    setConfirmRestore(null)
    setHistory(getBackupHistory())
    if (ok) showToast('数据已恢复，请刷新页面查看最新数据', true)
    else showToast('恢复失败，备份数据不存在或已过期', false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定删除此备份记录？')) return
    deleteBackupFromHistory(id)
    setHistory(getBackupHistory())
  }

  const handleSaveInterval = () => {
    const h = Math.max(1, Math.min(720, Number(intervalInput) || 24))
    setBackupInterval(h)
    setInterval_(h)
    startAutoBackup()
    setSettingsOpen(false)
    showToast(`自动备份间隔已设为 ${h} 小时`, true)
  }

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <>
      <Header title="数据备份与恢复" subtitle="管理系统数据的自动备份与手动恢复" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {toast && (
          <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {toast.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {toast.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={handleManualBackup} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow text-left">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Database size={22} />
            </div>
            <h4 className="font-semibold text-gray-800">立即备份</h4>
            <p className="text-xs text-gray-500 mt-1">创建一个即时手动备份</p>
          </button>

          <button onClick={handleExport} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow text-left">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Download size={22} />
            </div>
            <h4 className="font-semibold text-gray-800">导出备份文件</h4>
            <p className="text-xs text-gray-500 mt-1">下载 JSON 备份文件到本地</p>
          </button>

          <button onClick={() => fileRef.current?.click()} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Upload size={22} />
            </div>
            <h4 className="font-semibold text-gray-800">从文件恢复</h4>
            <p className="text-xs text-gray-500 mt-1">上传 JSON 备份文件恢复数据</p>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportSelect} className="hidden" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" /> 自动备份设置
            </h3>
            {isAdmin && (
              <button onClick={() => { setIntervalInput(String(interval)); setSettingsOpen(true) }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <Settings size={14} /> 配置
              </button>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-gray-400" />
              <span className="text-gray-600">备份间隔：</span>
              <span className="font-semibold text-gray-800">{interval} 小时</span>
              <span className="text-gray-400">（{interval >= 24 ? `${(interval / 24).toFixed(interval % 24 === 0 ? 0 : 1)} 天` : `${interval} 小时`}）</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={16} className="text-gray-400" />
              <span className="text-gray-600">历史备份：</span>
              <span className="font-semibold text-gray-800">{history.length} 条</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">备份历史记录</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">时间</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">说明</th>
                  <th className="px-4 py-3 font-medium">大小</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtTime(m.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${m.type === 'auto' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {m.type === 'auto' ? '自动' : '手动'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.label}</td>
                    <td className="px-4 py-3 text-gray-500">{m.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setConfirmRestore(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="恢复此备份">
                          <RotateCcw size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="删除">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无备份记录</div>}
        </div>
      </div>

      {/* Restore confirm */}
      <Modal open={!!confirmRestore} onClose={() => setConfirmRestore(null)} title="确认恢复数据" width="max-w-sm">
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700">恢复操作将用备份数据覆盖当前所有数据。系统会在恢复前自动创建一份当前数据的备份。</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmRestore(null)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={() => confirmRestore && handleRestore(confirmRestore)} className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700">确认恢复</button>
          </div>
        </div>
      </Modal>

      {/* Import confirm */}
      <Modal open={!!importData} onClose={() => setImportData(null)} title="确认导入备份" width="max-w-sm">
        <div className="space-y-4 text-sm">
          {importData && (
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <p><span className="text-gray-500">备份时间：</span>{fmtTime(importData.timestamp)}</p>
              <p><span className="text-gray-500">案件数：</span>{(importData.data.cases as unknown[]).length}</p>
              <p><span className="text-gray-500">客户数：</span>{(importData.data.clients as unknown[]).length}</p>
              <p><span className="text-gray-500">律师数：</span>{(importData.data.lawyers as unknown[]).length}</p>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700">导入将覆盖当前所有数据，请确认文件来源可信。</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setImportData(null)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleImportConfirm} className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700">确认导入</button>
          </div>
        </div>
      </Modal>

      {/* Auto backup interval settings */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="自动备份设置" width="max-w-sm">
        <div className="space-y-4 text-sm">
          <p className="text-gray-500">设置自动备份的时间间隔（单位：小时）。设为 24 即每天备份一次。</p>
          <div>
            <label className="block text-gray-600 mb-1">备份间隔（小时）</label>
            <input type="number" min={1} max={720} value={intervalInput} onChange={(e) => setIntervalInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>常用设置：6小时 / 12小时 / 24小时（1天）/ 168小时（7天）</p>
            <p>当前设置：每 <span className="font-semibold text-gray-600">{interval}</span> 小时自动备份</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleSaveInterval} className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
