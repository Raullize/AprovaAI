import NextAuth from 'next-auth'
import { UserRole, SubscriptionPlan } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionPlan: SubscriptionPlan
      role: UserRole
      xp: number
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    subscriptionPlan: SubscriptionPlan
    role: UserRole
    xp: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    subscriptionPlan: SubscriptionPlan
    role: UserRole
    xp: number
  }
}
