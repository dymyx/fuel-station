import { Router } from 'express'

import * as authController from '../controllers/auth.controller'
import { protect } from '../middlewares/auth.middleware'
import { restrictTo } from '../middlewares/role.middleware'

const router = Router()

router.post('/register', authController.registerUser)
router.post('/login', authController.authenticationUser)
router.get(
	'/allUsers',
	protect,
	restrictTo('ADMIN'),
	authController.getAllUsers
)
router.get('/whoiam', protect, authController.whoIAm)

//CRUD USER
router.patch('/:id', protect, restrictTo('ADMIN'), authController.updateUser)

router.delete('/:id', protect, restrictTo('ADMIN'), authController.removeUser)

export default router
