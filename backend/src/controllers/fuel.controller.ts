import type { Request, Response, NextFunction } from 'express'
import * as fuelService from '../services/fuel.service'
import { fuelRepository } from '../repositories/fuel.repository'

export const getAll = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const allFuels = await fuelRepository.findAll()

		res.status(200).json({
			success: true,
			fuels: allFuels
		})
	} catch (error) {
		next(error)
	}
}

export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const fuel = req.body
		const result = await fuelService.createFuel(fuel)

		res.status(200).json({
			success: true,
			data: result
		})
	} catch (error) {
		next(error)
	}
}

export const update = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const fuelId = Number(req.params.id)
		const updatedFuel = req.body

		const result = await fuelService.updateFuel(fuelId, updatedFuel)

		res.status(200).json({
			success: true,
			data: result
		})
	} catch (error) {
		next(error)
	}
}

export const remove = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const fuelId = Number(req.params.id)
		const result = await fuelService.deleteFuel(fuelId)
		res.status(200).json({
			success: true,
			data: result
		})
	} catch (error) {
		next(error)
	}
}
