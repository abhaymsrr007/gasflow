import nodemailer from 'nodemailer';

// Development ke liye Ethereal (Fake SMTP)
// Production mein isko real provider (Resend/SendGrid) se replace karenge
export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env['EMAIL_USER'], // Hum isko terminal se set karenge
    pass: process.env['EMAIL_PASS'],
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env['EMAIL_FROM'] || '"GASFlow" <no-reply@gasflow.local>',
      to,
      subject,
      html,
    });
    console.log('📧 Email sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};