import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'

export const fuelRepository = {
	async findAll() {
		return await prisma.fuel.findMany()
	},

	async findById(id: number) {
		return await prisma.fuel.findUnique({ where: { id } })
	},

	async findByBrand(brand: string) {
		return await prisma.fuel.findUnique({ where: { brand } })
	},

	async create(fuelData: Prisma.FuelCreateInput) {
		return await prisma.fuel.create({
			data: fuelData
		})
	},

	async update(id: number, fuelData: Prisma.FuelUpdateInput) {
		return await prisma.fuel.update({
			where: { id },
			data: fuelData
		})
	}
}
