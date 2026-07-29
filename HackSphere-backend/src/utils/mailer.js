import nodemailer from "nodemailer";

const createTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const user = process.env.SMTP_USER.trim();
    const pass = process.env.SMTP_PASS.trim();

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback Ethereal test account for local development
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch {
    return null;
  }
};

export const sendJudgeInvitationEmail = async ({ toEmail, hackathonTitle, inviteLink }) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.log(`[Mail Fallback] Send Judge Invitation to ${toEmail}: ${inviteLink}`);
      return;
    }

    const info = await transporter.sendMail({
      from: `"HackSphere Platform" <${process.env.SMTP_USER || "noreply@hacksphere.com"}>`,
      to: toEmail,
      subject: `Invitation to Judge Hackathon: ${hackathonTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #1d6eeb;">HackSphere — Judge Invitation</h2>
          <p>Hello,</p>
          <p>You have been officially invited to serve as an expert judge for <strong>${hackathonTitle}</strong> on HackSphere!</p>
          <p>Click the link below to register your judge account and access your evaluation dashboard:</p>
          <div style="margin: 25px 0;">
            <a href="${inviteLink}" style="background-color: #1d6eeb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation & Register as Judge
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser: <br><a href="${inviteLink}">${inviteLink}</a></p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #888;">If you did not expect this invitation, you may safely ignore this email.</p>
        </div>
      `,
    });

    console.log(`[Mail Sent] Judge Invitation sent to ${toEmail}. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Ethereal Preview URL] ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[Mail Error] Failed to send email to ${toEmail}:`, err.message);
  }
};

export const sendJudgeAssignmentNotificationEmail = async ({ toEmail, hackathonTitle, dashboardLink }) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.log(`[Mail Fallback] Send Assignment Notification to ${toEmail}: ${dashboardLink}`);
      return;
    }

    const info = await transporter.sendMail({
      from: `"HackSphere Platform" <${process.env.SMTP_USER || "noreply@hacksphere.com"}>`,
      to: toEmail,
      subject: `Assigned as Judge for ${hackathonTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #1d6eeb;">HackSphere — Judge Assignment</h2>
          <p>Hello,</p>
          <p>You have been assigned to the evaluation panel for <strong>${hackathonTitle}</strong>!</p>
          <p>Access your judge workspace to review assigned project entries and submit scores:</p>
          <div style="margin: 25px 0;">
            <a href="${dashboardLink}" style="background-color: #1d6eeb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Open Judge Dashboard
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Link: <a href="${dashboardLink}">${dashboardLink}</a></p>
        </div>
      `,
    });

    console.log(`[Mail Sent] Judge Assignment Notification sent to ${toEmail}. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Ethereal Preview URL] ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[Mail Error] Failed to send notification email to ${toEmail}:`, err.message);
  }
};

export const sendTeamInviteEmail = async ({ toEmail, teamName, inviteCode, hackathonTitle }) => {
  try {
    const transporter = await createTransporter();
    const joinLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?joinCode=${inviteCode}`;

    if (!transporter) {
      console.log(`[Mail Fallback] Send Team Invitation to ${toEmail}: Team "${teamName}" Code: ${inviteCode}`);
      return;
    }

    const info = await transporter.sendMail({
      from: `"HackSphere Platform" <${process.env.SMTP_USER || "noreply@hacksphere.com"}>`,
      to: toEmail,
      subject: `Team Invitation for ${hackathonTitle} — Join "${teamName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #1d6eeb;">HackSphere — Team Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to join team <strong>"${teamName}"</strong> for <strong>${hackathonTitle}</strong>!</p>
          <div style="background-color: #f5f7fb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 5px 0;">Team Invite Code</p>
            <p style="font-size: 24px; font-weight: bold; color: #1d6eeb; letter-spacing: 2px; margin: 0;">${inviteCode}</p>
          </div>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${joinLink}" style="background-color: #1d6eeb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Join Team Now
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Or enter code <strong>${inviteCode}</strong> manually on your HackSphere dashboard.</p>
        </div>
      `,
    });

    console.log(`[Mail Sent] Team Invitation sent to ${toEmail}. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Ethereal Preview URL] ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[Mail Error] Failed to send team invite email to ${toEmail}:`, err.message);
  }
};
