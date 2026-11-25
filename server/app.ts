import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import {
  ADMIN_INVITE_CODE,
  apiLimiter,
  authLimiter,
  bidLimiter,
  buildCorsMiddleware,
  buildHelmetMiddleware,
  createSandboxToken,
  requireAdmin,
  requireAuth,
  safeCompare,
  supabaseAdmin,
  type AuthenticatedRequest,
} from './middleware/security.ts';
import {
  addContactInquiry,
  advanceDelivery,
  authenticateSandboxUser,
  createLot,
  deleteLot,
  getLots,
  getNotifications,
  getSiteSettings,
  lockDeal,
  markAllNotificationsRead,
  placeBid,
  registerSandboxUser,
  resetLots,
  submitQualityCheck,
  updateLotControls,
  updateSiteSettings,
} from './store.ts';

export const app = express();

app.set('trust proxy', 1);
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api') || '/api';
  }
  next();
});
app.use(buildHelmetMiddleware());
app.use(buildCorsMiddleware());
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiLimiter);

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  expectedRole: z.enum(['user', 'admin']).optional(),
});

const registerUserSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().min(2, 'Enter your full name.'),
  companyName: z.string().min(2, 'Enter your company or mandi name.'),
});

const registerAdminSchema = registerUserSchema.extend({
  inviteCode: z.string().min(3, 'Admin invite code is required.'),
});

const createLotSchema = z.object({
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(600).optional(),
  tags: z.array(z.string().trim().max(32)).max(12).optional(),
  produce: z.string().trim().min(2, 'Select or enter a category.').max(60),
  subCategory: z.string().trim().max(60).optional(),
  grade: z.string().trim().min(1, 'Select or enter a quality grade.').max(60),
  quantityKg: z.coerce.number().int().min(10).max(200000),
  origin: z.string().trim().min(2).max(80),
  farmName: z.string().trim().max(120).optional(),
  harvestDate: z.string().trim().min(2).max(60),
  askPricePerKg: z.coerce.number().int().min(1).max(5000),
  windowHours: z.coerce.number().min(0.1).max(168),
  windowMinutes: z.coerce.number().int().min(1).max(10080).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  featuredOnHome: z.boolean().optional(),
  moisturePct: z.coerce.number().min(5).max(99.9).optional(),
  defectPct: z.coerce.number().min(0).max(100).optional(),
  sizeGrading: z.string().trim().max(80).optional(),
  deliveryAddress: z.string().trim().max(240).optional(),
  shippingCarrier: z.string().trim().max(100).optional(),
});

const updateLotSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(600).optional(),
  tags: z.array(z.string().trim().max(32)).max(12).optional(),
  produce: z.string().trim().min(2).max(60).optional(),
  subCategory: z.string().trim().max(60).optional(),
  grade: z.string().trim().min(1).max(60).optional(),
  quantityKg: z.coerce.number().int().min(10).max(200000).optional(),
  origin: z.string().trim().min(2).max(80).optional(),
  askPricePerKg: z.coerce.number().int().min(1).max(5000).optional(),
  featuredOnHome: z.boolean().optional(),
  imageUrl: z.string().trim().max(500).optional(),
  deliveryAddress: z.string().trim().max(240).optional(),
  shippingCarrier: z.string().trim().max(100).optional(),
  vehicleNumber: z.string().trim().max(60).optional(),
  endsAt: z.string().trim().max(60).optional(),
});

const categorySchema = z.object({
  id: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(60),
  allowSubcategories: z.boolean(),
  subcategories: z.array(z.string().trim().min(1).max(60)).max(25),
  imageUrl: z.string().trim().max(500).optional(),
});

const heroSlideSchema = z.object({
  id: z.string().trim().min(1).max(60),
  tag: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(4).max(120),
  subheadline: z.string().trim().min(4).max(260),
  imageUrl: z.string().trim().min(2).max(500),
});

