import express from 'express'
import cors from 'cors'

import { errorHandler } from './middlewares/errorHandler'
import rootRouter from './routes'

const app = express()

app.use(
	cors({
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	})
)

app.use(express.json())
app.use('/', rootRouter)
app.use(errorHandler)

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
