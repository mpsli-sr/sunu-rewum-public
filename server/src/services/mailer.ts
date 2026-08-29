import nodemailer from 'nodemailer';

declare module 'nodemailer';

// Configuration du transport SMTP – à adapter avec vos identifiants réels
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.protonmail.ch',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER || 'mpsli_adm@proton.me',
    pass: process.env.SMTP_PASS || 'votre_mot_de_passe',
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"SUNU REWUM" <${process.env.SMTP_USER || 'mpsli_adm@proton.me'}>`,
      to,
      subject,
      html,
    });
    console.log('📧 Email envoyé : %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erreur envoi email :', error);
    throw error;
  }
}
