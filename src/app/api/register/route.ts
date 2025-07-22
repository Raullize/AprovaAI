import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Data de nascimento inválida')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const { fullName, username, email, password, dateOfBirth } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'E-mail já está em uso' },
          { status: 409 }
        )
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Nome de usuário já está em uso' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        passwordHash,
        dateOfBirth: new Date(dateOfBirth),
        isPremium: false,
        isAdmin: false
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        dateOfBirth: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: newUser
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}