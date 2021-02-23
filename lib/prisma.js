// Database access
import prismaClient from "@prisma/client"
const prisma = new prismaClient.PrismaClient()

async function exit(code) {
  await prisma.$disconnect()
  process.exit(code)
}

// Disconnect from database before exiting
process.on("SIGTERM", exit)
process.on("SIGINT", exit)
process.on("SIGUSR2", exit)

export default prisma
