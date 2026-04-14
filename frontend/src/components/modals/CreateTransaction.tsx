import { useMemo, useState } from 'react'
import apiClient from '../../api/axios'
import type { Fuel } from '../../types/index'
import toast from 'react-hot-toast'

type CreateTransactionModalProps = {
	open: boolean
	fuels: Fuel[]
	onClose: () => void
	onCreated: () => Promise<void> | void
}

const CreateTransactionModal = ({
	open,
	fuels,
	onClose,
	onCreated
}: CreateTransactionModalProps) => {
	const [fuelId, setFuelId] = useState('')
	const [litres, setLitres] = useState('')
	const [pumpNumber, setPumpNumber] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const selectedFuel = useMemo(
		() => fuels.find(f => f.id === Number(fuelId)),
		[fuels, fuelId]
	)

	const estimatedTotal = useMemo(() => {
		const l = Number(litres)
		if (!selectedFuel || Number.isNaN(l) || l <= 0) return null
		return l * selectedFuel.pricePerLiter
	}, [litres, selectedFuel])

	if (!open) return null

	const reset = () => {
		setFuelId('')
		setLitres('')
		setPumpNumber('')
		setError(null)
	}

	const handleClose = () => {
		if (loading) return
		reset()
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		const parsedFuelId = Number(fuelId)
		const parsedLitres = Number(litres)
		const parsedPumpNumber = Number(pumpNumber)

		if (!parsedFuelId) return setError('Выберите тип топлива')
		if (Number.isNaN(parsedLitres) || parsedLitres <= 0) {
			return setError('Литры должны быть больше 0')
		}
		if (
			Number.isNaN(parsedPumpNumber) ||
			parsedPumpNumber < 1 ||
			parsedPumpNumber > 50
		) {
			return setError('Номер колонки должен быть от 1 до 50')
		}

		try {
			setLoading(true)
			await apiClient.post('/transactions', {
				fuelId: parsedFuelId,
				litres: parsedLitres,
				pumpNumber: parsedPumpNumber
			})
			await onCreated()
			toast.success('Транзакция создана')
			handleClose()
		} catch {
			setError('Не удалось создать транзакцию')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
				<h2 className="mb-4 text-xl font-semibold">Добавить транзакцию</h2>

				<form
					onSubmit={handleSubmit}
					className="space-y-3"
				>
					<select
						value={fuelId}
						onChange={e => setFuelId(e.target.value)}
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					>
						<option value="">Выберите топливо</option>
						{fuels.map(f => (
							<option
								key={f.id}
								value={f.id}
							>
								{f.brand} ({f.stockQuantity} л)
							</option>
						))}
					</select>

					<input
						type="number"
						step="0.01"
						min="0.01"
						value={litres}
						onChange={e => setLitres(e.target.value)}
						placeholder="Литры"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					/>

					<input
						type="number"
						min="1"
						max="50"
						value={pumpNumber}
						onChange={e => setPumpNumber(e.target.value)}
						placeholder="Номер колонки"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					/>

					{estimatedTotal !== null && (
						<p className="text-sm text-slate-600">
							Ориентировочная сумма: {estimatedTotal.toFixed(2)} ₽
						</p>
					)}

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
							{loading ? 'Создание...' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateTransactionModal
