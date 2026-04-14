import { Router } from 'express'

import * as fuelController from '../controllers/fuel.controller'
import { protect } from '../middlewares/auth.middleware'
import { restrictTo } from '../middlewares/role.middleware'

const router = Router()

router.get('/', protect, fuelController.getAll)
router.post('/new', protect, restrictTo('ADMIN'), fuelController.create)
router.patch('/:id', protect, restrictTo('ADMIN'), fuelController.update)
router.delete('/:id', protect, restrictTo('ADMIN'), fuelController.remove)

export default router
