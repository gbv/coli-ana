// Database access
import prismaClient from "@prisma/client"
const prisma = new prismaClient.PrismaClient()

/**
 * Manually create GIN index on memberList since Prisma currently does not support this.
 */
prisma.$executeRaw("CREATE INDEX data_memberList_gin_idx ON data USING gin (\"memberList\");")
  .then(() => { console.log("GIN Index on memberList created.") })
  .catch(() => { })

export default prisma
