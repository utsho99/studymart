const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, name, code) => {
  await resend.emails.send({
    from: 'StudyMart <onboarding@resend.dev>',
    to: email,
    subject: 'Your StudyMart Password Reset Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff;">
        <div style="background: #2563eb; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">StudyMart</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Bangladesh's Student Marketplace</p>
        </div>
        <div style="padding: 32px 24px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Password Reset Request</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Hi ${name}, use the code below to reset your password. This code expires in <strong>15 minutes</strong>.</p>
          
          <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
            <p style="color: #2563eb; font-size: 40px; font-weight: 800; letter-spacing: 12px; margin: 0;">${code}</p>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">— The StudyMart Team</p>
        </div>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, name) => {
  await resend.emails.send({
    from: 'StudyMart <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to StudyMart! 🎓',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Welcome to StudyMart!</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Bangladesh's Student Marketplace</p>
        </div>
        <div style="padding: 32px 24px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Hi ${name}! 👋</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">You're now part of Bangladesh's largest student marketplace. Here's what you can do:</p>
          
          <div style="space-y: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <span style="font-size: 20px;">📚</span>
              <div><strong style="color: #111827; font-size: 14px;">Buy & Sell</strong><br><span style="color: #6b7280; font-size: 13px;">Books, notes, calculators and more</span></div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <span style="font-size: 20px;">📝</span>
              <div><strong style="color: #111827; font-size: 14px;">Share Notes & PYQs</strong><br><span style="color: #6b7280; font-size: 13px;">Help fellow students with study materials</span></div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <span style="font-size: 20px;">🎓</span>
              <div><strong style="color: #111827; font-size: 14px;">Find My Senior</strong><br><span style="color: #6b7280; font-size: 13px;">Connect with senior students for guidance</span></div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://studymartbd.shop" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to StudyMart</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0; text-align: center;">— The StudyMart Team</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
