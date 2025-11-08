import nodemailer from 'nodemailer'
import dotenv from 'dotenv'


dotenv.config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

    console.log("Transporter created", transporter)


transporter.sendMail({
    from: `"Pranay Jain" <${process.env.EMAIL_USER}>`,
    to: 'jainpranay12345@gmail.com',
    subject: 'Test Email',
    html: '<h1>Hello World</h1>'
})
.then(() => {
    console.log("Email sent successfully")
})
.catch((err) => {
    console.log("Email sent failed", err)
})
