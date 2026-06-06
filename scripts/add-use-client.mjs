import fs from 'fs'
import path from 'path'

const dirs = ['src/pages', 'src/components']

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    const file = typeof f === 'string' ? path.join(dir, f) : path.join(dir, ...f)
    if (!file.endsWith('.tsx')) continue
    let s = fs.readFileSync(file, 'utf8')
    if (s.startsWith("'use client'") || s.startsWith('"use client"')) continue
    if (!s.includes('useState') && !s.includes('useEffect') && !s.includes('useRouter') && !s.includes('useParams') && !s.includes('useSearchParams') && !s.includes('useUser') && !s.includes('onClick') && !s.includes('onChange')) continue
    fs.writeFileSync(file, `'use client'\n\n${s}`)
    console.log('added use client:', file)
  }
}
