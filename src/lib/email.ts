export async function sendVerificationEmail(email: string, token: string) {
  const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        to_email: email,
        confirmation_link: confirmationLink,
      },
    }),
  });

  // Log full response body before attempting to parse it as JSON
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    console.log('EmailJS parsed response:', data);
  } catch (error) {
    console.error(`Error: ${error}`);

    console.error('Failed to parse EmailJS response:', text);
    return;
  }

  if (!response.ok) {
    console.error('EmailJS API error:', text);
  }
}