const siteSettingsSchema = z.object({
  announcementText: z.string().trim().max(220).optional(),
  heroHeadline: z.string().trim().min(4).max(120).optional(),
  heroSubheadline: z.string().trim().min(8).max(280).optional(),
  heroCtaPrimary: z.string().trim().min(2).max(40).optional(),
  heroCtaSecondary: z.string().trim().min(2).max(40).optional(),
  heroImageUrl: z.string().trim().max(500).optional(),
  enableSubcategoriesGlobal: z.boolean().optional(),
  categories: z.array(categorySchema).max(30).optional(),
  grades: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  heroBannerSlides: z.array(heroSlideSchema).max(6).optional(),
});

const bidSchema = z.object({
  amountPerKg: z.coerce.number().int().min(1).max(10000),
});

const qcSchema = z.object({
  grade: z.string().trim().min(1).max(60),
  moisturePct: z.coerce.number().min(5).max(99.9),
  defectPct: z.coerce.number().min(0).max(100),
  photoNote: z.string().trim().max(200).default(''),
  outcome: z.enum(['pass', 'fail']),
});

const deliverySchema = z.object({
  stage: z.enum(['dispatched', 'delivered']),
  shippingCarrier: z.string().trim().max(100).optional(),
  vehicleNumber: z.string().trim().max(60).optional(),
});

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  company: z.string().trim().max(120).default(''),
  message: z.string().trim().min(8, 'Enter a short message.'),
});

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(100),
  dataUrl: z.string().min(20).max(2_200_000),
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'trade-fresh-api',
    mode: supabaseAdmin ? 'supabase' : 'sandbox',
  });
});

app.get('/api/site-settings', (_req: Request, res: Response) => {
  res.json({ siteSettings: getSiteSettings() });
});

app.patch(
  '/api/site-settings',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = siteSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    const updated = updateSiteSettings(parsed.data);
    res.json({ siteSettings: updated });
  }
);

app.post('/api/contact', (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }
  const inquiry = addContactInquiry(parsed.data);
  res.status(201).json({ inquiry });
});

app.get(
  '/api/notifications',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const role = req.authUser?.role === 'admin' ? 'admin' : 'user';
    res.json({ notifications: getNotifications(role) });
  }
);

app.post(
  '/api/notifications/read-all',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const role = req.authUser?.role === 'admin' ? 'admin' : 'user';
    res.json({ notifications: markAllNotificationsRead(role) });
  }
);

app.post('/api/auth/login', authLimiter, (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }
  const user = authenticateSandboxUser(parsed.data.email, parsed.data.password);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }
  if (parsed.data.expectedRole && user.role !== parsed.data.expectedRole) {
    res.status(403).json({
      error:
        user.role === 'admin'
          ? 'This is an Admin account. Sign in from the dedicated Admin Login page.'
          : 'This is a Vendor account. Admin privileges are required.',
    });
    return;
  }
  const token = createSandboxToken(user);
  res.json({ user, token });
});

app.post('/api/auth/register', authLimiter, (req: Request, res: Response) => {
  const parsed = registerUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }
  try {
    const user = registerSandboxUser({ ...parsed.data, role: 'user' });
    const token = createSandboxToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Registration failed.',
    });
  }
});

app.post(
  '/api/auth/register-admin',
  authLimiter,
  async (req: Request, res: Response) => {
    const parsed = registerAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    if (!safeCompare(parsed.data.inviteCode.trim(), ADMIN_INVITE_CODE)) {
      res.status(403).json({ error: 'Invalid Admin invite code.' });
      return;
    }

    if (supabaseAdmin) {
      try {
        const { data: created, error } =
          await supabaseAdmin.auth.admin.createUser({
            email: parsed.data.email.trim().toLowerCase(),
            password: parsed.data.password,
            email_confirm: true,
            user_metadata: {
              full_name: parsed.data.fullName.trim(),
              company_name: parsed.data.companyName.trim(),
            },
          });
        if (error || !created.user) {
          res.status(400).json({
            error: error?.message || 'Unable to create Supabase admin user.',
          });
          return;
        }
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin', vendor_code: 'ADMIN-DESK' })
          .eq('id', created.user.id);

        res.status(201).json({
          message: 'Admin account created. You may now sign in.',
          role: 'admin',
        });
        return;
      } catch (err) {
        res.status(500).json({
          error:
            err instanceof Error ? err.message : 'Admin provisioning failed.',
        });
        return;
      }
    }

    try {
      const user = registerSandboxUser({ ...parsed.data, role: 'admin' });
      const token = createSandboxToken(user);
      res.status(201).json({ user, token });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Admin registration failed.',
      });
    }
  }
);

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.authUser });
});

