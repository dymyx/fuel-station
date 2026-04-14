import type { User } from '../types'
import apiClient from './axios'

interface LoginResponse {
	success: boolean
	token: string
	user: User
}

export const login = async (email: string, password: string) => {
	const response = await apiClient.post<LoginResponse>('/auth/login', {
		email,
		password
	})
	return response.data
}
