import https from 'https';

const FROM = {
  name:  'GoPilot',
  email: process.env.BREVO_FROM_EMAIL || 'noreply@gopilot.app',
};

const sendEmail = ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender:      FROM,
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'api-key':      process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail({
    to:      user.email,
    subject: 'Verify your GoPilot email',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Welcome to GoPilot, ${user.name}!</h2>
        <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#E8B84B;color:#0A0B14;font-weight:600;border-radius:8px;text-decoration:none">Verify Email</a>
        <p style="color:#94A3B8;font-size:13px;margin-top:24px">If you didn't create a GoPilot account, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail({
    to:      user.email,
    subject: 'Reset your GoPilot password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Password Reset Request</h2>
        <p>Hi ${user.name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#E8B84B;color:#0A0B14;font-weight:600;border-radius:8px;text-decoration:none">Reset Password</a>
        <p style="color:#94A3B8;font-size:13px;margin-top:24px">If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (user, booking, driver) => {
  await sendEmail({
    to:      user.email,
    subject: `Booking Confirmed — ${booking.bookingReference}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Your booking is confirmed!</h2>
        <p>Hi ${user.name}, your driver has been booked.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#475569">Booking Ref:</td><td style="font-weight:600">${booking.bookingReference}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Driver:</td><td style="font-weight:600">${driver?.user?.name || 'Assigned driver'}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Pickup:</td><td>${booking.pickupLocation}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Drop-off:</td><td>${booking.dropLocation}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Start:</td><td>${new Date(booking.startTime).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Amount:</td><td style="font-weight:600">₹${booking.totalAmount}</td></tr>
        </table>
        <p style="color:#94A3B8;font-size:13px">Have a safe journey!</p>
      </div>
    `,
  });
};

export const sendBookingCancellationEmail = async (user, booking) => {
  await sendEmail({
    to:      user.email,
    subject: `Booking Cancelled — ${booking.bookingReference}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#0A0B14">Booking Cancelled</h2>
        <p>Hi ${user.name}, your booking <strong>${booking.bookingReference}</strong> has been cancelled.</p>
        <p style="color:#94A3B8;font-size:13px">If you have any questions, contact our support team.</p>
      </div>
    `,
  });
};
