import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Script para importar alguns dados básicos iniciais se necessário
// Já que temos o Postgres limpo e o SQLite inacessível via Prisma simultaneamente
async function seed() {
    const pg = new PrismaClient()
    try {
        console.log('Criando usuário administrador padrão...')
        await pg.user.upsert({
            where: { email: 'admin@admin.com' },
            update: {},
            create: {
                name: 'Administrador',
                email: 'admin@admin.com',
                password: 'admin', // Você poderá mudar depois
                role: 'admin'
            }
        })
        console.log('Usuário criado!')
    } catch (e) {
        console.error(e)
    } finally {
        await pg.$disconnect()
    }
}

seed()
