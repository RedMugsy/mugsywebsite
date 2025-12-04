import nodemailer from 'nodemailer';
import { renderTemplate } from './templateService.js';

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined,
  tls: {
    ciphers: 'TLSv1.2',
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true'
  }
});

const defaultFrom = `${process.env.EMAIL_FROM_NAME || 'Red Mugsy'} <${process.env.EMAIL_FROM || 'info@redmugsy.com'}>`;
const apiBaseUrl = (process.env.API_BASE_URL || '').replace(/\/$/, '') || `http://localhost:${process.env.PORT || 3001}`;
const portalBase = (process.env.PROMOTER_PORTAL_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const promoterSigninUrl = (process.env.PROMOTER_SIGNIN_URL || `${portalBase}/#/treasure-hunt/promoter-signin`).replace(/\/$/, '');
const promoterResetUrl = (process.env.PROMOTER_RESET_URL || `${portalBase}/#/treasure-hunt/promoter-reset`).replace(/\/$/, '');

const verifyTransporter = async () => {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP_HOST is not configured. Emails will not be sent.');
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    return false;
  }
};

const htmlWrapper = (body, signature) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <div>${body.replace(/\n/g, '<br/>')}</div>
    ${signature ? `<p style="margin-top:24px;">${signature}</p>` : ''}
  </div>
`;

const textWrapper = (body, signature) => [body, signature].filter(Boolean).join('\n\n');

const sendEmail = async ({ to, subject, text, html }) => {
  const isReady = await verifyTransporter();
  if (!isReady) return;

  await transporter.sendMail({
    from: defaultFrom,
    to,
    subject,
    text,
    html
  });
};

export const sendPromoterVerificationEmail = async ({ to, name, token }) => {
  const verificationUrl = `${apiBaseUrl}/api/auth/verify/${token}`;
  const rendered = await renderTemplate('email-welcome', {
    name: name || 'there',
    verification_url: verificationUrl
  });

  const html = htmlWrapper(rendered.body, rendered.signature);
  const text = textWrapper(rendered.body, rendered.signature);

  await sendEmail({
    to,
    subject: rendered.title || 'Verify your Red Mugsy promoter email',
    text,
    html
  });
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${promoterResetUrl}?token=${token}`;
  const rendered = await renderTemplate('email-password-reset', {
    name: name || 'there',
    reset_url: resetUrl,
    token
  });

  const html = htmlWrapper(rendered.body, rendered.signature);
  const text = textWrapper(rendered.body, rendered.signature);

  await sendEmail({
    to,
    subject: rendered.title || 'Reset your Red Mugsy promoter password',
    text,
    html
  });
};

export const sendPromoterApprovalEmail = async ({ to, name }) => {
  const rendered = await renderTemplate('email-promoter-approved', {
    name: name || 'there',
    portal_url: promoterSigninUrl
  });

  const html = htmlWrapper(rendered.body, rendered.signature);
  const text = textWrapper(rendered.body, rendered.signature);

  await sendEmail({
    to,
    subject: rendered.title || 'Your Red Mugsy promoter account is approved',
    text,
    html
  });
};

export const sendPromoterRejectionEmail = async ({ to, name, reason }) => {
  const rendered = await renderTemplate('email-promoter-rejected', {
    name: name || 'there',
    reason: reason || 'No reason provided'
  });

  const html = htmlWrapper(rendered.body, rendered.signature);
  const text = textWrapper(rendered.body, rendered.signature);

  await sendEmail({
    to,
    subject: rendered.title || 'Update on your Red Mugsy promoter application',
    text,
    html
  });
};

export const sendPromoterSuspensionEmail = async ({ to, name, reason }) => {
  const rendered = await renderTemplate('email-promoter-suspended', {
    name: name || 'there',
    reason: reason || 'Policy review in progress'
  });

  const html = htmlWrapper(rendered.body, rendered.signature);
  const text = textWrapper(rendered.body, rendered.signature);

  await sendEmail({
    to,
    subject: rendered.title || 'Your Red Mugsy promoter account has been suspended',
    text,
    html
  });
};

export default {
  sendPromoterVerificationEmail,
  sendPasswordResetEmail,
  sendPromoterApprovalEmail,
  sendPromoterRejectionEmail,
  sendPromoterSuspensionEmail
};
