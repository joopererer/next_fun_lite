import fs from 'fs'
import path from 'path'

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let s = fs.readFileSync(p, 'utf8')
      if (!s.includes('react-router-dom')) continue
      s = s.replace(/import \{ Link \} from 'react-router-dom'/g, "import Link from 'next/link'")
      s = s.replace(
        /import \{ Link, useParams \} from 'react-router-dom'/g,
        "import Link from 'next/link'\nimport { useParams } from 'next/navigation'",
      )
      s = s.replace(
        /import \{ Link, useNavigate \} from 'react-router-dom'/g,
        "import Link from 'next/link'\nimport { useRouter } from 'next/navigation'",
      )
      s = s.replace(
        /import \{ Link, useSearchParams \} from 'react-router-dom'/g,
        "import Link from 'next/link'\nimport { useSearchParams } from 'next/navigation'",
      )
      s = s.replace(/import \{ useNavigate \} from 'react-router-dom'/g, "import { useRouter } from 'next/navigation'")
      s = s.replace(/\bto=/g, 'href=')
      s = s.replace(/\buseNavigate\b/g, 'useRouter')
      s = s.replace(/\bnavigate\b/g, 'router')
      s = s.replace(/const router = useRouter\(\)/g, 'const router = useRouter()')
      fs.writeFileSync(p, s)
      console.log('updated', p)
    }
  }
}

walk('src')
