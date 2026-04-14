import React, { useEffect, useState } from 'react'
import apiClient from '../../api/axios'
import type { Fuel } from '../../types'
import toast from 'react-hot-toast'

type CreateFuelProps = {
	open: boolean
	mode: 'create' | 'edit'
	initialValues?: Fuel
	onClose: () => void
	onCreated: () => Promise<void> | void
}

const CreateFuelModal = ({
	open,
	mode,
	initialValues,
	onClose,
	onCreated
}: CreateFuelProps) => {
	const [brand, setBrand] = useState('')
	const [pricePerLiter, setPricePerLiter] = useState('')
	const [stockQuantity, setStockQuantity] = useState('')

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return

		if (mode === 'edit' && initialValues) {
			setBrand(initialValues.brand)
			setPricePerLiter(String(initialValues.pricePerLiter))
			setStockQuantity(String(initialValues.stockQuantity))
		} else {
			setBrand('')
			setPricePerLiter('')
			setStockQuantity('')
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

		const parsedBrand = brand
		const parsedPricePerLiter = Number(pricePerLiter)
		const parsedStockQuantity = Number(stockQuantity)

		if (!parsedBrand) return setError('Введите название топлива')

		if (Number.isNaN(parsedPricePerLiter) || parsedPricePerLiter < 0) {
			return setError('Литры должны быть больше 0')
		}
		if (
			Number.isNaN(parsedStockQuantity) ||
			parsedStockQuantity < 1 ||
			parsedStockQuantity > 20000
		) {
			return setError(
				'Количество запасов должно быть в диапозоне от 1 до 20000 литров'
			)
		}

		try {
			setLoading(true)

			const payload = {
				brand: parsedBrand,
				pricePerLiter: parsedPricePerLiter,
				stockQuantity: parsedStockQuantity
			}

			if (mode === 'edit') {
				if (!initialValues?.id) {
					throw new Error('Не найден id топлива для редактирования')
				}
				await apiClient.patch(`/fuels/${initialValues.id}`, payload)
			} else {
				await apiClient.post('/fuels/new', payload)
			}

			await onCreated()
			toast.success(mode === 'edit' ? 'Топливо обновлено' : 'Топливо создано')
			onClose()
		} catch {
			setError(
				mode === 'edit'
					? 'Не удалось обновить топливо'
					: 'Не удалось создать топливо'
			)
			toast.error(
				mode === 'edit'
					? 'Не удалось обновить топливо'
					: 'Не удалось создать топливо'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
				<h2 className="mb-4 text-xl font-semibold">
					{mode === 'edit' ? 'Редактировать топливо' : 'Добавить топливо'}
				</h2>

				<form
					onSubmit={handleSubmit}
					className="space-y-3"
				>
					<input
						type="text"
						value={brand}
						onChange={e => setBrand(e.target.value)}
						placeholder="Название топлива"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
					<input
						type="number"
						min="0.01"
						step="0.01"
						value={pricePerLiter}
						onChange={e => setPricePerLiter(e.target.value)}
						placeholder="Цена за литр топлива"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
					<input
						type="number"
						step="1"
						min="1"
						max="20000"
						value={stockQuantity}
						onChange={e => setStockQuantity(e.target.value)}
						placeholder="Запас литров топлива"
						className="w-full rounded-lg border border-slate-300 px-3 py-2"
					/>

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
									? 'Обновление...'
									: 'Создание...'
								: mode === 'edit'
									? 'Обновить'
									: 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateFuelModal
