/**
 * Seed Supabase with sample data (mirrors MockAdapter seeds).
 * Usage: node scripts/seed-supabase.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })
config({ path: join(__dirname, '..', '.env') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

const now = new Date()
const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString()
const futureDate = (days, hour = 9) => {
  const d = new Date(now.getTime() + days * 86400000)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const activities = [
  {
    id: 'prop001', title: 'Le Marais 美食探店',
    description: '周末法式小酒馆巡礼，5家精选餐厅，从传统 bistro 到现代 fusion，适合喜欢美食的朋友一起探索玛黑区。',
    date: null, location: 'Le Marais, Paris 4e', max_participants: null, fee: '各付各的，人均约 30-50€',
    notes: '', organizer_name: 'Cette糖', organizer_wechat: 'cette456',
    source_url: 'https://www.sortiraparis.com/example', status: 'proposed', category: 'dining',
    interested_count: 5, created_at: daysAgo(2), fee_level: 'paid',
  },
  {
    id: 'prop002', title: '塞纳河 Picnic 野餐',
    description: '天气好的时候在塞纳河边野餐，自带食物或附近买，聊天晒太阳，轻松社交。',
    date: null, location: 'Pont Neuf 附近', max_participants: null, fee: '免费，自备食物',
    notes: '建议带野餐垫', organizer_name: '小明', organizer_wechat: 'xiaoming88',
    source_url: '', status: 'proposed', category: 'dining', interested_count: 3,
    created_at: daysAgo(5), fee_level: 'free',
  },
  {
    id: 'prop003', title: '卢浮宫周五夜场',
    description: '卢浮宫每周五晚延长开放至 21:45，人比白天少，适合慢慢欣赏名画。',
    date: null, location: 'Musée du Louvre', max_participants: null, fee: '免费（26岁以下欧盟居民）',
    notes: '需提前预约免费票', organizer_name: 'Lily', organizer_wechat: 'lily_art',
    source_url: 'https://www.louvre.fr/', status: 'proposed', category: 'culture',
    interested_count: 2, created_at: daysAgo(1), fee_level: 'unknown',
    linked_recruit_ids: ['recr003', 'recr004'],
  },
  {
    id: 'recr001', title: 'Rambouillet 徒步',
    description: '从 Saint-Lazare 坐火车去 Rambouillet 森林徒步，约 12km，中等难度，风景优美。适合有一定体力、喜欢户外的朋友。',
    date: futureDate(10, 9), location: 'Saint-Lazare 站集合', max_participants: 10,
    fee: '火车票自理，约 15€', notes: '请穿运动鞋\n自备午餐和水\n雨天取消',
    organizer_name: 'James', organizer_wechat: 'james123', source_url: '', status: 'recruiting',
    category: 'sports', interested_count: 0, created_at: daysAgo(7),
    difficulty: 'medium', distance_duration: '约 12km，4-5 小时',
    itinerary: 'Saint-Lazare 9:00 集合 → 火车 → 森林徒步 → 16:00 返程',
    equipment: '运动鞋、背包、防晒', transportation: 'RER / 火车，约 15€ 往返', meal_arrangement: 'self',
  },
  {
    id: 'recr002', title: '玛黑 Brunch 聚餐',
    description: '周末法式 Brunch，提前订位，适合喜欢美食和轻松社交的朋友。',
    date: futureDate(3, 11), location: 'Le Marais, Paris 4e', max_participants: 8,
    fee: '人均约 25-35€', notes: '请准时到达\n素食可提前告知',
    organizer_name: 'Amy', organizer_wechat: 'amy_vintage', source_url: '', status: 'recruiting',
    category: 'dining', interested_count: 0, created_at: daysAgo(3),
    restaurant_address: 'Le Marais, Rue des Rosiers 附近', per_person_cost: '25-35€',
    reservation_method: 'organizer', requires_deposit: false,
  },
  {
    id: 'recr003', title: '卢浮宫周五夜场',
    description: '卢浮宫每周五晚延长开放，一起慢慢欣赏名画。',
    date: futureDate(7, 18), location: 'Musée du Louvre', max_participants: 10,
    fee: '免费（26岁以下欧盟居民）', notes: '需提前预约免费票',
    organizer_name: 'Lily', organizer_wechat: 'lily_art', source_url: 'https://www.louvre.fr/',
    status: 'recruiting', category: 'culture', interested_count: 0, created_at: daysAgo(4),
    source_proposal_id: 'prop003',
  },
  {
    id: 'recr004', title: '卢浮宫周五夜场 第二期',
    description: '卢浮宫夜场第二期招募，错过第一期的朋友欢迎加入。',
    date: futureDate(21, 18), location: 'Musée du Louvre', max_participants: 10,
    fee: '免费（26岁以下欧盟居民）', notes: '',
    organizer_name: 'Lily', organizer_wechat: 'lily_art', source_url: 'https://www.louvre.fr/',
    status: 'recruiting', category: 'culture', interested_count: 0, created_at: daysAgo(2),
    source_proposal_id: 'prop003',
  },
  {
    id: 'end001', title: 'Montmartre 摄影漫步',
    description: '已完成的活动：蒙马特高地街拍，Sacré-Cœur 日落，大家拍了很多好照片！',
    date: daysAgo(14), location: 'Abbesses 站', max_participants: 12, fee: '免费', notes: '',
    organizer_name: 'Tom', organizer_wechat: 'tom_photo', source_url: '', status: 'ended_success',
    category: 'culture', interested_count: 0, created_at: daysAgo(30), ended_at: daysAgo(14),
    recap: '蒙马特高地街拍圆满结束！Sacré-Cœur 日落超美，大家拍了很多好照片，下次再约～',
    recap_images: 'https://picsum.photos/400/300?random=1\nhttps://picsum.photos/400/300?random=2',
  },
  {
    id: 'end002', title: 'Versailles 一日游',
    description: '原计划周末去凡尔赛宫，因天气取消。',
    date: daysAgo(7), location: 'Versailles', max_participants: 15, fee: '门票约 20€', notes: '',
    organizer_name: 'James', organizer_wechat: 'james123', source_url: '', status: 'ended_cancelled',
    category: 'culture', interested_count: 0, created_at: daysAgo(20), ended_at: daysAgo(8),
    cancel_reason: 'weather', cancel_note: '巴黎近期持续降雨，下次天气好了再约！',
  },
]

const registrations = [
  { id: 'reg001', activity_id: 'recr001', name: 'James', wechat: 'james123', participant_count: 2, note: '有车', registered_at: daysAgo(6) },
  { id: 'reg002', activity_id: 'recr001', name: 'Cette糖', wechat: 'cette456', participant_count: 1, note: '', registered_at: daysAgo(5) },
  { id: 'reg003', activity_id: 'recr001', name: '小明', wechat: 'xiaoming88', participant_count: 2, note: '', registered_at: daysAgo(4) },
  { id: 'reg004', activity_id: 'recr001', name: 'Lily', wechat: 'lily_art', participant_count: 2, note: '素食', registered_at: daysAgo(3) },
  { id: 'reg005', activity_id: 'recr002', name: 'Amy', wechat: 'amy_vintage', participant_count: 1, note: '发起人', registered_at: daysAgo(2) },
  { id: 'reg006', activity_id: 'recr002', name: 'Tom', wechat: 'tom_photo', participant_count: 1, note: '', registered_at: daysAgo(1) },
  { id: 'reg007', activity_id: 'end002', name: 'James', wechat: 'james123', participant_count: 1, note: '', registered_at: daysAgo(10) },
]

const interests = [
  { id: 'int001', activity_id: 'prop001', wechat: 'alice01', created_at: daysAgo(2) },
  { id: 'int002', activity_id: 'prop001', wechat: 'bob02', created_at: daysAgo(2) },
  { id: 'int003', activity_id: 'prop001', wechat: 'carol03', created_at: daysAgo(1) },
  { id: 'int004', activity_id: 'prop001', wechat: 'david04', created_at: daysAgo(1) },
  { id: 'int005', activity_id: 'prop001', wechat: 'eve05', created_at: daysAgo(0) },
  { id: 'int006', activity_id: 'prop002', wechat: 'frank06', created_at: daysAgo(4) },
  { id: 'int007', activity_id: 'prop002', wechat: 'grace07', created_at: daysAgo(3) },
  { id: 'int008', activity_id: 'prop002', wechat: 'henry08', created_at: daysAgo(2) },
  { id: 'int009', activity_id: 'prop003', wechat: 'ivy09', created_at: daysAgo(3) },
  { id: 'int010', activity_id: 'prop003', wechat: 'jack10', created_at: daysAgo(2) },
]

async function upsert(table, rows) {
  const { error } = await db.from(table).upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`  ✓ ${table}: ${rows.length} rows`)
}

async function main() {
  const { error: probe } = await db.from('activities').select('id').limit(1)
  if (probe?.code === '42P01' || probe?.message?.includes('does not exist')) {
    console.error('\nTables not found. Run schema first:\n  npm run db:setup\n')
    process.exit(1)
  }
  if (probe) {
    console.error('Supabase error:', probe.message)
    process.exit(1)
  }

  console.log('Seeding Supabase...')
  await upsert('activities', activities)
  await upsert('registrations', registrations)
  await upsert('interests', interests)
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
