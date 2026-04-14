import { Router } from 'express'

import authRoutes from '../routes/auth.routes'
import fuelRoutes from '../routes/fuel.routes'
import transtacionRoutes from '../routes/transaction.routes'

const rootRouter = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/fuels', fuelRoutes)
rootRouter.use('/transactions', transtacionRoutes)

export default rootRouter
