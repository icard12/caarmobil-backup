import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    const emailToTest = 'caarmobilei@gmail.com';
    console.log('Testing SMTP with:', emailToTest);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: emailToTest,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful for', emailToTest);
    } catch (error: any) {
        console.error('❌ SMTP connection failed for', emailToTest, error.message);
    }
}

testEmail();
