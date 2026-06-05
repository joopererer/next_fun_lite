import { google } from 'googleapis'
import { nanoid } from 'nanoid'
import type { Activity, ActivityCategory, EnvConfig, Interest, Registration } from '../../shared/types'
import type { InterestMutationResult, RegistrationMutationResult, StorageAdapter } from './types'

const ACTIVITY_HEADERS = [
  'id', 'title', 'description', 'date', 'location', 'max_participants', 'min_participants',
  'fee', 'notes', 'organizer_name', 'organizer_wechat', 'source_url',
  'category', 'status', 'interested_count', 'created_at',
  'fee_level', 'ticket_prices', 'ticket_url', 'ticket_deadline', 'ticket_method', 'refund_policy',
  'difficulty', 'distance_and_duration', 'itinerary', 'equipment', 'transportation', 'meal_arrangement',
  'restaurant_address', 'per_person_cost', 'reservation_method', 'requires_deposit',
  'recap', 'recap_images',
] as const

const REGISTRATION_HEADERS = [
  'id', 'activity_id', 'name', 'wechat', 'participant_count', 'note', 'registered_at',
] as const

const INTEREST_HEADERS = ['id', 'activity_id', 'name', 'wechat', 'created_at'] as const

function rowToObject<T extends Record<string, string>>(headers: readonly string[], row: string[]): T {
  const obj: Record<string, string> = {}
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? ''
  })
  return obj as T
}

function activityFromRow(row: string[]): Activity {
  const r = rowToObject<Record<(typeof ACTIVITY_HEADERS)[number], string>>(ACTIVITY_HEADERS, row)
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date || null,
    location: r.location,
    maxParticipants: r.max_participants ? parseInt(r.max_participants, 10) : null,
    minParticipants: r.min_participants ? parseInt(r.min_participants, 10) : undefined,
    fee: r.fee,
    notes: r.notes,
    organizerName: r.organizer_name,
    organizerWechat: r.organizer_wechat,
    sourceUrl: r.source_url,
    status: r.status as Activity['status'],
    category: (r.category as ActivityCategory) || 'other',
    interestedCount: parseInt(r.interested_count, 10) || 0,
    createdAt: r.created_at,
    feeLevel: (r.fee_level as Activity['feeLevel']) || undefined,
    ticketPrices: r.ticket_prices || undefined,
    ticketUrl: r.ticket_url || undefined,
    ticketDeadline: r.ticket_deadline || undefined,
    ticketMethod: (r.ticket_method as Activity['ticketMethod']) || undefined,
    refundPolicy: r.refund_policy || undefined,
    difficulty: (r.difficulty as Activity['difficulty']) || undefined,
    distanceAndDuration: r.distance_and_duration || undefined,
    itinerary: r.itinerary || undefined,
    equipment: r.equipment || undefined,
    transportation: r.transportation || undefined,
    mealArrangement: (r.meal_arrangement as Activity['mealArrangement']) || undefined,
    restaurantAddress: r.restaurant_address || undefined,
    perPersonCost: r.per_person_cost || undefined,
    reservationMethod: (r.reservation_method as Activity['reservationMethod']) || undefined,
    requiresDeposit: r.requires_deposit === 'true' ? true : r.requires_deposit === 'false' ? false : undefined,
    recap: r.recap || undefined,
    recapImages: r.recap_images || undefined,
  }
}

function activityToRow(a: Activity): string[] {
  return [
    a.id, a.title, a.description, a.date ?? '', a.location,
    a.maxParticipants?.toString() ?? '', a.minParticipants?.toString() ?? '', a.fee, a.notes,
    a.organizerName, a.organizerWechat, a.sourceUrl, a.category, a.status,
    a.interestedCount.toString(), a.createdAt,
    a.feeLevel ?? '', a.ticketPrices ?? '', a.ticketUrl ?? '', a.ticketDeadline ?? '',
    a.ticketMethod ?? '', a.refundPolicy ?? '',
    a.difficulty ?? '', a.distanceAndDuration ?? '', a.itinerary ?? '', a.equipment ?? '',
    a.transportation ?? '', a.mealArrangement ?? '',
    a.restaurantAddress ?? '', a.perPersonCost ?? '', a.reservationMethod ?? '',
    a.requiresDeposit === true ? 'true' : a.requiresDeposit === false ? 'false' : '',
    a.recap ?? '', a.recapImages ?? '',
  ]
}

function registrationFromRow(row: string[]): Registration {
  const r = rowToObject<Record<(typeof REGISTRATION_HEADERS)[number], string>>(REGISTRATION_HEADERS, row)
  return {
    id: r.id,
    activityId: r.activity_id,
    name: r.name,
    wechat: r.wechat,
    participantCount: parseInt(r.participant_count, 10) || 1,
    note: r.note,
    registeredAt: r.registered_at,
  }
}

function registrationToRow(r: Registration): string[] {
  return [r.id, r.activityId, r.name, r.wechat, r.participantCount.toString(), r.note, r.registeredAt]
}

function interestFromRow(row: string[]): Interest {
  const r = rowToObject<Record<(typeof INTEREST_HEADERS)[number], string>>(INTEREST_HEADERS, row)
  return {
    id: r.id,
    activityId: r.activity_id,
    name: r.name,
    wechat: r.wechat,
    createdAt: r.created_at,
  }
}

function interestToRow(i: Interest): string[] {
  return [i.id, i.activityId, i.name, i.wechat, i.createdAt]
}

export class GoogleSheetsAdapter implements StorageAdapter {
  private sheets
  private spreadsheetId: string

