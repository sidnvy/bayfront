import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Declare environment variable type
declare global {
  interface ImportMetaEnv {
    RESEND_API_KEY: string;
  }
}

export const config = {
  runtime: 'edge'
};

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, phone, message } = data;

    const { data: emailData, error } = await resend.emails.send({
      from: 'Bayfront Website <onboarding@resend.dev>',
      // to: ['bayfront@ibayfront.com'],  // Replace with your email
      to: ['sidnvy@gmail.com'],  // Replace with your email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 