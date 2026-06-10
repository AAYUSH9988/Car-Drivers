import https from 'https';
import { env } from '../config/env';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FROM = { name: 'GoPilot', email: env.BREVO_FROM_EMAIL };

const sendEmail = ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender:      FROM,
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    });

    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path:     '/v3/smtp/email',
        method:   'POST',
        headers: {
          'api-key':        env.BREVO_API_KEY ?? '',
          'content-type':   'application/json',
          'content-length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Brevo API error ${res.statusCode ?? 'unknown'}: ${data}`));
          }
        });
      },
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

export const sendVerificationEmail = (user: { name: string; email: string }, token: string): Promise<void> => {
  const url = `${env.FRONTEND_URL}/verify-email/${token}`;
  return sendEmail({
    to:      user.email,
    subject: 'Verify your GoPilot email',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Welcome to GoPilot, ${user.name}!</h2>
        <p>Click the button below to verify your email. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#E8B84B;color:#0A0B14;font-weight:600;border-radius:8px;text-decoration:none">Verify Email</a>
        <p style="color:#94A3B8;font-size:13px;margin-top:24px">If you didn't create a GoPilot account, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = (user: { name: string; email: string }, token: string): Promise<void> => {
  const url = `${env.FRONTEND_URL}/reset-password/${token}`;
  return sendEmail({
    to:      user.email,
    subject: 'Reset your GoPilot password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Password Reset Request</h2>
        <p>Hi ${user.name}, click below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#E8B84B;color:#0A0B14;font-weight:600;border-radius:8px;text-decoration:none">Reset Password</a>
        <p style="color:#94A3B8;font-size:13px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = (
  user: { name: string; email: string },
  booking: { bookingReference: string; pickupLocation: string; dropLocation: string; startTime: Date; totalAmount: number },
  driverName: string,
): Promise<void> => {
  return sendEmail({
    to:      user.email,
    subject: `Booking Confirmed — ${booking.bookingReference}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Your booking is confirmed!</h2>
        <p>Hi ${user.name}, your driver has been booked.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#475569">Booking Ref:</td><td style="font-weight:600">${booking.bookingReference}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Driver:</td><td style="font-weight:600">${driverName}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Pickup:</td><td>${booking.pickupLocation}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Drop-off:</td><td>${booking.dropLocation}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Start:</td><td>${new Date(booking.startTime).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Amount:</td><td style="font-weight:600">₹${booking.totalAmount}</td></tr>
        </table>
      </div>
    `,
  });
};

export const sendBookingCancellationEmail = (
  user: { name: string; email: string },
  bookingReference: string,
): Promise<void> => {
  return sendEmail({
    to:      user.email,
    subject: `Booking Cancelled — ${bookingReference}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Booking Cancelled</h2>
        <p>Hi ${user.name}, your booking <strong>${bookingReference}</strong> has been cancelled.</p>
      </div>
    `,
  });
};

export const sendAdminNotificationEmail = (opts: { to: string; name: string; title: string; message: string }): Promise<void> => {
  return sendEmail({
    to:      opts.to,
    subject: `[GoPilot] ${opts.title}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">${opts.title}</h2>
        <p>Hi ${opts.name},</p>
        <p>${opts.message}</p>
      </div>
    `,
  });
};
