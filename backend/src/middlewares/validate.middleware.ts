import type { NextFunction, Request, Response } from 'express'
import { ZodError, type ZodTypeAny } from 'zod'

const validate =
	(schema: ZodTypeAny) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params
			})

			return next()
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					status: 'error',
					errors: error.issues.map(e => ({
						field: e.path.join('.'),
						message: e.message
					}))
				})
			}

			return next(error)
		}
	}

export default validate
