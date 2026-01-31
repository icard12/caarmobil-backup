
import { PrismaClient } from '@prisma/client'

async function check() {
    const pg = new PrismaClient()
    try {
        const products = await pg.product.count()
        const users = await pg.user.count()
        console.log(`PostgreSQL: ${products} produtos, ${users} usuários.`)
    } catch (e) {
        console.error('Erro ao conectar no Postgres:', e)
    } finally {
        await pg.$disconnect()
    }
}

check()
