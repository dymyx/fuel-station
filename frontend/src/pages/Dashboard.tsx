import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
	Activity,
	AlertTriangle,
	Banknote,
	Droplets,
	Gauge,
	RefreshCcw,
	TrendingUp,
	Users
} from 'lucide-react'
import apiClient from '../api/axios'
import type { Fuel, Transaction } from '../types'
import { useAuthStore } from '../store/useAuthStore'

type TransactionsResponse = {
	success: boolean
	total: number
	page: number
	transactions: Transaction[]
}

type FuelsResponse = {
	success: boolean
	fuels: Fuel[]
}

type UsersResponse = {
	success: boolean
	users: Array<{ id: number }>
}

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0
})

const litresFormatter = new Intl.NumberFormat('ru-RU', {
	maximumFractionDigits: 1
})

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
	day: '2-digit',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit'
})

const toNumber = (value: number | string | null | undefined) => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0
	}

	if (typeof value !== 'string') {
		return 0
	}

	const normalized = value
		.trim()
		.replace(',', '.')
		.replace(/[^0-9.-]/g, '')

	const parsed = Number(normalized)
	return Number.isFinite(parsed) ? parsed : 0
}

const Dashboard = () => {
	const user = useAuthStore(state => state.user)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [fuels, setFuels] = useState<Fuel[]>([])
	const [usersCount, setUsersCount] = useState<number | null>(null)

	const isAdmin = user?.role === 'ADMIN'

	const loadDashboard = useCallback(async () => {
		setLoading(true)
		setError(null)

		const [transactionsResult, fuelsResult, usersResult] =
			await Promise.allSettled([
				apiClient.get<TransactionsResponse>('/transactions', {
					params: { page: 1, limit: 200 }
				}),
				apiClient.get<FuelsResponse>('/fuels'),
				isAdmin
					? apiClient.get<UsersResponse>('/auth/allUsers')
					: Promise.resolve(null)
			])

		if (transactionsResult.status === 'fulfilled') {
			setTransactions(transactionsResult.value.data.transactions)
		}

		if (fuelsResult.status === 'fulfilled') {
			setFuels(fuelsResult.value.data.fuels)
		}

		if (isAdmin && usersResult.status === 'fulfilled' && usersResult.value) {
			setUsersCount(usersResult.value.data.users.length)
		}

		if (
			transactionsResult.status === 'rejected' &&
			fuelsResult.status === 'rejected'
		) {
			setError('Не удалось загрузить данные для дашборда')
		}

		setLoading(false)
	}, [isAdmin])

	useEffect(() => {
		void loadDashboard()
	}, [loadDashboard])

	const metrics = useMemo(() => {
		const totalRevenue = transactions.reduce(
			(sum, transaction) => sum + toNumber(transaction.totalPrice),
			0
		)
		const totalLitres = transactions.reduce(
			(sum, transaction) => sum + toNumber(transaction.litres),
			0
		)
		const averageCheck = transactions.length
			? totalRevenue / transactions.length
			: 0
		const stockVolume = fuels.reduce(
			(sum, fuel) => sum + toNumber(fuel.stockQuantity),
			0
		)
		const stockValue = fuels.reduce(
			(sum, fuel) =>
				sum + toNumber(fuel.stockQuantity) * toNumber(fuel.pricePerLiter),
			0
		)

		const consumptionByFuel = transactions.reduce<Record<string, number>>(
			(accumulator, transaction) => {
				const key = transaction.fuel?.brand ?? 'Неизвестно'
				accumulator[key] =
					(accumulator[key] ?? 0) + toNumber(transaction.litres)
				return accumulator
			},
			{}
		)

		const topFuel = Object.entries(consumptionByFuel).sort(
			(a, b) => b[1] - a[1]
		)[0]

		return {
			totalRevenue,
			totalLitres,
			averageCheck,
			stockVolume,
			stockValue,
			topFuelLabel: topFuel?.[0] ?? 'Нет данных',
			topFuelLitres: topFuel?.[1] ?? 0
		}
	}, [transactions, fuels])

	const lowStockFuels = useMemo(
		() => fuels.filter(fuel => fuel.stockQuantity <= 200),
		[fuels]
	)

	const lastTransactions = useMemo(
		() =>
			[...transactions]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
				.slice(0, 6),
		[transactions]
	)

	const fuelDistribution = useMemo(() => {
		const map = transactions.reduce<Record<string, number>>(
			(acc, transaction) => {
				const key = transaction.fuel?.brand ?? 'Неизвестно'
				acc[key] = (acc[key] ?? 0) + 1
				return acc
			},
			{}
		)

		const total = Object.values(map).reduce((sum, count) => sum + count, 0)

		return Object.entries(map)
			.map(([brand, count]) => ({
				brand,
				count,
				share: total > 0 ? (count / total) * 100 : 0
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 6)
	}, [transactions])

	if (loading) {
		return (
			<div className="py-10 text-sm text-slate-500">Загрузка dashboard...</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
				<p className="text-sm font-medium">{error}</p>
				<button
					onClick={() => void loadDashboard()}
					className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-sm hover:bg-rose-100"
				>
					Попробовать снова
				</button>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-blue-700 to-slate-900 p-6 text-white shadow-lg">
				<div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
				<div className="pointer-events-none absolute -bottom-14 left-8 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />

				<div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-[0.2em] text-cyan-100/90">
							Панель
						</p>
						<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
							Добро пожаловать, {user?.firstName ?? 'Гость'}
						</h1>
						<p className="max-w-2xl text-sm text-cyan-50/90">
							Контролируйте продажи и остатки в реальном времени: резкие
							просадки по топливу и динамика выручки за неделю всегда перед
							глазами.
						</p>
					</div>

					<button
						onClick={() => void loadDashboard()}
						className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
					>
						<RefreshCcw size={16} />
						Обновить
					</button>
				</div>

				<div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
						<p className="text-xs text-cyan-100/90">Топливо-лидер</p>
						<p className="mt-1 text-lg font-semibold">{metrics.topFuelLabel}</p>
						<p className="text-xs text-cyan-100/85">
							{litresFormatter.format(metrics.topFuelLitres)} л продано
						</p>
					</div>

					<div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
						<p className="text-xs text-cyan-100/90">Текущий остаток</p>
						<p className="mt-1 text-lg font-semibold">
							{litresFormatter.format(metrics.stockVolume)} л
						</p>
						<p className="text-xs text-cyan-100/85">
							на сумму {moneyFormatter.format(metrics.stockValue)}
						</p>
					</div>

					<div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
						<p className="text-xs text-cyan-100/90">Низкий остаток</p>
						<p className="mt-1 text-lg font-semibold">{lowStockFuels.length}</p>
						<p className="text-xs text-cyan-100/85">видов топлива</p>
					</div>
				</div>
			</section>

			<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-slate-500">Выручка</p>
						<Banknote
							className="text-emerald-600"
							size={18}
						/>
					</div>
					<p className="mt-2 text-2xl font-semibold text-slate-900">
						{moneyFormatter.format(metrics.totalRevenue)}
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-slate-500">Продано литров</p>
						<Droplets
							className="text-cyan-600"
							size={18}
						/>
					</div>
					<p className="mt-2 text-2xl font-semibold text-slate-900">
						{litresFormatter.format(metrics.totalLitres)} л
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-slate-500">Средний чек</p>
						<TrendingUp
							className="text-blue-700"
							size={18}
						/>
					</div>
					<p className="mt-2 text-2xl font-semibold text-slate-900">
						{moneyFormatter.format(metrics.averageCheck)}
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-slate-500">Операций</p>
						<Activity
							className="text-fuchsia-700"
							size={18}
						/>
					</div>
					<p className="mt-2 text-2xl font-semibold text-slate-900">
						{transactions.length}
					</p>
				</div>
			</section>

			{isAdmin && (
				<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-slate-500">Пользователей в системе</p>
						<Users
							className="text-blue-700"
							size={18}
						/>
					</div>
					<p className="mt-1 text-2xl font-semibold text-slate-900">
						{usersCount ?? 0}
					</p>
				</section>
			)}

			<section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="text-base font-semibold text-slate-900">
						Структура продаж по топливу
					</h2>
					<div className="mt-4 space-y-3">
						{fuelDistribution.length === 0 && (
							<p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
								Нет данных для анализа структуры продаж.
							</p>
						)}

						{fuelDistribution.map(item => (
							<div
								key={item.brand}
								className="space-y-1"
							>
								<div className="flex items-center justify-between text-sm">
									<p className="font-medium text-slate-800">{item.brand}</p>
									<p className="text-slate-500">
										{item.count} транзакций ({item.share.toFixed(1)}%)
									</p>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-blue-800"
										style={{ width: `${Math.max(4, item.share)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="text-base font-semibold text-slate-900">
						Критичные остатки
					</h2>
					<div className="mt-3 space-y-2">
						{lowStockFuels.length === 0 && (
							<p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
								Все позиции по топливу в безопасной зоне.
							</p>
						)}

						{lowStockFuels.map(fuel => (
							<div
								key={fuel.id}
								className="rounded-lg border border-amber-200 bg-amber-50 p-3"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-medium text-amber-900">
										{fuel.brand}
									</p>
									<AlertTriangle
										size={16}
										className="text-amber-700"
									/>
								</div>
								<p className="mt-1 text-xs text-amber-800">
									Остаток: {fuel.stockQuantity} л
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="text-base font-semibold text-slate-900">
						Последние транзакции
					</h2>
					<div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
						{lastTransactions.length === 0 ? (
							<p className="p-4 text-sm text-slate-500">Пока нет транзакций.</p>
						) : (
							<ul className="divide-y divide-slate-200">
								{lastTransactions.map(transaction => (
									<li
										key={transaction.id}
										className="flex items-center justify-between gap-3 p-3"
									>
										<div>
											<p className="text-sm font-medium text-slate-900">
												{transaction.fuel?.brand ?? 'Без типа топлива'}
											</p>
											<p className="text-xs text-slate-500">
												{dateTimeFormatter.format(
													new Date(transaction.createdAt)
												)}
											</p>
										</div>

										<div className="text-right">
											<p className="text-sm font-semibold text-slate-900">
												{moneyFormatter.format(
													toNumber(transaction.totalPrice)
												)}
											</p>
											<p className="text-xs text-slate-500">
												{litresFormatter.format(toNumber(transaction.litres))}{' '}
												л, колонка #{transaction.pumpNumber}
											</p>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<h2 className="text-base font-semibold text-slate-900">
						Быстрые действия
					</h2>
					<div className="mt-3 grid gap-2">
						<Link
							to="/transactions"
							className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
						>
							<span>Перейти к транзакциям</span>
							<Activity size={16} />
						</Link>

						<Link
							to="/fuels"
							className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
						>
							<span>Проверить остатки</span>
							<Gauge size={16} />
						</Link>

						{isAdmin && (
							<Link
								to="/users"
								className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
							>
								<span>Управление пользователями</span>
								<Users size={16} />
							</Link>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

export default Dashboard
