import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRecruiterEmail(email, username, password) {
  try {
    await resend.emails.send({
      from: "MouldMakingTech <no-reply@fitnessfest.in>", 
      to: email,
      subject: "Your Supplier Account is Ready 🚀",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Welcome to MouldMakingTech</h2>
          <p>Your supplier account has been created successfully.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
          <br/>
          <p>Please login and change your password.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Email failed:", error)
  }
}