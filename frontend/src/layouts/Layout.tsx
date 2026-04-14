import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const Layout = () => {
	const { user, logout } = useAuthStore()
	const navigate = useNavigate()

	const linkBaseClass =
		'rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150'
	const linkClassName = ({ isActive }: { isActive: boolean }) =>
		isActive
			? `${linkBaseClass} bg-blue-900 text-white`
			: `${linkBaseClass} text-slate-600 hover:bg-slate-100 hover:text-slate-900`

	const quit = () => {
		logout()
		navigate('/auth/login')
	}

	return (
		<main className="flex min-h-screen w-full items-start bg-slate-100 text-slate-900">
			<aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
				<div className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-3">
					<p className="text-xs uppercase tracking-wide text-blue-900">
						Fuel CRM
					</p>
					<p className="mt-1 text-sm font-medium text-slate-800">
						{user?.firstName ?? 'Неизвестный'} {user?.lastName ?? 'Гость'}
					</p>
				</div>

				<nav className="flex flex-col gap-1">
					<NavLink
						to="/"
						end
						className={linkClassName}
					>
						Главная
					</NavLink>
					<NavLink
						to="/transactions"
						className={linkClassName}
					>
						Транзакции
					</NavLink>
					<NavLink
						to="/fuels"
						className={linkClassName}
					>
						Топливо
					</NavLink>
					{user?.role === 'ADMIN' && (
						<>
							<NavLink
								to="/users"
								className={linkClassName}
							>
								Пользователи
							</NavLink>
						</>
					)}
				</nav>

				<div className="mt-auto pt-6">
					<button
						onClick={quit}
						className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
					>
						Выход
					</button>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 justify-center p-4 sm:p-6">
				<div className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
					<Outlet />
				</div>
			</div>
		</main>
	)
}

export default Layout
