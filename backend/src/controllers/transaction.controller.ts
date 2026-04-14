import type { Request, Response, NextFunction } from 'express'
import * as transactionService from '../services/transaction.service'
import { transactionRepository } from '../repositories/transaction.repository'

export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = (req as any).user.id
		const { fuelId, litres, pumpNumber } = req.body

		const transactionData = {
			userId,
			fuelId,
			litres,
			pumpNumber
		}

		const transaction =
			await transactionService.createTransaction(transactionData)

		res.status(201).json({
			success: true,
			data: transaction
		})
	} catch (error) {
		next(error)
	}
}

export const getHistory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// 1. Берем данные текущего пользователя (из токена)
		const { id, role } = (req as any).user

		// 2. Определяем, чьи транзакции смотреть
		// Если админ — берем из query (или null, если хочет всех), если оператор — только его ID
		const targetUserId =
			role === 'ADMIN'
				? req.query.userId
					? Number(req.query.userId)
					: undefined
				: id

		// 3. Собираем объект для сервиса (с приведением типов)
		const filterOptions: Parameters<
			typeof transactionService.getTransaction
		>[0] = {
			page: Number(req.query.page) || 1,
			limit: Number(req.query.limit) || 10
		}

		if (role !== 'ADMIN') {
			filterOptions.userId = id
		} else if (req.query.userId) {
			filterOptions.userId = Number(req.query.userId)
		}

		if (req.query.fuelId) {
			filterOptions.fuelId = Number(req.query.fuelId)
		}

		if (typeof req.query.startDate === 'string') {
			filterOptions.startDate = req.query.startDate
		}

		if (typeof req.query.endDate === 'string') {
			filterOptions.endDate = req.query.endDate
		}

		// 4. Вызываем сервис
		const result = await transactionService.getTransaction(filterOptions)

		// 5. Отправляем красивый ответ
		res.status(200).json({
			success: true,
			total: result.total,
			page: filterOptions.page,
			transactions: result.items
		})
	} catch (error) {
		next(error)
	}
}
