// // const transporter = require('../config/mailer');

// // async function sendEmailOtp(email, otp) {
// //   const mailOptions = {
// //     from: process.env.EMAIL_USER,
// //     to: email,
// //     subject: 'Freetym Email OTP Verification',
// //     text: `Your OTP for Freetym registration is: ${otp}`,
// //   };
// //   await transporter.sendMail(mailOptions);
// // }

// // module.exports = sendEmailOtp; 

// const transporter = require('../config/mailer');

// /**
//  * Sends an OTP email to the specified recipient.
//  *
//  * @param {string} email - Recipient's email address.
//  * @param {string} otp - OTP code to be sent.
//  * @returns {Promise<void>}
//  */
// async function sendEmailOtp(email, otp) {
//   try {
//     const mailOptions = {
//       from: `"Freetym Support" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `${otp} is the verification code for your Freetym account`,
// text: `
// Your one time password is ${otp}
// Please use this One Time Password (OTP) to verify your details. OTP is valid for 15 minutes. Do not share it with anyone.

// For any queries, you can reach out to us at support@Freetym.com
//       `.trim(),
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
//           <h2 style="color: #0a0a23;">Verify Your Freetym Account</h2>
//           <p>Your one time password is:</p>
//           <div style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px 20px; border-radius: 6px; display: inline-block;">
//             ${otp}
//           </div>
//           <p style="margin-top: 20px;">
//             Please use this One Time Password (OTP) to verify your details. 
//             <strong>OTP is valid for 15 minutes.</strong> 
//             Do not share it with anyone.
//           </p>
//           <p>
//             For any queries, you can reach out to us at 
//             <a href="mailto:support@Freetym.com" style="color: #1a73e8;">support@Freetym.com</a>
//           </p>
//           <hr style="margin: 30px 0;">
//           <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply.</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`OTP email sent to ${email}`);
//   } catch (error) {
//     console.error(`Failed to send OTP email to ${email}:`, error.message);
//     throw new Error('Failed to send OTP email.');
//   }
// }

// module.exports = sendEmailOtp;

const transporter = require('../config/mailer');

/**
 * Sends an OTP email to the specified recipient.
 *
 * @param {string} email - Recipient's email address.
 * @param {string} otp - OTP code to be sent.
 * @param {'verification' | 'reset'} purpose - Purpose of the OTP (e.g., 'verification' or 'reset').
 * @returns {Promise<void>}
 */
async function sendEmailOtp(email, otp, purpose = 'verification') {
  try {
    const subjectAction =
      purpose === 'verification' ? 'verification code for your Freetym account' : 'password reset code for your Freetym account';

    const mainMessage =
      purpose === 'verification'
        ? 'Please use this One Time Password (OTP) to verify your details.'
        : 'Please use this One Time Password (OTP) to reset your Freetym account password.';

    const mailOptions = {
      from: `"Freetym Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is the ${subjectAction}`,
      text: `
Your one time password is ${otp}
${mainMessage} OTP is valid for 10 minutes. Do not share it with anyone.

For any queries, you can reach out to us at support@Freetym.com
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #0a0a23;">Freetym Account ${purpose === 'verification' ? 'Verification' : 'Password Reset'}</h2>
          <p>Your one time password is:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px 20px; border-radius: 6px; display: inline-block;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">
            ${mainMessage} 
            <strong>OTP is valid for 10 minutes.</strong> 
            Do not share it with anyone.
          </p>
          <p>
            For any queries, you can reach out to us at 
            <a href="mailto:support@Freetym.com" style="color: #1a73e8;">support@Freetym.com</a>
          </p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error.message);
    throw new Error('Failed to send OTP email.');
  }
}

module.exports = sendEmailOtp;
