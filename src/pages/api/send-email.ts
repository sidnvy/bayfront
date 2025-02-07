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
      subject: `新联系表格提交 - ${name}`,
      html: `
        <h2>新联系表格提交</h2>
        <p><strong>姓名：</strong> ${name}</p>
        <p><strong>电子邮箱：</strong> ${email}</p>
        <p><strong>电话号码：</strong> ${phone || '未提供'}</p>
        <p><strong>留言内容：</strong></p>
        <p>${message}</p>
        <br>
        <p style="color: #666; font-size: 12px;">此邮件由Bayfront网站的联系表格自动发送。</p>
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