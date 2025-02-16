import emailjs from '@emailjs/browser';

export async function sendVerificationEmail(email: string, token: string) {
  const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  console.log('📨 Preparing to send email...');
  console.log('📧 Email:', email);
  console.log('🔗 Confirmation link:', confirmationLink);

  const templateParams = {
    to_email: email,
    confirmation_link: confirmationLink,
  };

  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log('✅ Email sent successfully:', response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}
