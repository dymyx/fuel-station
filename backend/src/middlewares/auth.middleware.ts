import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError'

export const protect = (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '')

		if (!token) {
			return next(
				new AppError('Вы не авторизованы. Пожалуйста, войдите в систему.', 401)
			)
		}

		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string)

		;(req as any).user = decoded

		next()
	} catch (error) {
		return next(new AppError('Неверный токен или срок его действия истек', 401))
	}
}
