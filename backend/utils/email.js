let resend = null;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendPasswordResetEmail = async (email, name, code) => {
  const client = getResend();
  if (!client) { console.log('Resend not configured, skipping email'); return; }

  await client.emails.send({
    from: 'StudyMart <onboarding@resend.dev>',
    to: email,
    subject: 'Your StudyMart Password Reset Code',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:#2563eb;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">StudyMart</h1>
          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Bangladesh's Student Marketplace</p>
        </div>
        <div style="padding:32px 24px;background:#f9fafb;border-radius:0 0 12px 12px;">
          <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Password Reset Request</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Hi ${name}, use the code below to reset your password. Expires in <strong>15 minutes</strong>.</p>
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Reset Code</p>
            <p style="color:#2563eb;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;">${code}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">If you didn't request this, ignore this email.</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">— The StudyMart Team</p>
        </div>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, name) => {
  const client = getResend();
  if (!client) return;

  await client.emails.send({
    from: 'StudyMart <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to StudyMart! 🎓',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:#2563eb;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Welcome to StudyMart!</h1>
        </div>
        <div style="padding:32px 24px;background:#f9fafb;border-radius:0 0 12px 12px;">
          <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Hi ${name}! 👋</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">You're now part of Bangladesh's largest student marketplace.</p>
          <div style="text-align:center;margin-top:24px;">
            <a href="https://studymartbd.shop" style="background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Go to StudyMart</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:20px 0 0;text-align:center;">— The StudyMart Team</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
