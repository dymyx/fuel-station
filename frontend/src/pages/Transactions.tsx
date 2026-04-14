import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/axios'
import type { Transaction, Fuel } from '../types'
import Table from '../components/Table'
import { Funnel, Plus, Search } from 'lucide-react'
import CreateTransactionModal from '../components/modals/CreateTransaction'

type TransactionsResponse = {
	success: boolean
	total: number
	page: number
	transactions: Transaction[]
}

const Transactions = () => {
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isCreateOpen, setIsCreateOpen] = useState(false)

	const [search, setSearch] = useState('')
	const [isFilterOpen, setIsFilterOpen] = useState(false)

	const [fuels, setFuels] = useState<Fuel[]>([])
	const [fuelId, setFuelId] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

	const loadTransactions = async () => {
		try {
			setLoading(true)

			const params: Record<string, string | number> = {
				page: 1,
				limit: 50
			}

			if (fuelId) params.fuelId = Number(fuelId)
			if (startDate) params.startDate = startDate
			if (endDate) params.endDate = endDate

			const { data } = await apiClient.get<TransactionsResponse>(
				'/transactions',
				{
					params
				}
			)

			setTransactions(data.transactions)
		} catch {
			setError('Не получилось загрузить транзакции...')
		} finally {
			setLoading(false)
		}
	}

	const loadFuels = async () => {
		try {
			const { data } = await apiClient.get('/fuels')
			setFuels(data.fuels)
		} catch {
			// Можно молча игнорировать, список топлива нужен только для UI фильтра
		}
	}

	useEffect(() => {
		loadFuels()
		loadTransactions()
	}, [])

	const filteredTransactions = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return transactions

		return transactions.filter(t => {
			const fuelName = t.fuel?.brand?.toLowerCase() ?? ''
			const operator = t.user?.email?.toLowerCase() ?? ''
			const pump = String(t.pumpNumber)
			const litres = String(t.litres)
			const total = String(t.totalPrice)

			return (
				fuelName.includes(q) ||
				operator.includes(q) ||
				pump.includes(q) ||
				litres.includes(q) ||
				total.includes(q)
			)
		})
	}, [transactions, search])

	const resetFilters = async () => {
		setFuelId('')
		setStartDate('')
		setEndDate('')

		try {
			setLoading(true)
			const { data } = await apiClient.get<TransactionsResponse>(
				'/transactions',
				{
					params: { page: 1, limit: 50 }
				}
			)
			setTransactions(data.transactions)
		} catch {
			setError('Не получилось загрузить транзакции...')
		} finally {
			setLoading(false)
		}
	}

	const columns = [
		{
			key: 'type_fuel',
			title: 'Тип топлива',
			render: (row: Transaction) => row.fuel?.brand ?? '-'
		},
		{
			key: 'column',
			title: 'Колонка',
			render: (row: Transaction) => row.pumpNumber
		},
		{
			key: 'litres',
			title: 'Литры',
			render: (row: Transaction) => row.litres
		},
		{
			key: 'finally_summary',
			title: 'Сумма',
			render: (row: Transaction) => `${row.totalPrice} ₽`
		},
		{
			key: 'operator',
			title: 'Оператор',
			render: (row: Transaction) => row.user?.email ?? '-'
		},
		{
			key: 'date',
			title: 'Дата',
			render: (row: Transaction) =>
				new Date(row.createdAt).toLocaleString('ru-RU', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
		}
	]

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="p-2 text-2xl font-bold">Управление транзакциями</h1>

				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={16}
						/>
						<input
							value={search}
							onChange={e => setSearch(e.target.value)}
							placeholder="Поиск по топливу..."
							className="w-72 rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-900"
						/>
					</div>

					<button
						onClick={() => setIsFilterOpen(v => !v)}
						className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
					>
						<Funnel size={16} />
						Фильтр
					</button>

					<button
						onClick={() => setIsCreateOpen(true)}
						className="flex flex-row items-center justify-center gap-2 rounded-xl bg-blue-900 px-3 py-2 text-md text-white hover:bg-blue-950"
					>
						<Plus /> Добавить транзакцию
					</button>

					<CreateTransactionModal
						open={isCreateOpen}
						fuels={fuels}
						onClose={() => setIsCreateOpen(false)}
						onCreated={loadTransactions}
					/>
				</div>
			</div>

			{isFilterOpen && (
				<div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
					<select
						value={fuelId}
						onChange={e => setFuelId(e.target.value)}
						className="rounded-lg border border-slate-300 px-3 py-2"
					>
						<option value="">Все виды топлива</option>
						{fuels.map(f => (
							<option
								key={f.id}
								value={f.id}
							>
								{f.brand}
							</option>
						))}
					</select>

					<input
						type="date"
						value={startDate}
						onChange={e => setStartDate(e.target.value)}
						className="rounded-lg border border-slate-300 px-3 py-2"
					/>

					<input
						type="date"
						value={endDate}
						onChange={e => setEndDate(e.target.value)}
						className="rounded-lg border border-slate-300 px-3 py-2"
					/>

					<div className="flex items-center gap-2">
						<button
							onClick={loadTransactions}
							className="rounded-lg bg-blue-900 px-4 py-2 text-white hover:bg-blue-950"
						>
							Применить
						</button>
						<button
							onClick={resetFilters}
							className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
						>
							Сбросить
						</button>
					</div>
				</div>
			)}

			{loading && <div>Загрузка...</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && (
				<Table
					columns={columns}
					rows={filteredTransactions}
					rowKey={row => row.id}
					emptyText="Транзакции не добавлены"
				/>
			)}
		</div>
	)
}

export default Transactions
