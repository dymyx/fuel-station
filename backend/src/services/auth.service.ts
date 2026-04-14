import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { userRepository } from '../repositories/user.repository'
import { AppError } from '../utils/AppError'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const register = async (userData: Prisma.UserCreateInput) => {
	const existingUser = await userRepository.findByEmail(userData.email)
	if (existingUser) {
		throw new AppError('Пользователь с таким email уже существует', 400)
	}

	const hashedPassword = await bcrypt.hash(userData.password, 10)

	const newUser = await userRepository.create({
		...userData,
		password: hashedPassword
	})

	const { password, ...userWithoutPassword } = newUser
	return userWithoutPassword
}

export const login = async (userData: Prisma.UserCreateInput) => {
	const user = await userRepository.findByEmail(userData.email)

	if (!user) {
		throw new AppError('Введены неверные данные', 401)
	}

	const isPassswordCorrect = await bcrypt.compare(
		userData.password,
		user.password
	)

	if (!isPassswordCorrect) {
		throw new AppError('Введены неверные данные', 401)
	}

	const token = jwt.sign(
		{
			id: user.id,
			role: user.role
		},
		process.env.JWT_ACCESS_SECRET as string
	)

	const { password, ...userWithoutPassword } = user
	return { userWithoutPassword, token }
}

export const getAllUsers = async () => {
	const allUsers = await userRepository.findAll()

	return allUsers
}

export const whoIAM = async (id: number) => {
	const user = await userRepository.findById(id)

	if (!user) {
		throw new AppError('Пользователь не найден', 404)
	}

	return user
}

export const updateUser = async (
	userId: number,
	userData: Prisma.UserUpdateInput
) => {
	const existingUser = await userRepository.findById(userId)

	if (!existingUser) {
		throw new AppError('Такого пользователя не существует', 404)
	}

	if (userData.email) {
		if (existingUser.email !== userData.email) {
			const existingEmail = await userRepository.findByEmail(
				userData.email as string
			)

			if (existingEmail) {
				throw new AppError('Email пользователя уже используется', 400)
			}
		}
	}

	const user = await userRepository.update(userId, userData)

	return user
}
export const deleteUser = async (userId: number) => {
	const existingUser = await userRepository.findById(userId)

	if (!existingUser) {
		throw new AppError('Такого пользователя не существует', 404)
	}

	await prisma.user.delete({
		where: {
			id: userId
		}
	})
}
