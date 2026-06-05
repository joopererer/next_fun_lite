import type { Activity, ReservationMethod } from '../../../shared/types'

interface Props {
  restaurantAddress: string
  perPersonCost: string
  reservationMethod: ReservationMethod | ''
  requiresDeposit: boolean
  onChange: (field: keyof Activity, value: string | boolean) => void
}

export function DiningFields({
  restaurantAddress, perPersonCost, reservationMethod, requiresDeposit, onChange,
}: Props) {
  return (
    <div className="space-y-4 border border-orange-100 rounded-xl p-4 bg-orange-50/50">
      <h3 className="font-medium text-orange-800">🍜 聚餐详情</h3>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">餐厅地址</label>
        <input className="input-field" value={restaurantAddress} onChange={(e) => onChange('restaurantAddress', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">人均消费</label>
        <input className="input-field" value={perPersonCost} onChange={(e) => onChange('perPersonCost', e.target.value)} placeholder="如：25-35€" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">订位方式</label>
        <select className="input-field" value={reservationMethod} onChange={(e) => onChange('reservationMethod', e.target.value)}>
          <option value="">请选择</option>
          <option value="organizer">发起人订位</option>
          <option value="self">各自订位</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requiresDeposit"
          checked={requiresDeposit}
          onChange={(e) => onChange('requiresDeposit', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="requiresDeposit" className="text-sm text-gray-600">需要预付定金</label>
      </div>
    </div>
  )
}
