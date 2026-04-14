import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { login } from '../api/auth'
import axios from 'axios'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const { setAuth, isAuthenticated } = useAuthStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/', { replace: true })
		}
	}, [isAuthenticated, navigate])

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError('')

		if (email.trim().length === 0 || password.trim().length === 0) {
			setError('Не все поля заполнены')
			return
		}

		setLoading(true)

		try {
			const { user, token } = await login(email, password)
			setAuth(user, token)
			navigate('/')
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					setError('Неверный email или пароль')
				} else {
					setError('Что-то пошло не так...')
				}
			} else {
				setError('Что-то пошло не так...')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen w-screen items-center justify-center bg-slate-100 px-4">
			<form
				onSubmit={onSubmit}
				className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
			>
				<h1 className="text-center text-2xl font-semibold text-slate-900">
					Вход
				</h1>
				<p className="mt-1 mb-5 text-center text-sm text-slate-500">
					Авторизуйтесь, чтобы продолжить работу
				</p>

				{error && (
					<p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{error}
					</p>
				)}

				<div className="mb-4">
					<label className="mb-1 block text-sm font-medium text-slate-700">
						Email
					</label>
					<input
						type="email"
						name="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="Введите email"
						autoComplete="email"
						required
						className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20"
					/>
				</div>

				<div className="mb-5">
					<label className="mb-1 block text-sm font-medium text-slate-700">
						Пароль
					</label>
					<input
						type="password"
						name="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder="Введите пароль"
						autoComplete="current-password"
						required
						className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20"
					/>
				</div>

				<button
					disabled={isLoading}
					className="w-full rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
				>
					{isLoading ? 'Входим...' : 'Войти'}
				</button>
			</form>
		</div>
	)
}
