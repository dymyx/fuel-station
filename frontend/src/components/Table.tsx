import type { TableProps } from '../types/Table'

function Table<T>({
	columns,
	rows,
	rowKey,
	emptyText = 'Нет данных'
}: TableProps<T>) {
	if (!rows.length) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
				{emptyText}
			</div>
		)
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
			<table className="min-w-full text-sm">
				<thead className="bg-slate-50">
					<tr>
						{columns.map(col => (
							<th
								key={col.key}
								className={`px-4 py-3 text-left font-semibold text-slate-600 ${col.className ?? ''}`}
							>
								{col.title}
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{rows.map(row => (
						<tr
							key={rowKey(row)}
							className="border-t border-slate-100 hover:bg-slate-50"
						>
							{columns.map(col => (
								<td
									key={col.key}
									className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}
								>
									{col.render(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default Table
