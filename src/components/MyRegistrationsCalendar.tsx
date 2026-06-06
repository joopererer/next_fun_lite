'use client'

import { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { DateClickArg } from '@fullcalendar/interaction'
import interactionPlugin from '@fullcalendar/interaction'
import type { ActivityWithCount, Registration } from '@/shared/types'
import { isEndedCancelled } from '@/src/lib/activityStatus'
import type { ActivityCategory } from '@/shared/types'
import { MyRegistrationCard } from '@/src/components/MyRegistrationCard'

const categoryColors: Record<ActivityCategory, string> = {
  board_game: '#818cf8',
  sports: '#34d399',
  culture: '#fbbf24',
  dining: '#fb923c',
  escape_room: '#f472b6',
  other: '#94a3b8',
}

interface Props {
  activities: ActivityWithCount[]
  registrations: Map<string, Registration>
  onCancel?: () => void
}

export function MyRegistrationsCalendar({ activities, registrations, onCancel }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const events = activities
    .filter((a) => a.date)
    .map((a) => {
      const reg = registrations.get(a.id)
      const cancelled = isEndedCancelled(a.status) || Boolean(reg?.cancelledAt)
      return {
        id: a.id,
        title: a.title,
        date: a.date!.slice(0, 10),
        backgroundColor: categoryColors[a.category] ?? categoryColors.other,
        borderColor: 'transparent',
        textColor: cancelled ? '#9ca3af' : '#ffffff',
        extendedProps: { cancelled },
      }
    })

  const selectedActivities = useMemo(() => {
    if (!selectedDate) return []
    return activities.filter((a) => a.date?.slice(0, 10) === selectedDate)
  }, [activities, selectedDate])

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.dateStr)
  }

  return (
    <div className="my-registrations-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="zh-cn"
        events={events}
        dateClick={handleDateClick}
        eventClick={(info) => {
          setSelectedDate(info.event.startStr.slice(0, 10))
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="auto"
        eventContent={(arg) => (
          <div
            className="px-1 text-xs truncate w-full"
            style={{
              textDecoration: arg.event.extendedProps.cancelled ? 'line-through' : undefined,
            }}
          >
            {arg.event.title}
          </div>
        )}
      />

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {selectedDate} 的活动
          </h3>
          {selectedActivities.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">当天没有报名活动</p>
          ) : (
            <div className="space-y-3">
              {selectedActivities.map((a) => (
                <MyRegistrationCard
                  key={a.id}
                  activity={a}
                  registration={registrations.get(a.id)}
                  onCancel={onCancel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
