'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import type { Activity } from '../../../shared/types'
import { buildImportPreview, type ImportPreviewResult, type ParsedImportRow } from '../../../shared/excelImport'
import { api } from '../../lib/api'
import { getCategoryLabel } from '../../lib/categories'
import { formatListDate } from '../../lib/user'
import { getStatusLabel } from '../../lib/activityStatus'

interface Props {
  activities: Activity[]
  onImported: () => void
}

type Step = 'upload' | 'preview' | 'done'

export function ImportTab({ activities, onImported }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    imported: number
    registrationsCreated: number
    skipped: number
    failed: Array<{ title: string; error: string }>
  } | null>(null)
  const [showTable, setShowTable] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
    const built = buildImportPreview(matrix as unknown[][], activities)
    setPreview(built)
    setStep('preview')
  }, [activities])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const confirmImport = async () => {
    if (!preview) return
    const rows: ParsedImportRow[] = [...preview.importable, ...preview.warnings]
    setImporting(true)
    try {
      const res = await api.adminImport(rows)
      setResult(res)
      setStep('done')
      onImported()
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败')
    } finally {
      setImporting(false)
    }
  }

  if (step === 'done' && result) {
    return (
      <div className="max-w-lg">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold mb-4">导入完成</h3>
        <ul className="text-sm text-gray-700 space-y-2 mb-6">
          <li>成功导入：{result.imported} 条活动</li>
          <li>创建报名记录：{result.registrationsCreated} 条</li>
          <li>跳过：{result.skipped} 条</li>
          {result.failed.length > 0 && (
            <li className="text-red-600">
              失败：{result.failed.length} 条
              <ul className="mt-1 pl-4 list-disc">
                {result.failed.map((f) => (
                  <li key={f.title}>{f.title}: {f.error}</li>
                ))}
              </ul>
            </li>
          )}
        </ul>
        <Link href="/admin?tab=kanban" className="btn-primary">前往看板查看</Link>
      </div>
    )
  }

  if (step === 'preview' && preview) {
    const allRows = [...preview.importable, ...preview.warnings, ...preview.skipped]
    const total = allRows.length
    return (
      <div>
        <h3 className="font-semibold mb-2">解析结果预览（共 {total} 条）</h3>
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <span className="text-green-700">✅ 可导入 {preview.importable.length} 条</span>
          <span className="text-amber-700">⚠️ 需确认 {preview.warnings.length} 条</span>
          <span className="text-gray-500">❌ 将跳过 {preview.skipped.length} 条</span>
        </div>
        <button type="button" className="text-sm text-green-600 mb-3" onClick={() => setShowTable(!showTable)}>
          {showTable ? '收起预览表格' : '展开预览表格'}
        </button>
        {showTable && (
          <div className="overflow-x-auto mb-6 border rounded-xl">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="p-2">标题</th>
                  <th className="p-2">日期</th>
                  <th className="p-2">类型</th>
                  <th className="p-2">状态</th>
                  <th className="p-2">报名</th>
                  <th className="p-2">备注</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((r, i) => (
                  <tr key={`${r.title}-${i}`} className="border-b border-gray-50">
                    <td className="p-2">{r.title}</td>
                    <td className="p-2 whitespace-nowrap">{formatListDate(r.date)}</td>
                    <td className="p-2">{getCategoryLabel(r.category)}</td>
                    <td className="p-2">{getStatusLabel(r.status)}</td>
                    <td className="p-2">{r.members.length}人</td>
                    <td className="p-2 text-xs text-gray-500">{r.warning ?? r.skipReason ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={confirmImport} disabled={importing || (preview.importable.length + preview.warnings.length === 0)}>
            {importing ? '导入中...' : '确认导入'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setStep('upload'); setPreview(null) }}>
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h3 className="font-semibold mb-2">📥 导入活动数据</h3>
      <p className="text-sm text-gray-500 mb-4">支持格式：.xlsx / .xls / .csv</p>
      <div
        className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center mb-6 hover:border-green-300 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <p className="text-gray-500 mb-4">拖拽文件到此处，或点击选择文件</p>
        <label className="btn-primary cursor-pointer inline-block">
          选择文件
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      </div>
      <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
        <li>请使用与 Next Fun 活动表格相同的列格式</li>
        <li>「任何想法」列将被忽略</li>
        <li>报名成员将自动拆分为独立报名记录</li>
        <li>已存在相同标题+日期的活动将跳过（不覆盖）</li>
        <li>建议先用少量数据测试</li>
      </ul>
    </div>
  )
}
