export type Role = 'ADMIN' | 'OPERATOR'

export interface User {
	id: number
	email: string
	role: Role
	firstName: string
	lastName: string
	createdAt: string
}

export interface Fuel {
	id: number
	brand: string
	pricePerLiter: number
	stockQuantity: number
}

export interface Transaction {
	id: number
	fuelId: number
	litres: number
	totalPrice: number
	pumpNumber: number
	createdAt: string
	fuel?: Pick<Fuel, 'brand'>
	user?: User
}

export interface PaginatedResponse<T> {
	success: boolean
	total: number
	page: number
	data: T[]
}
