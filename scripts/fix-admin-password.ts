import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function fixAdmin() {
    const pg = new PrismaClient()
    try {
        const hashedPassword = await bcrypt.hash('admin', 10)
        await pg.user.upsert({
            where: { email: 'admin@admin.com' },
            update: {
                password: hashedPassword
            },
            create: {
                name: 'Administrador',
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'admin'
            }
        })
        console.log('✅ Senha do admin@admin.com atualizada com sucesso!')
    } catch (e) {
        console.error('Erro ao atualizar admin:', e)
    } finally {
        await pg.$disconnect()
    }
}

fixAdmin()
