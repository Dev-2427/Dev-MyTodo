import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/verifyEmailForPassword";

export async function sendVerifyEmail(email: string, username: string, verifyCode: string) {
  try {
    await resend.emails.send({
      from: 'MyTodo <onboarding@resend.dev>',
      to: email,
      subject: 'MyTodo | verification code:',
      react: VerificationEmail({ username, otp: verifyCode })
    });
    
    return { success: true, message: "Verification email sent successfully" }
  } catch (error) {
    console.log("error sending mail", error);
    return { success: false, message: "Failed to send verification email" }

  }
}