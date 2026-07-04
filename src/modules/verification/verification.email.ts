import { sendEmail } from "../../shared/email/email.service";

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify/register?token=${token}`;

  return sendEmail({
    to: "raomahmoodhassan147@gmail.com",
    subject: "Verify your email",
    html: `
      <h2>Verify your ${email}account</h2>

      <p>Please click below.</p>

      <a href="${url}">
        Verify Email
      </a>

      <p>This link expires in 15 minutes.</p>
    `,
  });
};