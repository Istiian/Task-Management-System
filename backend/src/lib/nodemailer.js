import nodemailer from 'nodemailer';

// Sends a plain-text email using the SMTP credentials from environment variables.
// A transporter is created per call so config changes take effect without restart.
export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.verify(); // confirms the SMTP connection before sending

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};
