import { z } from 'zod'

export const createTransactionShema = z.object({
	body: z.object({
		fuelId: z
			.number({
				error: 'ID топилва обязателен'
			})
			.int()
			.positive(),

		litres: z
			.number()
			.positive('Количество литров должно быть больше 0')
			.max(1000),

		pumpNumber: z.number().int().min(1, 'Минимальный номер колонки - 1').max(50)
	})
})
