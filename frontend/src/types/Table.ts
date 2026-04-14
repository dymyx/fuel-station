import type { ReactNode } from 'react'

export type Column<T> = {
	key: string
	title: string
	className?: string
	render: (row: T) => ReactNode
}

export type TableProps<T> = {
	columns: Column<T>[]
	rows: T[]
	rowKey: (row: T) => string | number
	emptyText?: string
}
