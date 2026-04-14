import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'

export const userRepository = {
	async findByEmail(email: string) {
		return await prisma.user.findUnique({
			where: { email }
		})
	},

	async create(data: Prisma.UserCreateInput) {
		return await prisma.user.create({
			data
		})
	},

	async findById(id: number) {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				createdAt: true
			}
		})
	},

	async findAll() {
		return await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				createdAt: true
			}
		})
	},
	async update(userId: number, userData: Prisma.UserUpdateInput) {
		return await prisma.user.update({
			where: {
				id: userId
			},
			data: userData,
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				createdAt: true
			}
		})
	}
}
