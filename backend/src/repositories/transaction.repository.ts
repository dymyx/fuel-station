import { Prisma } from '../../generated/prisma/client'
import type { TransactionWhereInput } from '../../generated/prisma/models'

import { prisma } from '../lib/prisma'

export const transactionRepository = {
	async count(where: Prisma.TransactionWhereInput) {
		return await prisma.transaction.count({ where })
	},
	async findAll(
		filterObject: TransactionWhereInput,
		pagination: { take: number; skip: number }
	) {
		return await prisma.transaction.findMany({
			where: filterObject,
			take: pagination.take,
			skip: pagination.skip,
			include: {
				fuel: true,
				user: {
					select: {
						id: true,
						email: true,
						role: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	},

	async findByPeriod(startDate: Date, endDate: Date) {
		return await prisma.transaction.findMany({
			where: {
				createdAt: {
					gte: startDate,

					lte: endDate
				}
			}
		})
	},

	async findByUser(userID: number) {
		return await prisma.transaction.findMany({
			where: {
				userId: userID
			}
		})
	},

	async create(data: Prisma.TransactionUncheckedCreateInput) {
		return await prisma.transaction.create({ data })
	}
}
