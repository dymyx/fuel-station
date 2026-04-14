import ReactDOM from 'react-dom/client'
import './index.css'
import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import { Login } from './pages/Login'
import Transactions from './pages/Transactions'
import Fuel from './pages/Fuel'
import Users from './pages/Users'
import { useAuthStore } from './store/useAuthStore'
import { Toaster } from 'react-hot-toast'

const RequireAuth = () => {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	return isAuthenticated ? (
		<Layout />
	) : (
		<Navigate
			to="/auth/login"
			replace
		/>
	)
}

const RequireGuest = () => {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	return isAuthenticated ? (
		<Navigate
			to="/"
			replace
		/>
	) : (
		<Login />
	)
}

const router = createBrowserRouter([
	{
		path: '/',
		element: <RequireAuth />,
		children: [
			{ path: '/', element: <Dashboard /> },
			{ path: '/transactions', element: <Transactions /> },
			{ path: '/fuels', element: <Fuel /> },
			{ path: '/users', element: <Users /> }
		]
	},
	{
		path: '/auth/login',
		element: <RequireGuest />
	}
])

const App = () => {
	const initializeAuth = useAuthStore(s => s.initializeAuth)
	const isLoading = useAuthStore(s => s.isLoading)

	useEffect(() => {
		void initializeAuth()
	}, [initializeAuth])

	if (isLoading) {
		return <div className="p-6">Проверка авторизации...</div>
	}

	return (
		<>
			<RouterProvider router={router} />
			<Toaster position="top-center" />
		</>
	)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
