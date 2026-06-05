import type { Activity, Difficulty, MealArrangement } from '../../../shared/types'

interface Props {
  difficulty: Difficulty | ''
  distanceAndDuration: string
  itinerary: string
  equipment: string
  transportation: string
  mealArrangement: MealArrangement | ''
  onChange: (field: keyof Activity, value: string) => void
}

export function SportsFields({
  difficulty, distanceAndDuration, itinerary, equipment, transportation, mealArrangement, onChange,
}: Props) {
  return (
    <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-blue-50/50">
      <h3 className="font-medium text-blue-800">🏃 运动详情</h3>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">难度</label>
        <select className="input-field" value={difficulty} onChange={(e) => onChange('difficulty', e.target.value)}>
          <option value="">请选择</option>
          <option value="easy">轻松</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">距离与时长</label>
        <input className="input-field" value={distanceAndDuration} onChange={(e) => onChange('distanceAndDuration', e.target.value)} placeholder="如：约 12km，4-5 小时" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">行程安排</label>
        <textarea className="input-field min-h-[80px]" value={itinerary} onChange={(e) => onChange('itinerary', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">装备要求</label>
        <input className="input-field" value={equipment} onChange={(e) => onChange('equipment', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">交通方式</label>
        <input className="input-field" value={transportation} onChange={(e) => onChange('transportation', e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">用餐安排</label>
        <select className="input-field" value={mealArrangement} onChange={(e) => onChange('mealArrangement', e.target.value)}>
          <option value="">请选择</option>
          <option value="self">自备</option>
          <option value="restaurant">餐厅</option>
          <option value="group">集体安排</option>
        </select>
      </div>
    </div>
  )
}
