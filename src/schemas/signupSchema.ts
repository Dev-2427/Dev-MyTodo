import z from "zod";

export const usernameValidation = z
  .string()
  .trim()
  .min(3, { message: "Username must be atleast 3 characters long" })
  .max(20, { message: "Username must be atmost 20 characters long" })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers, and underscores are allowed" })
  .nonempty({ message: "Username is required" })

export const emailValidation = z
.string().email({ message: "Invalid email address" }).trim().toLowerCase()


export const passwordValidation = z
  .string()
  .trim()
  .min(8, { message: "Password must be atleast 8 characters long" })
  .max(64, { message: "Password must be atmost 64 characters long" })

export const signupSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: passwordValidation
})

export const changeUsernameSchema = z.object({
  username: usernameValidation,
});

export const changePasswordSchema = z.object({
  oldPassword: passwordValidation,
  newPassword: passwordValidation
});
export const forgotPasswordSchema = z.object({
  newPassword: passwordValidation,
  confirmNewPassword: passwordValidation
});
export const emailSchema = z.object({
  email: emailValidation
});


