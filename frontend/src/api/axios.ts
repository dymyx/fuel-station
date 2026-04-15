import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	headers: {
		'Content-Type': 'application/json'
	}
})

apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = localStorage.getItem('token')

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}

		return config
	},
	(error: AxiosError) => {
		return Promise.reject(error)
	}
)

export default apiClient
