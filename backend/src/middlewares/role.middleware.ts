import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const restrictTo = (...allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user

		if (!allowedRoles.includes(user.role)) {
			return next(
				new AppError('У вас нет прав для выполнения этого действия', 403)
			)
		}
		next()
	}
}
