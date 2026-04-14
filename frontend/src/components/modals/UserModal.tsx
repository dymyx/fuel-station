import React, { useEffect, useState } from 'react'
import apiClient from '../../api/axios'
import type { User } from '../../types'
import toast from 'react-hot-toast'

type Role = 'ADMIN' | 'OPERATOR'

type UserModalProps = {
	open: boolean
	mode: 'create' | 'edit'
	initialValues?: User
	onClose: () => void
	onCreated: () => Promise<void> | void
}

const UserModal = ({
	open,
	mode,
	initialValues,
	onClose,
	onCreated
}: UserModalProps) => {
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [firstName, setFirstName] = useState<string>('')
	const [lastName, setLastName] = useState<string>('')
	const [role, setRole] = useState<Role>('OPERATOR')

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return

		if (mode === 'edit' && initialValues) {
			setEmail(initialValues.email)
			setPassword('')
			setFirstName(initialValues.firstName)
			setLastName(initialValues.lastName)
			setRole(initialValues.role)
		} else {
			setEmail('')
			setPassword('')
			setFirstName('')
			setLastName('')
			setRole('OPERATOR')
		}
		setError(null)
	}, [open, mode, initialValues])

	if (!open) return null

	const handleClose = () => {
		if (loading) return
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!email.trim()) return setError('Введите email')
		if (!firstName.trim()) return setError('Введите имя')
		if (!lastName.trim()) return setError('Введите фамилию')

		if (mode === 'create' && !password.trim()) {
			return setError('Введите пароль')
		}

		if (mode === 'edit' && password.trim()) {
			return setError(
				'При редактировании пароль изменять нельзя. Оставьте поле пустым.'
			)
		}

		try {
			setLoading(true)

			if (mode === 'edit') {
				if (!initialValues?.id) {
					throw new Error('Не найден id пользователя для редактирования')
				}

				const payload = {
					email,
					firstName,
					lastName,
					role
				}
				await apiClient.patch(`/auth/${initialValues.id}`, payload)
			} else {
				const payload = {
					email,
					password,
					firstName,
					lastName,
					role
				}
				await apiClient.post('/auth/register', payload)
			}

			await onCreated()
			toast.success(
				mode === 'edit' ? 'Пользователь обновлен' : 'Пользователь создан'
			)
			onClose()
		} catch {
			setError(
				mode === 'edit'
					? 'Не удалось обновить пользователя'
					: 'Не удалось создать пользователя'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
				<h2 className="mb-4 text-xl font-semibold">
					{mode === 'edit'
						? 'Редактировать пользователя'
						: 'Добавить пользователя'}
				</h2>

				<form
					onSubmit={handleSubmit}
					className="space-y-3"
				>
					<input
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="Напишите email"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
						required
					/>

					{mode === 'create' && (
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder="Напишите пароль"
							className="w-full rounded-lg border border-slate-300 px-3 py-2"
							required
						/>
					)}

					{mode === 'edit' && (
						<div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
							Пароль не может быть изменён через редактирование профиля
						</div>
					)}

					<input
						type="text"
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
						placeholder="Напишите имя сотрудника"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
						required
					/>
					<input
						type="text"
						value={lastName}
						onChange={e => setLastName(e.target.value)}
						placeholder="Напишите фамилию сотрудника"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
						required
					/>
					<select
						value={role}
						onChange={e => setRole(e.target.value as Role)}
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
						required
					>
						<option value="ADMIN">Администратор</option>
						<option value="OPERATOR">Оператор</option>
					</select>

					{error && <p className="text-sm text-red-600">{error}</p>}

					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={handleClose}
							className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-blue-900 px-4 py-2 text-white hover:bg-blue-950 disabled:opacity-60"
						>
							{loading
								? mode === 'edit'
									? 'Сохраняем...'
									: 'Создаем...'
								: mode === 'edit'
									? 'Сохранить'
									: 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default UserModal
