import { useEffect, useState } from 'react'
import type { User } from '../types'
import apiClient from '../api/axios'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Table from '../components/Table'
import UserModal from '../components/modals/UserModal'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

const Users = () => {
	const currentUser = useAuthStore(state => state.user)
	const isAdmin = currentUser?.role === 'ADMIN'

	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
	const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

	const loadUsers = async () => {
		try {
			setLoading(true)
			const { data } = await apiClient.get('/auth/allUsers')
			setUsers(data.users)
		} catch {
			setError('Не удалось загрузить пользователей')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!isAdmin) {
			setLoading(false)
			return
		}

		loadUsers()
	}, [isAdmin])

	const handleEdit = (user: User) => {
		setModalMode('edit')
		setSelectedUser(user)
		setIsModalOpen(true)
	}

	const handleCreate = () => {
		setModalMode('create')
		setSelectedUser(undefined)
		setIsModalOpen(true)
	}

	const handleDelete = async (user: User) => {
		const confirmed = window.confirm(
			`Удалить пользователя: ${user.lastName} ${user.firstName}`
		)

		if (!confirmed) return

		try {
			await apiClient.delete(`/auth/${user.id}`)
			setUsers(prev => prev.filter(item => item.id !== user.id))
			toast.success('Удалено')
		} catch {
			setError('Не удалось удалить пользователя')
		}
	}

	const columns = [
		{ key: 'userId', title: 'ID', render: (row: User) => row.id },
		{ key: 'email', title: 'Почта', render: (row: User) => row.email },
		{
			key: 'surname',
			title: 'Фамилия',
			render: (row: User) => row.lastName
		},
		{
			key: 'name',
			title: 'Имя',
			render: (row: User) => row.firstName
		},
		{
			key: 'role',
			title: 'Роль',
			render: (row: User) =>
				row.role === 'ADMIN' ? 'Администратор' : 'Оператор'
		},
		{
			key: 'created_date',
			title: 'Дата создания',
			render: (row: User) =>
				new Date(row.createdAt).toLocaleDateString('ru-RU', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
		},
		{
			key: 'actions',
			title: 'Действия',
			className: 'text-right',
			render: row => (
				<div className="flex justify-end gap-2">
					<button
						onClick={() => handleEdit(row)}
						className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
						title="Редактировать"
					>
						<Pencil size={16} />
					</button>
					<button
						onClick={() => handleDelete(row)}
						className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50"
						title="Удалить"
					>
						<Trash2 size={16} />
					</button>
				</div>
			)
		}
	]

	if (!isAdmin) {
		return (
			<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
				Доступ к управлению пользователями есть только у администратора.
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-row justify-between">
				<h1 className="p-2 text-2xl font-bold">Управление пользователями</h1>
				<button
					onClick={handleCreate}
					className="flex flex-row items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-md text-white hover:bg-blue-950"
				>
					<Plus /> Добавить пользователя
				</button>
				<UserModal
					open={isModalOpen}
					mode={modalMode}
					initialValues={selectedUser}
					onClose={() => setIsModalOpen(false)}
					onCreated={loadUsers}
				/>
			</div>

			{loading && <div>Загрузка...</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && (
				<Table
					columns={columns}
					rows={users}
					rowKey={row => row.id}
					emptyText="Пользователи не добавлены"
				/>
			)}
		</div>
	)
}

export default Users
