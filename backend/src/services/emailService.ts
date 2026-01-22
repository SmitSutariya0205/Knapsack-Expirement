import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
});

export const sendVerificationEmail = async (email: string, code: string) => {
    // If no credentials, log to console (Dev mode)
    console.log('[EMAIL DEBUG] Checking credentials...');
    console.log(`[EMAIL DEBUG] User: ${process.env.SMTP_USER ? 'Present' : 'Missing'}`);
    console.log(`[EMAIL DEBUG] Pass: ${process.env.SMTP_PASS ? 'Present' : 'Missing'}`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[EMAIL DEV MODE] 📨 To: ${email} | Code: ${code}`);
        return true;
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your Knapsack Experiment Verification Code',
            text: `Your verification code is: ${code}. It expires in 10 minutes.`,
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
        });
        console.log(`[EMAIL SENT] 📨 To: ${email}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send email:', error);
        // If we're in dev/test, fallback to console so flow isn't blocked
        console.log(`[EMAIL FALLBACK] 📨 To: ${email} | Code: ${code}`);
        return false;
    }
};
