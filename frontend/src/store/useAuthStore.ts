import { create } from 'zustand'
import type { User } from '../types'
import apiClient from '../api/axios'

interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
	setAuth: (user: User, token: string) => void
	logout: () => void
	initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>(set => ({
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: true,

	setAuth: (user, token) => {
		localStorage.setItem('token', token)
		set({ user, token, isAuthenticated: true, isLoading: false })
	},

	logout: () => {
		localStorage.removeItem('token')
		set({ user: null, token: null, isAuthenticated: false, isLoading: false })
	},

	initializeAuth: async () => {
		const token = localStorage.getItem('token')

		if (!token) {
			set({ user: null, token: null, isAuthenticated: false, isLoading: false })
			return
		}

		try {
			const res = await apiClient.get('/auth/whoiam')
			const user: User = res.data.user

			set({ user, token, isAuthenticated: true, isLoading: false })
		} catch {
			localStorage.removeItem('token')
			set({ user: null, token: null, isAuthenticated: false, isLoading: false })
		}
	}
}))