  constructor(env?: EnvConfig) {
    const jsonStr = env?.GOOGLE_SERVICE_ACCOUNT_JSON ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    const sheetId = env?.GOOGLE_SHEETS_ID ?? process.env.GOOGLE_SHEETS_ID

    if (!jsonStr || !sheetId) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SHEETS_ID are required')
    }

    const credentials = JSON.parse(jsonStr)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
    this.spreadsheetId = sheetId
  }

  private async getSheetRows(sheetName: string): Promise<string[][]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
    })
    const rows = res.data.values ?? []
    return rows.slice(1)
  }

  private async appendRow(sheetName: string, row: string[]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  }

  private async updateRowById(sheetName: string, id: string, row: string[], idCol = 0): Promise<void> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
    })
    const allRows = res.data.values ?? []
    const idx = allRows.findIndex((r, i) => i > 0 && r[idCol] === id)
    if (idx === -1) throw new Error('Row not found')
    const range = `${sheetName}!A${idx + 1}:O${idx + 1}`
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  }

  private async deleteRowById(sheetName: string, id: string): Promise<void> {
    const meta = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId })
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName)
    if (!sheet?.properties?.sheetId) throw new Error('Sheet not found')

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:A`,
    })
    const rows = res.data.values ?? []
    const idx = rows.findIndex((r, i) => i > 0 && r[0] === id)
    if (idx === -1) return

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: idx,
              endIndex: idx + 1,
            },
          },
        }],
      },
    })
  }

  async getActivities(): Promise<Activity[]> {
    const rows = await this.getSheetRows('activities')
    return rows.filter((r) => r[0]).map(activityFromRow).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getActivity(id: string): Promise<Activity | null> {
    const rows = await this.getSheetRows('activities')
    const row = rows.find((r) => r[0] === id)
    return row ? activityFromRow(row) : null
  }

  async createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const activity: Activity = {
      ...data,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
    }
    await this.appendRow('activities', activityToRow(activity))
    return activity
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const existing = await this.getActivity(id)
    if (!existing) throw new Error('Activity not found')
    const updated = { ...existing, ...data, id }
    await this.updateRowById('activities', id, activityToRow(updated))
    return updated
  }

  async deleteActivity(id: string): Promise<void> {
    await this.deleteRowById('activities', id)
    const regs = await this.getSheetRows('registrations')
    for (const r of regs.filter((row) => row[1] === id)) {
      if (r[0]) await this.deleteRowById('registrations', r[0])
    }
    const ints = await this.getSheetRows('interests')
    for (const r of ints.filter((row) => row[1] === id)) {
      if (r[0]) await this.deleteRowById('interests', r[0])
    }
  }

  async getRegistrations(activityId: string): Promise<Registration[]> {
    const rows = await this.getSheetRows('registrations')
    return rows
      .filter((r) => r[1] === activityId)
      .map(registrationFromRow)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())
  }

  async findRegistration(activityId: string, wechat: string): Promise<Registration | null> {
    const rows = await this.getSheetRows('registrations')
    const row = rows.find((r) => r[1] === activityId && r[3] === wechat)
    return row ? registrationFromRow(row) : null
  }

  private async countRegistrations(activityId: string): Promise<number> {
    const registrations = await this.getRegistrations(activityId)
    return registrations.reduce((sum, r) => sum + r.participantCount, 0)
  }

  async createRegistration(data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration> {
    const registration: Registration = {
      ...data,
      id: nanoid(8),
      registeredAt: new Date().toISOString(),
    }
    await this.appendRow('registrations', registrationToRow(registration))
    return registration
  }

  async deleteRegistration(activityId: string, wechat: string): Promise<RegistrationMutationResult> {
    const rows = await this.getSheetRows('registrations')
    const row = rows.find((r) => r[1] === activityId && r[3] === wechat)
    if (!row?.[0]) {
      return { registration: undefined, registeredCount: await this.countRegistrations(activityId) }
    }
    await this.deleteRowById('registrations', row[0])
    const registration = registrationFromRow(row)
    return { registration, registeredCount: await this.countRegistrations(activityId) }
  }

  async getInterests(activityId: string): Promise<Interest[]> {
    const rows = await this.getSheetRows('interests')
    return rows.filter((r) => r[1] === activityId).map(interestFromRow)
  }

  async findInterest(activityId: string, wechat: string): Promise<Interest | null> {
    const rows = await this.getSheetRows('interests')
    const row = rows.find((r) => r[1] === activityId && r[3] === wechat)
    return row ? interestFromRow(row) : null
  }

  private async syncInterestedCount(activityId: string): Promise<number> {
    const interests = await this.getInterests(activityId)
    const count = interests.length
    await this.updateActivity(activityId, { interestedCount: count })
    return count
  }

  async createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> {
    const existing = await this.findInterest(data.activityId, data.wechat)
    if (existing) {
      return { interest: existing, interestedCount: (await this.getActivity(data.activityId))?.interestedCount ?? 0 }
    }
    const interest: Interest = {
      ...data,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
    }
    await this.appendRow('interests', interestToRow(interest))
    const interestedCount = await this.syncInterestedCount(data.activityId)
    return { interest, interestedCount }
  }

  async deleteInterest(activityId: string, wechat: string): Promise<InterestMutationResult> {
    const existing = await this.findInterest(activityId, wechat)
    if (!existing) {
      return { interestedCount: (await this.getActivity(activityId))?.interestedCount ?? 0 }
    }
    await this.deleteRowById('interests', existing.id)
    const interestedCount = await this.syncInterestedCount(activityId)
    return { interest: existing, interestedCount }
  }
}
