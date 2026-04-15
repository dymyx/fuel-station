import express from 'express'
import cors from 'cors'

import { errorHandler } from './middlewares/errorHandler'
import rootRouter from './routes'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
	: ['http://localhost:5173']

app.use(
	cors({
		origin: allowedOrigins,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	})
)

app.use(express.json())
app.use('/', rootRouter)
app.use(errorHandler)

export default app
