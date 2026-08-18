import 'dotenv/config'
import http from 'node:http'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import businessUnitsRoutes from './routes/businessUnits.routes.js'
import initiativesRoutes from './routes/initiatives.routes.js'
import updatesRoutes from './routes/updates.routes.js'
import nextStepsRoutes from './routes/nextSteps.routes.js'
import summaryRoutes from './routes/summary.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initSocket } from './socket.js'

const PORT = Number(process.env.PORT ?? 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

const app = express()
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/business-units', businessUnitsRoutes)
app.use('/api/initiatives', initiativesRoutes)
app.use('/api', updatesRoutes)
app.use('/api', nextStepsRoutes)
app.use('/api', summaryRoutes)

app.use(errorHandler)

const httpServer = http.createServer(app)
initSocket(httpServer, CORS_ORIGIN)

httpServer.listen(PORT, () => {
  console.log(`PulsePoint API listening on http://localhost:${PORT}`)
})
