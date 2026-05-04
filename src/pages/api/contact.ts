import type { APIRoute } from 'astro';
import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export const prerender = false;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
}

const ALLOWED_TOPICS = new Set([
  '合作 · Collaboration',
  '贊助 · Sponsorship',
  '邀請工作坊 · Workshop invite',
  '媒體訪問 · Press',
  '其他 · Other',
]);

function trim(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env: Record<string, unknown> } }).runtime?.env ?? {};
  const sender = env.CONTACT_SENDER as string | undefined;
  const recipient = env.CONTACT_RECIPIENT as string | undefined;
  const binding = env.SEB as { send: (m: EmailMessage) => Promise<void> } | undefined;

  if (!sender || !recipient || !binding) {
    return Response.json(
      { ok: false, error: 'mail_not_configured' },
      { status: 503 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const name = trim(payload.name, 80);
  const email = trim(payload.email, 254);
  const topicRaw = trim(payload.topic, 64);
  const message = trim(payload.message, 4000);

  if (!name || !email || !message) {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ ok: false, error: 'bad_email' }, { status: 400 });
  }

  const topic = ALLOWED_TOPICS.has(topicRaw) ? topicRaw : '其他 · Other';
  const msg = createMimeMessage();
  msg.setSender({ name: 'Kóng台語 跳Swing 表單', addr: sender });
  msg.setRecipient(recipient);
  msg.setHeader('Reply-To', email);
  msg.setSubject(`[Kongswing 聯絡] ${topic} · ${name}`);
  msg.addMessage({
    contentType: 'text/plain',
    data: [
      `主題 / Topic: ${topic}`,
      `姓名 / Name: ${name}`,
      `Email: ${email}`,
      '',
      '訊息 / Message:',
      message,
      '',
      '---',
      '由 kongswing.cc 聯絡表單寄出',
    ].join('\n'),
  });

  try {
    await binding.send(new EmailMessage(sender, recipient, msg.asRaw()));
  } catch (err) {
    console.error('contact send failed', err);
    return Response.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return Response.json({ ok: true });
};
