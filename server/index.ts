import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { handleApiRequest } from './router'
import { getEnvConfig } from './lib/utils'

const app = express()
const PORT = 8787

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const env = getEnvConfig()

app.all('/api/*splat', async (req, res) => {
  const url = `http://localhost:${PORT}${req.originalUrl}`
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value)
    else if (Array.isArray(value)) headers.set(key, value.join(', '))
  }

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)

  const request = new Request(url, { method: req.method, headers, body })
  const response = await handleApiRequest(request, env)

  res.status(response.status)
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'transfer-encoding') res.setHeader(key, value)
  })
  const text = await response.text()
  res.send(text)
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
