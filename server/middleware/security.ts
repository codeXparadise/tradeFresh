import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import type { AuthUser } from '../../src/types/trade.ts';

try {
  process.loadEnvFile();
} catch {
  // .env file optional
}

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
).trim();

const hasServerSupabase =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_SERVICE_ROLE_KEY) &&
  !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY') &&
  (SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ') ||
    SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_'));

export const supabaseAdmin = hasServerSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const HMAC_SECRET =
  process.env.AUTH_HMAC_SECRET ||
  'trade-fresh-dev-hmac-secret-override-in-env-2026';

export const ADMIN_INVITE_CODE =
  process.env.ADMIN_INVITE_CODE || 'TF-ADMIN-2026';

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSandboxToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    companyName: user.companyName,
    vendorCode: user.vendorCode,
    exp: Date.now() + 1000 * 60 * 60 * 24,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySandboxToken(token: string): AuthUser | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(encoded)
    .digest('base64url');

  if (!safeCompare(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as AuthUser & { sub: string; exp: number };
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    if (parsed.role !== 'user' && parsed.role !== 'admin') return null;
    return {
      id: parsed.sub,
      email: parsed.email,
      role: parsed.role,
      displayName: parsed.displayName,
      companyName: parsed.companyName || '',
      vendorCode: parsed.vendorCode,
    };
  } catch {
    return null;
  }
}

export function buildHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'wss://*.supabase.co',
        ],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
}

export function buildCorsMiddleware() {
  const rawOrigins =
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://localhost:4000';
  const allowed = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return cors({
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS policy.'));
      }
    },
    credentials: true,
  });
}

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again shortly.' },
});

export const bidLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Bid rate limit exceeded. Wait a few seconds.' },
});

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();

  if (token.split('.').length === 2) {
    const sandboxUser = verifySandboxToken(token);
    if (!sandboxUser) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }
    req.authUser = sandboxUser;
    next();
    return;
  }

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data.user) {
        res.status(401).json({ error: 'Invalid or expired session token.' });
        return;
      }
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        res.status(401).json({ error: 'User profile not found.' });
        return;
      }

      req.authUser = {
        id: data.user.id,
        email: profile.email || data.user.email || '',
        role: profile.role === 'admin' ? 'admin' : 'user',
        displayName:
          profile.full_name ||
          (profile.role === 'admin' ? 'Trader Admin' : profile.vendor_code),
        companyName: profile.company_name || '',
        vendorCode: profile.vendor_code || 'Vendor',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        gstNumber: profile.gst_number || '',
      };
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Unable to verify session token.' });
      return;
    }
  }

  const sandboxUser = verifySandboxToken(token);
  if (!sandboxUser) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }
  req.authUser = sandboxUser;
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.authUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.authUser.role !== 'admin') {
    res.status(403).json({ error: 'Admin (Trader) privileges required.' });
    return;
  }
  next();
}
