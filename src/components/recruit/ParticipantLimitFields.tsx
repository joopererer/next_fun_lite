'use client'

import {
  DEFAULT_MAX_PARTICIPANTS,
  DEFAULT_MIN_PARTICIPANTS,
  PARTICIPANT_INPUT_MAX,
  PARTICIPANT_INPUT_MIN,
  clampParticipantInput,
} from '../../lib/participants'

interface Props {
  min: string
  max: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}

export function ParticipantLimitFields({ min, max, onMinChange, onMaxChange }: Props) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">人数限制（选填）</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">最少</label>
          <input
            type="number"
            inputMode="numeric"
            className="input-field text-sm"
            min={PARTICIPANT_INPUT_MIN}
            max={PARTICIPANT_INPUT_MAX}
            placeholder={String(DEFAULT_MIN_PARTICIPANTS)}
            value={min}
            onChange={(e) => onMinChange(clampParticipantInput(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">最多</label>
          <input
            type="number"
            inputMode="numeric"
            className="input-field text-sm"
            min={PARTICIPANT_INPUT_MIN}
            max={PARTICIPANT_INPUT_MAX}
            placeholder={String(DEFAULT_MAX_PARTICIPANTS)}
            value={max}
            onChange={(e) => onMaxChange(clampParticipantInput(e.target.value))}
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        填写 0–{PARTICIPANT_INPUT_MAX} 的整数；留空则默认最少 {DEFAULT_MIN_PARTICIPANTS} 人、最多 {DEFAULT_MAX_PARTICIPANTS} 人；最多填 0 表示不限
      </p>
    </div>
  )
}
