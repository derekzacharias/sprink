import twilio from 'twilio';

export async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { skipped: true };
  const client = twilio(sid, token);
  return client.messages.create({ to, from, body });
}

// Placeholder for FCM push; implement server key or use client SDK with tokens.
export async function sendPush(_title, _body) {
  return { skipped: true };
}

