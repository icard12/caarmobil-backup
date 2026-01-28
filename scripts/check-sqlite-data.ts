import { PrismaClient as SQLiteClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
    const dbPath = path.resolve(__dirname, '../prisma/dev.db')
    const sqlite = new SQLiteClient({
        datasources: {
            db: {
                url: `file:${dbPath}`
            }
        }
    })

    try {
        const products = await sqlite.product.count()
        const users = await sqlite.user.count()
        const transactions = await sqlite.transaction.count()

        console.log('Dados no SQLite:')
        console.log(`Produtos: ${products}`)
        console.log(`Usuários: ${users}`)
        console.log(`Transações: ${transactions}`)
    } catch (e) {
        console.error('Erro ao ler SQLite:', e)
    } finally {
        await sqlite.$disconnect()
    }
}

main()
