import sgMail from '@sendgrid/mail';

// Email configuration
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendVerificationEmail = async (email: string, code: string) => {
    // Check credentials
    if (!process.env.SENDGRID_API_KEY) {
        console.log('[EMAIL DEV MODE] No SENDGRID_API_KEY provided.');
        console.log(`[EMAIL DEV MODE] 📨 To: ${email} | Code: ${code}`);
        return true;
    }

    const msg = {
        to: email,
        from: 'knapsack.exp@gmail.com', // MUST MATCH Verified Sender in SendGrid
        subject: 'Your Knapsack Experiment Verification Code',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`[EMAIL SENT] 📨 To: ${email} via SendGrid`);
        return true;
    } catch (error: any) {
        console.error('[EMAIL ERROR] SendGrid failed:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        // Fallback for dev mode continuity if valid key but other error (e.g. unverified sender)
        console.log(`[EMAIL FALLBACK] 📨 To: ${email} | Code: ${code}`);
        return false;
    }
};
