// import { Resend } from "resend"

// const resend = new Resend(process.env.RESEND_API_KEY)

// export async function sendRecruiterEmail(email, username, password) {
//   try {
//     await resend.emails.send({
//       from: "MouldMakingTech <no-reply@fitnessfest.in>", 
//       to: email,
//       subject: "Your Supplier Account is Ready 🚀",
//       html: `
//         <div style="font-family:Arial;padding:20px">
//           <h2>Welcome to MouldMakingTech</h2>
//           <p>Your supplier account has been created successfully.</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Username:</strong> ${username}</p>
//           <p><strong>Password:</strong> ${password}</p>
//           <br/>
//           <p>Please login and change your password.</p>
//         </div>
//       `,
//     })
//   } catch (error) {
//     console.error("Email failed:", error)
//   }
// }


import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRecruiterEmail(email, username, password) {
  try {
    await resend.emails.send({
      from: "MouldMakingTech <no-reply@fitnessfest.in>",
      to: email,
      subject: "Your Supplier Account is Ready 🚀",
      html: `
      <div style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;">
        
        <!-- HEADER -->
        <div style="background-color:#0F5B78;padding:20px;text-align:center;">
          <img 
            src="https://res.cloudinary.com/dlkuk7rok/image/upload/v1771244281/mould-tech/xoskdfqbu9ihxzzyhd9e.jpg" 
            alt="MouldMakingTech"
            style="max-width:100%;height:auto;border-radius:6px;"
          />
        </div>

        <!-- BODY -->
        <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:10px;box-shadow:0 8px 20px rgba(0,0,0,0.08);overflow:hidden;">
          
          <div style="padding:30px;">
            
            <h2 style="color:#0F5B78;margin-bottom:10px;">
              Welcome to MouldMakingTech 🚀
            </h2>

            <p style="color:#555;font-size:14px;line-height:1.6;">
              Your supplier account has been successfully created.
              Below are your login credentials:
            </p>

            <!-- CREDENTIAL BOX -->
            <div style="margin:25px 0;padding:20px;background:#f8fafc;border-left:4px solid #B30F24;border-radius:6px;">
              <p style="margin:6px 0;font-size:14px;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="margin:6px 0;font-size:14px;">
                <strong>Username:</strong> ${username}
              </p>
              <p style="margin:6px 0;font-size:14px;">
                <strong>Password:</strong> ${password}
              </p>
            </div>

            <!-- BUTTON -->
            <div style="text-align:center;margin-top:30px;">
              <a href="https://mouldmakingtech.com/login"
                 style="display:inline-block;background-color:#B30F24;color:#ffffff;
                        padding:12px 25px;border-radius:6px;
                        text-decoration:none;font-weight:bold;">
                Login to Your Account
              </a>
            </div>

            <p style="margin-top:25px;color:#777;font-size:13px;">
              For security reasons, please change your password immediately after login.
            </p>

          </div>

          <!-- FOOTER -->
          <div style="background:#083A54;padding:15px;text-align:center;color:#ffffff;font-size:12px;">
            © ${new Date().getFullYear()} MouldMakingTech. All rights reserved.
          </div>

        </div>
      </div>
      `,
    })
  } catch (error) {
    console.error("Email failed:", error)
  }
}