import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL
// The '@neondatabase/serverless' module replaces Node.js 'crypto' and 'net' modules with Web APIs!
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma