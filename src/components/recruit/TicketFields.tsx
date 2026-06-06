'use client'

import type { Activity, TicketMethod } from '../../../shared/types'

interface Props {
  ticketPrices: string
  ticketUrl: string
  ticketDeadline: string
  ticketMethod: TicketMethod | ''
  refundPolicy: string
  onChange: (field: keyof Activity, value: string) => void
}

export function TicketFields({ ticketPrices, ticketUrl, ticketDeadline, ticketMethod, refundPolicy, onChange }: Props) {
  return (
    <div className="space-y-4 border border-green-100 rounded-xl p-4 bg-green-50/50">
      <h3 className="font-medium text-green-800">🎫 购票信息</h3>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">票价说明</label>
        <input className="input-field" value={ticketPrices} onChange={(e) => onChange('ticketPrices', e.target.value)} placeholder="如：全价 15€，学生 10€" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">购票链接</label>
        <input className="input-field" value={ticketUrl} onChange={(e) => onChange('ticketUrl', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">购票截止</label>
        <input type="datetime-local" className="input-field" value={ticketDeadline} onChange={(e) => onChange('ticketDeadline', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">购票方式</label>
        <select className="input-field" value={ticketMethod} onChange={(e) => onChange('ticketMethod', e.target.value)}>
          <option value="">请选择</option>
          <option value="self">各自购买</option>
          <option value="group">统一代购</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">退改政策</label>
        <textarea className="input-field min-h-[60px]" value={refundPolicy} onChange={(e) => onChange('refundPolicy', e.target.value)} />
      </div>
    </div>
  )
}
