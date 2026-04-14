import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { number, success } from 'zod'

export const registerUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const inputUserData = req.body
		const result = await authService.register(inputUserData)
		return res.status(201).json({
			success: true,
			data: result
		})
	} catch (error) {
		next(error)
	}
}

export const authenticationUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const inputUserData = req.body
		const result = await authService.login(inputUserData)

		return res.status(200).json({
			success: true,
			user: result.userWithoutPassword,
			token: result.token
		})
	} catch (error) {
		next(error)
	}
}

export const getAllUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await authService.getAllUsers()

		return res.status(200).json({
			success: true,
			users: result
		})
	} catch (error) {
		next(error)
	}
}

export const whoIAm = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = (req as any).user.id
		const user = await authService.whoIAM(userId)

		return res.status(200).json({
			success: true,
			user
		})
	} catch (error) {
		next(error)
	}
}

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const targetUserId = Number(req.params.id)
		const updatedUser = req.body

		const result = await authService.updateUser(targetUserId, updatedUser)

		res.status(200).json({
			success: true,
			data: result
		})
	} catch (error) {
		next(error)
	}
}

export const removeUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const targetUserId = Number(req.params.id)
		const currentUserId = (req as any).user.id

		if (Number.isNaN(targetUserId)) {
			return res.status(400).json({
				success: false,
				message: 'Некорректный id пользователя'
			})
		}

		if (targetUserId === currentUserId) {
			return res.status(400).json({
				success: false,
				message: 'Нельзя удалить самого себя'
			})
		}

		await authService.deleteUser(targetUserId)
		return res.status(204).send()
	} catch (error) {
		next(error)
	}
}
