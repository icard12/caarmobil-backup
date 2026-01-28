import { PrismaClient } from '@prisma/client'

async function listUsers() {
    const pg = new PrismaClient()
    try {
        const users = await pg.user.findMany()
        console.log('--- Usuários no PostgreSQL ---')
        users.forEach(u => {
            console.log(`Nome: ${u.name} | Email: ${u.email} | Role: ${u.role}`)
        })
    } catch (e) {
        console.error('Erro ao listar usuários:', e)
    } finally {
        await pg.$disconnect()
    }
}

listUsers()
