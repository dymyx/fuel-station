import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { fuelRepository } from '../repositories/fuel.repository'
import { AppError } from '../utils/AppError'

export const createFuel = async (fuelData: Prisma.FuelCreateInput) => {
	const existingFuel = await fuelRepository.findByBrand(fuelData.brand)

	if (existingFuel) {
		throw new AppError('Такая марка топлива уже есть', 400)
	}

	const fuel = await fuelRepository.create(fuelData)

	return fuel
}

export const updateFuel = async (
	fuelId: number,

	fuelData: Prisma.FuelUpdateInput
) => {
	const existingFuel = await fuelRepository.findById(fuelId)

	if (!existingFuel) {
		throw new AppError('Марки топлива не сущетсвует.', 404)
	}

	if (fuelData?.brand) {
		if (existingFuel.brand !== fuelData.brand) {
			const existingBrand = await fuelRepository.findByBrand(
				fuelData.brand as string
			)

			if (existingBrand) {
				throw new AppError('Такая марка топлива уже есть', 400)
			}
		}
	}

	const fuel = await fuelRepository.update(fuelId, fuelData)

	return fuel
}

export const deleteFuel = async (fuelId: number) => {
	const existingFuel = await fuelRepository.findById(fuelId)
	if (!existingFuel) {
		throw new AppError('Марка топлива не найдена', 404)
	}

	return await prisma.$transaction(async tx => {
		await tx.transaction.deleteMany({
			where: { fuelId }
		})

		const deletedFuel = await tx.fuel.delete({
			where: { id: fuelId }
		})

		return deletedFuel
	})
}
