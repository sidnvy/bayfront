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

// Simple in-memory store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Rate limit settings
const RATE_LIMIT = 2; // Maximum 2 emails
const TIME_WINDOW = 3600000; // 1 hour in milliseconds

// Error messages for different languages
const errorMessages = {
  en: {
    rateLimited: 'Too many attempts. Please try again later.',
    requiredFields: 'Please fill in all required fields.',
    invalidEmail: 'Please enter a valid email address.',
    systemError: 'System error. Please try again later.'
  },
  ja: {
    rateLimited: '送信回数が多すぎます。しばらくしてからもう一度お試しください。',
    requiredFields: '必須項目をすべて入力してください。',
    invalidEmail: '有効なメールアドレスを入力してください。',
    systemError: 'システムエラーが発生しました。しばらくしてからもう一度お試しください。'
  },
  zh: {
    rateLimited: '发送次数过多，请稍后再试。',
    requiredFields: '请填写所有必填字段。',
    invalidEmail: '请输入有效的电子邮箱地址。',
    systemError: '系统错误，请稍后再试。'
  }
};

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userRateLimit = rateLimit.get(ip);

  // Clean up old entries
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > TIME_WINDOW) {
      rateLimit.delete(key);
    }
  }

  if (!userRateLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - userRateLimit.timestamp > TIME_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userRateLimit.count >= RATE_LIMIT) {
    return true;
  }

  userRateLimit.count++;
  return false;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Determine language from request URL
    const url = new URL(request.url);
    let lang = 'ja'; // default language
    if (url.pathname.startsWith('/en/')) {
      lang = 'en';
    } else if (url.pathname.startsWith('/zh/')) {
      lang = 'zh';
    }

    // Check rate limit
    if (isRateLimited(clientAddress)) {
      return new Response(JSON.stringify({ 
        error: errorMessages[lang].rateLimited
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { name, email, phone, message } = data;

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        error: errorMessages[lang].requiredFields
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: errorMessages[lang].invalidEmail
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Bayfront Website <bayfront@ibayfront.com>',
      to: ['bayfront@ibayfront.com'],
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
      return new Response(JSON.stringify({ error: errorMessages[lang].systemError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Determine language from request URL for error case
    const url = new URL(request.url);
    let lang = 'ja';
    if (url.pathname.startsWith('/en/')) {
      lang = 'en';
    } else if (url.pathname.startsWith('/zh/')) {
      lang = 'zh';
    }

    return new Response(JSON.stringify({ error: errorMessages[lang].systemError }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 