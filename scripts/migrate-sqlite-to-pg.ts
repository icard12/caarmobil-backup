import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PGClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
    const dbPath = path.resolve(__dirname, '../prisma/dev.db')

    // SQLite Client
    const sqlite = new SQLiteClient({
        datasources: {
            db: {
                url: `file:${dbPath}`
            }
        }
    })

    // Postgres Client
    const pg = new PGClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:808090@localhost:5432/sistema_de_gestao'
            }
        }
    })

    try {
        console.log('--- Iniciando Migração de Dados ---')

        // 1. Migrar Usuários
        const users = await sqlite.user.findMany()
        console.log(`Copiando ${users.length} usuários...`)
        for (const user of users) {
            await pg.user.upsert({
                where: { email: user.email },
                update: user,
                create: user,
            })
        }

        // 2. Migrar Produtos
        const products = await sqlite.product.findMany()
        console.log(`Copiando ${products.length} produtos...`)
        for (const product of products) {
            await pg.product.upsert({
                where: { id: product.id },
                update: product,
                create: product,
            })
        }

        // 3. Migrar Transações
        const transactions = await sqlite.transaction.findMany()
        console.log(`Copiando ${transactions.length} transações...`)
        for (const tx of transactions) {
            await pg.transaction.upsert({
                where: { id: tx.id },
                update: tx,
                create: tx,
            })
        }

        // 4. Migrar Ordens de Serviço (ServiceOrder)
        const serviceOrders = await sqlite.serviceOrder.findMany()
        console.log(`Copiando ${serviceOrders.length} ordens de serviço...`)
        for (const so of serviceOrders) {
            await pg.serviceOrder.upsert({
                where: { id: so.id },
                update: so,
                create: so,
            })
        }

        console.log('--- Migração Concluída com Sucesso! ---')
    } catch (error) {
        console.error('Erro durante a migração:', error)
    } finally {
        await sqlite.$disconnect()
        await pg.$disconnect()
    }
}

migrate()
