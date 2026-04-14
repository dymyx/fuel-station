import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Fuel } from '../types'
import { useEffect, useState } from 'react'
import apiClient from '../api/axios'
import Table from '../components/Table'
import CreateFuelModal from '../components/modals/CreateFuel'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

const Fuel = () => {
	const user = useAuthStore(state => state.user)
	const isAdmin = user?.role === 'ADMIN'

	const [fuels, setFuels] = useState<Fuel[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
	const [selectedFuel, setSelectedFuel] = useState<Fuel | undefined>(undefined)

	const loadFuels = async () => {
		try {
			setLoading(true)
			const { data } = await apiClient.get('/fuels')
			setFuels(data.fuels)
		} catch {
			setError('Не удалось загрузить виды топлива')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadFuels()
	}, [])

	const handleCreate = () => {
		setModalMode('create')
		setSelectedFuel(undefined)
		setIsModalOpen(true)
	}

	const handleEdit = (fuel: Fuel) => {
		setModalMode('edit')
		setSelectedFuel(fuel)
		setIsModalOpen(true)
	}

	const handleDelete = async (fuel: Fuel) => {
		const confirmed = window.confirm(`Удалить "${fuel.brand}"?`)
		if (!confirmed) return

		try {
			await apiClient.delete(`/fuels/${fuel.id}`)
			setFuels(prev => prev.filter(item => item.id !== fuel.id))
			toast.success('Удалено')
		} catch {
			setError('Не удалось удалить топливо')
		}
	}

	const columns = [
		{ key: 'type', title: 'Тип топлива', render: (row: Fuel) => row.brand },
		{
			key: 'price',
			title: 'Цена за литр',
			render: (row: Fuel) => `${row.pricePerLiter} ₽`
		},
		{
			key: 'stock',
			title: 'Остаток',
			render: (row: Fuel) => `${row.stockQuantity} л`
		},
		...(isAdmin
			? [
					{
						key: 'actions',
						title: 'Действия',
						className: 'text-right',
						render: (row: Fuel) => (
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
			: [])
	]

	return (
		<div className="space-y-4">
			<div className="flex flex-row justify-between">
				<h1 className="p-2 text-2xl font-bold">
					{isAdmin ? 'Управление топливом' : 'Просмотр топлива'}
				</h1>
				{isAdmin && (
					<button
						onClick={handleCreate}
						className="flex flex-row items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-md text-white hover:bg-blue-950"
					>
						<Plus /> Добавить топливо
					</button>
				)}

				<CreateFuelModal
					open={isModalOpen}
					mode={modalMode}
					initialValues={selectedFuel}
					onClose={() => setIsModalOpen(false)}
					onCreated={loadFuels}
				/>
			</div>

			{loading && <div>Загрузка...</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && (
				<Table
					columns={columns}
					rows={fuels}
					rowKey={row => row.id}
					emptyText="Виды топлива не добавлены"
				/>
			)}
		</div>
	)
}

export default Fuel