app.get('/api/lots', (_req: Request, res: Response) => {
  res.json({ lots: getLots() });
});

app.post(
  '/api/lots',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = createLotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    const lot = createLot(parsed.data);
    res.status(201).json({ lot, lots: getLots() });
  }
);

app.patch(
  '/api/lots/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = updateLotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    try {
      const lot = updateLotControls(String(req.params.id), parsed.data);
      res.json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to update lot.',
      });
    }
  }
);

app.delete(
  '/api/lots/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const lots = deleteLot(String(req.params.id));
      res.json({ lots });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to delete lot.',
      });
    }
  }
);

app.patch(
  '/api/lots/:id/ask-price',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = z
      .object({ askPricePerKg: z.coerce.number().int().min(1).max(5000) })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    try {
      const lot = updateLotControls(String(req.params.id), {
        askPricePerKg: parsed.data.askPricePerKg,
      });
      res.json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to update ask price.',
      });
    }
  }
);

app.post(
  '/api/lots/:id/bids',
  requireAuth,
  bidLimiter,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = bidSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    try {
      const vendorLabel =
        req.authUser?.vendorCode || req.authUser?.displayName || 'Vendor';
      const lot = placeBid(
        String(req.params.id),
        parsed.data.amountPerKg,
        vendorLabel
      );
      res.status(201).json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to place bid.',
      });
    }
  }
);

app.post(
  '/api/lots/:id/lock',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const lot = lockDeal(String(req.params.id));
      res.json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to lock deal.',
      });
    }
  }
);

app.post(
  '/api/lots/:id/quality-check',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = qcSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    try {
      const lot = submitQualityCheck(String(req.params.id), parsed.data);
      res.json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to save QC report.',
      });
    }
  }
);

app.post(
  '/api/lots/:id/delivery',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = deliverySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    try {
      const lot = advanceDelivery(String(req.params.id), parsed.data.stage, {
        shippingCarrier: parsed.data.shippingCarrier,
        vehicleNumber: parsed.data.vehicleNumber,
      });
      res.json({ lot, lots: getLots() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to update delivery.',
      });
    }
  }
);

app.post(
  '/api/upload',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }
    const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(
      parsed.data.dataUrl
    );
    if (!match) {
      res
        .status(400)
        .json({ error: 'Only PNG, JPEG, or WEBP image uploads are allowed.' });
      return;
    }
    const ext = match[1].includes('png')
      ? 'png'
      : match[1].includes('webp')
      ? 'webp'
      : 'jpg';
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.byteLength > 1.6 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be smaller than 1.5 MB.' });
      return;
    }
    try {
      const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `lot-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      res.status(201).json({ url: `/uploads/${fileName}` });
    } catch {
      res.status(201).json({ url: parsed.data.dataUrl });
    }
  }
);

app.post(
  '/api/reset',
  requireAuth,
  requireAdmin,
  (_req: AuthenticatedRequest, res: Response) => {
    const data = resetLots();
    res.json({
      lots: data.lots,
      siteSettings: data.siteSettings,
      notifications: data.notifications,
    });
  }
);

const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

const imagesDir = path.resolve(process.cwd(), 'public', 'images');
if (fs.existsSync(imagesDir)) {
  app.use('/images', express.static(imagesDir));
}

const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('/{*splat}', (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}
