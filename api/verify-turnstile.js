// public/api/verify-turnstile.js
// Node.js/Express-style handler for Vercel/Netlify or custom server

const TURNSTILE_SECRET_KEY = '0x4AAAAAABku1LjVfhq5cP0uQYqfZ5MNdp0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'No token provided' });
  }
  try {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`
    });
    const data = await verifyRes.json();
    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, error: data['error-codes'] });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
} 