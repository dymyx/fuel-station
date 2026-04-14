import { Router } from 'express'
import * as transactionController from '../controllers/transaction.controller'
import { protect } from '../middlewares/auth.middleware'
import validate from '../middlewares/validate.middleware'
import { createTransactionShema } from '../schemas/transaction.schema'

const router = Router()

router.use(protect)

router.post('/', validate(createTransactionShema), transactionController.create)
router.get('/', transactionController.getHistory)

export default router
