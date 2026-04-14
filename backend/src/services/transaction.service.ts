import { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { fuelRepository } from '../repositories/fuel.repository'
import { transactionRepository } from '../repositories/transaction.repository'
import { AppError } from '../utils/AppError'

export const createTransaction = async (data: {
	fuelId: number
	litres: number
	pumpNumber: number
	userId: number
}) => {
	const currentFuel = await fuelRepository.findById(data.fuelId)

	if (!currentFuel) {
		throw new AppError('Такого топлива не существует', 400)
	}

	if (data.litres > currentFuel.stockQuantity) {
		throw new AppError('Такого топлива не существует', 400)
	}

	const totalPrice = data.litres * currentFuel.pricePerLiter

	return await prisma.$transaction(async tx => {
		// 1. Создаем запись о заправке
		const transaction = await tx.transaction.create({
			data: {
				fuelId: data.fuelId,
				userId: data.userId,
				litres: data.litres,
				totalPrice: totalPrice, // Тот самый расчет из твоего кода
				pumpNumber: data.pumpNumber
			}
		})

		// 2. Списываем литры из бака (атомарно)
		await tx.fuel.update({
			where: { id: data.fuelId },
			data: {
				stockQuantity: {
					decrement: data.litres // Сама БД вычтет литры
				}
			}
		})

		return transaction
	})
}

export const getTransaction = async (data: {
	userId?: number
	fuelId?: number
	page?: number
	limit?: number
	startDate?: string
	endDate?: string
}) => {
	const where: Prisma.TransactionWhereInput = {
		...(data.userId && { userId: data.userId }),
		...(data.fuelId && { fuelId: data.fuelId }),
		...(data.startDate || data.endDate
			? {
					createdAt: {
						...(data.startDate && { gte: new Date(data.startDate) }),
						...(data.endDate && { lte: new Date(data.endDate) })
					}
				}
			: {})
	}

	const take = Number(data.limit) || 10
	const skip = ((Number(data.page) || 1) - 1) * take

	// Запускаем оба запроса параллельно
	const [total, items] = await Promise.all([
		prisma.transaction.count({ where }), // Не забудь передать where и сюда!
		transactionRepository.findAll(where, { take, skip })
	])

	return { total, items, page: Number(data.page) || 1 }
}
