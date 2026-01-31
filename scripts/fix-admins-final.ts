import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function fixAdmins() {
    const pg = new PrismaClient()
    try {
        const hashedPassword = await bcrypt.hash('admin', 10)

        const emails = ['admin@admin.com', 'admin@callmobile.com']

        for (const email of emails) {
            await pg.user.upsert({
                where: { email },
                update: { password: hashedPassword },
                create: {
                    name: 'Administrador',
                    email,
                    password: hashedPassword,
                    role: 'admin'
                }
            })
        }

        console.log('✅ Usuários admin atualizados!')
    } catch (e) {
        console.error(e)
    } finally {
        await pg.$disconnect()
    }
}

fixAdmins()
