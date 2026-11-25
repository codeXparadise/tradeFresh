import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  AppNotification,
  AuthUser,
  Bid,
  CategoryConfig,
  DeliveryStep,
  HeroBannerSlide,
  Lot,
  LotStatus,
  ProduceCategory,
  ProduceGrade,
  QualityReport,
  SiteSettings,
  UserRole,
} from '../types/trade';

export interface CreateLotPayload {
  title?: string;
  description?: string;
  tags?: string[];
  produce: ProduceCategory;
  subCategory?: string;
  grade: ProduceGrade;
  quantityKg: number;
  origin: string;
  farmName?: string;
  harvestDate: string;
  askPricePerKg: number;
  windowHours: number;
  windowMinutes?: number;
  imageUrl?: string;
  featuredOnHome?: boolean;
  moisturePct?: number;
  defectPct?: number;
  sizeGrading?: string;
  deliveryAddress?: string;
  shippingCarrier?: string;
}

export interface UpdateLotPayload {
  title?: string;
  description?: string;
  tags?: string[];
  produce?: ProduceCategory;
  subCategory?: string;
  grade?: ProduceGrade;
  quantityKg?: number;
  origin?: string;
  askPricePerKg?: number;
  featuredOnHome?: boolean;
  imageUrl?: string;
  deliveryAddress?: string;
  shippingCarrier?: string;
  vehicleNumber?: string;
  endsAt?: string;
}

export interface QualityCheckPayload {
  grade: ProduceGrade;
  moisturePct: number;
  defectPct: number;
  photoNote: string;
  outcome: 'pass' | 'fail';
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

export interface RegisterAdminPayload extends RegisterUserPayload {
  inviteCode: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

export interface ToastNotice {
  id: string;
  message: string;
  tone: 'success' | 'error' | 'info';
  title?: string;
}

interface TradeStoreValue {
  lots: Lot[];
  siteSettings: SiteSettings;
  notifications: AppNotification[];
  popupAlerts: ToastNotice[];
  dismissPopupAlert: (id: string) => void;
  unreadCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  networkState: 'online' | 'slow' | 'offline';
  simulateNetworkState: (state: 'online' | 'slow' | 'offline' | null) => void;
  celebrationActive: boolean;
  dismissCelebration: () => void;
  isLoading: boolean;
  isSyncing: boolean;
  isSupabaseMode: boolean;
  nowMs: number;
  user: AuthUser | null;
  role: UserRole;
  toast: string | null;
  toastTone: 'success' | 'error' | 'info';
  dismissToast: () => void;
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
  refreshLots: (simulateSkeleton?: boolean) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (patch: {
    displayName: string;
    companyName: string;
    phone: string;
    address: string;
    city: string;
    gstNumber: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  submitContactInquiry: (
    payload: ContactPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  signInWithCredentials: (
    email: string,
    password: string,
    expectedRole: 'user' | 'admin'
  ) => Promise<{ ok: boolean; user?: AuthUser; error?: string }>;
  registerUser: (
    payload: RegisterUserPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  registerAdmin: (
    payload: RegisterAdminPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  placeBid: (
    lotId: string,
    amountPerKg: number
  ) => Promise<{ ok: boolean; error?: string }>;
  createLot: (
    payload: CreateLotPayload
  ) => Promise<{ ok: boolean; lot?: Lot; error?: string }>;
  updateLot: (
    lotId: string,
    payload: UpdateLotPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteLot: (lotId: string) => Promise<{ ok: boolean; error?: string }>;
  updateAskPrice: (
    lotId: string,
    askPricePerKg: number
  ) => Promise<{ ok: boolean; error?: string }>;
  toggleLotFeatured: (
    lotId: string,
    featuredOnHome: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
  uploadLotImage: (
    file: File
  ) => Promise<{ ok: boolean; url?: string; error?: string }>;
  updateSiteSettings: (
    patch: Partial<Omit<SiteSettings, 'updatedAt'>>
  ) => Promise<{ ok: boolean; error?: string }>;
  lockDeal: (lotId: string) => Promise<{ ok: boolean; error?: string }>;
  submitQualityCheck: (
    lotId: string,
    payload: QualityCheckPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  advanceDelivery: (
    lotId: string,
    stage: 'dispatched' | 'delivered',
    shippingMeta?: { shippingCarrier?: string; vehicleNumber?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  resetDemo: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'tradefresh.token.v2';
const USER_STORAGE_KEY = 'tradefresh.user.v2';
const THEME_STORAGE_KEY = 'tradefresh.theme.v1';
const CATALOG_STORAGE_KEY = 'tradefresh.catalog.v1';

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cat-tomato',
    name: 'Tomato',
    allowSubcategories: true,
    subcategories: ['Roma Vine', 'Nashik Hybrid', 'Cherry Cluster'],
    imageUrl: '/images/produce-tomato.jpg',
  },
  {
    id: 'cat-onion',
    name: 'Onion',
    allowSubcategories: true,
    subcategories: ['Red Rabi', 'Garva Cured', 'White Dehydration'],
    imageUrl: '/images/produce-onion.jpg',
  },
  {
    id: 'cat-potato',
    name: 'Potato',
    allowSubcategories: true,
    subcategories: ['Chipsona', 'Jyoti Table', 'Chandramukhi'],
    imageUrl: '/images/produce-potato.jpg',
  },
  {
    id: 'cat-okra',
    name: 'Okra',
    allowSubcategories: true,
    subcategories: ['Tender Green', 'Export Pods', 'Hybrid Bhindi'],
    imageUrl: '/images/produce-okra.jpg',
  },
  {
    id: 'cat-capsicum',
    name: 'Capsicum',
    allowSubcategories: true,
    subcategories: ['Green Bell', 'Red / Yellow Mix', 'Polyhouse Thick'],
    imageUrl: '/images/produce-capsicum.jpg',
  },
];

const DEFAULT_GRADES: string[] = [
  'Grade A+',
  'Grade A',
  'Grade B',
  'Export Sortex',
];

const DEFAULT_HERO_SLIDES: HeroBannerSlide[] = [
  {
    id: 'slide-1',
    tag: 'MORNING MANDI DESK · LIVE',
    headline: 'Fresh produce, decided by bids.',
    subheadline:
      'Single-origin vegetables graded at dawn, priced with a transparent ask, and dispatched straight to your APMC bay.',
    imageUrl: '/images/hero-bigbasket.jpg',
  },
  {
    id: 'slide-2',
    tag: 'VERIFIED QUALITY BENCH',
    headline: 'Lab tested before bids open.',
    subheadline:
      'Inspect grading specs, crate packaging, and lot origin upfront before placing your highest wholesale bid.',
    imageUrl: '/images/about-yard.jpg',
  },
  {
    id: 'slide-3',
    tag: 'COLD-CHAIN DISPATCH',
    headline: 'Locked to top bid fast.',
    subheadline:
      'Real-time dispatch timeline from farm aggregation hub to sealed gate arrival.',
    imageUrl: '/images/contact-hub.jpg',
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  announcementText:
    'Live Nashik & Lasalgaon morning arrivals open for vendor bidding — direct FPO quality certified.',
  heroHeadline: 'Fresh produce, decided by bids.',
  heroSubheadline:
    'Farm-sourced vegetable lots graded by the trader, priced with a clear ask, and locked to the highest vendor bid.',
  heroCtaPrimary: 'Browse live lots',
  heroCtaSecondary: 'Vendor Sign in',
  heroImageUrl: '/images/hero-bigbasket.jpg',
  enableSubcategoriesGlobal: true,
  categories: DEFAULT_CATEGORIES,
  grades: DEFAULT_GRADES,
  heroBannerSlides: DEFAULT_HERO_SLIDES,
  updatedAt: new Date().toISOString(),
};

const TradeStoreContext = createContext<TradeStoreValue | null>(null);

function readStoredTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed && (parsed.role === 'user' || parsed.role === 'admin')) {
      return parsed;
    }
  } catch {
    // Ignore storage errors.
  }
  return null;
}

function readStoredCatalog(): Partial<SiteSettings> | null {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SiteSettings>;
  } catch {
    return null;
  }
}

function saveStoredCatalog(settings: SiteSettings): void {
  try {
    localStorage.setItem(
      CATALOG_STORAGE_KEY,
      JSON.stringify({
        enableSubcategoriesGlobal: settings.enableSubcategoriesGlobal,
        categories: settings.categories,
        grades: settings.grades,
        heroBannerSlides: settings.heroBannerSlides,
      })
    );
  } catch {
    // Ignore storage error
  }
}

function mapSupabaseLot(row: Record<string, unknown>, bids: Bid[]): Lot {
  const produce = row.produce as ProduceCategory;
  const origin = String(row.origin);
  const qr = (row.quality_report as QualityReport & {
    customCategory?: string;
    subCategory?: string;
    customGrade?: string;
  }) ?? {
    grade: row.grade as ProduceGrade,
    moisturePct: 90,
    sizeGrading: 'Standard',
    defectPct: 1.5,
    testedBy: 'Desk QC',
    testedAt: 'Today',
    outcome: 'pass',
    photoNote: 'Verified',
  };
  return {
    id: String(row.id),
    lotCode: String(row.lot_code),
    title: String(row.title || `${origin} ${qr.customCategory || produce}`),
    description: String(
      row.description ||
        `Direct farm-sourced ${(qr.customCategory || produce).toLowerCase()} lot graded at ${origin}.`
    ),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    produce: qr.customCategory || produce,
    subCategory: String(row.sub_category || qr.subCategory || ''),
    grade: qr.customGrade || (row.grade as ProduceGrade),
    quantityKg: Number(row.quantity_kg),
    origin,
    farmName: String(row.farm_name),
    harvestDate: String(row.harvest_date),
    askPricePerKg: Number(row.ask_price_per_kg),
    endsAt: String(row.ends_at),
    status: row.status as LotStatus,
    imageUrl: String(row.image_url || '/images/produce-tomato.jpg'),
    featuredOnHome: Boolean(row.featured_on_home),
    bids: bids.sort(
      (a, b) =>
        b.amountPerKg - a.amountPerKg ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    winningVendorId: (row.winning_vendor_id as string | null) ?? null,
    winningBidPerKg:
      row.winning_bid_per_kg !== null && row.winning_bid_per_kg !== undefined
        ? Number(row.winning_bid_per_kg)
        : null,
    qualityReport: qr,
    deliveryAddress: String(row.delivery_address),
    shippingCarrier: String(row.shipping_carrier || 'Trade Fresh Logistics'),
    vehicleNumber: String(row.vehicle_number || 'Pending dispatch'),
    traderContact: (row.trader_contact as Lot['traderContact']) ?? {
      name: 'Raghav Deshmukh',
      phone: '+91 98204 51190',
      hub: 'Aggregation Hub',
    },
    timeline: Array.isArray(row.timeline) ? (row.timeline as DeliveryStep[]) : [],
  };
}

export function TradeStoreProvider({ children }: { children: React.ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = readStoredCatalog();
    return { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [popupAlerts, setPopupAlerts] = useState<ToastNotice[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStoredTheme());
  const [networkState, setNetworkState] = useState<'online' | 'slow' | 'offline'>(
    () => (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online')
  );
  const [forcedNetState, setForcedNetState] = useState<'online' | 'slow' | 'offline' | null>(null);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [user, setUser] = useState<AuthUser | null>(() =>
    isSupabaseConfigured ? null : readStoredUser()
  );
  const [token, setToken] = useState<string | null>(() =>
    isSupabaseConfigured ? null : readStoredToken()
  );
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  useEffect(() => {
    const updateNet = () => {
      if (!navigator.onLine) {
        setNetworkState('offline');
        return;
      }
      const conn = (navigator as unknown as { connection?: { effectiveType?: string; rtt?: number } }).connection;
      if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || (conn.rtt ?? 0) > 1200)) {
        setNetworkState('slow');
        return;
      }
      setNetworkState('online');
    };
    window.addEventListener('online', updateNet);
    window.addEventListener('offline', updateNet);
    updateNet();
    return () => {
      window.removeEventListener('online', updateNet);
      window.removeEventListener('offline', updateNet);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const dismissPopupAlert = useCallback((id: string) => {
    setPopupAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushPopupAlert = useCallback(
    (message: string, tone: 'success' | 'error' | 'info' = 'info', title?: string) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setPopupAlerts((prev) => [{ id, message, tone, title }, ...prev].slice(0, 4));
      window.setTimeout(() => {
        setPopupAlerts((prev) => prev.filter((item) => item.id !== id));
      }, 4800);
    },
    []
  );

  const showToast = useCallback(
    (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
      setToastTone(tone);
      setToast(message);
      pushPopupAlert(
        message,
        tone,
        tone === 'error' ? 'Desk Alert' : tone === 'info' ? 'Live Update' : 'Confirmed'
      );
    },
    [pushPopupAlert]
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrationActive(false);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const authHeaders = useCallback(
    (extra?: Record<string, string>): Record<string, string> => {
      const headers: Record<string, string> = { ...(extra ?? {}) };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    [token]
  );

  const loadSupabaseProfile = useCallback(
    async (userId: string, fallbackEmail: string): Promise<AuthUser | null> => {
      if (!supabase) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!data) return null;
      return {
        id: userId,
        email: data.email || fallbackEmail,
        role: data.role === 'admin' ? 'admin' : 'user',
        displayName:
          data.full_name ||
          (data.role === 'admin' ? 'Trader Admin' : data.vendor_code),
        companyName: data.company_name || '',
        vendorCode: data.vendor_code || 'Vendor',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        gstNumber: data.gst_number || '',
      };
    },
    []
  );

  const loadNotifications = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setNotifications([]);
        return;
      }
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setNotifications(
        (data ?? []).map((n) => ({
          id: String(n.id),
          recipientRole:
            (n.recipient_role as AppNotification['recipientRole']) || 'all',
          title: String(n.title),
          body: String(n.message || ''),
          kind: (n.kind as AppNotification['kind']) || 'info',
          lotId: (n.lot_id as string | null) ?? null,
          isRead: Boolean(n.is_read),
          createdAt: String(n.created_at),
        }))
      );
      return;
    }

    if (!token) {
      setNotifications([]);
      return;
    }
    const res = await fetch('/api/notifications', { headers: authHeaders() });
    if (res.ok) {
      const data = (await res.json()) as { notifications: AppNotification[] };
      setNotifications(data.notifications);
    }
  }, [authHeaders, token]);

  const refreshLots = useCallback(
    async (simulateSkeleton = false) => {
      if (simulateSkeleton) setIsLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const [
            { data: lotRows, error: lotErr },
            { data: bidRows },
            { data: settingsRow },
          ] = await Promise.all([
            supabase
              .from('lots')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('bids')
              .select('*')
              .order('amount_per_kg', { ascending: false }),
            supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
          ]);

          if (lotErr) throw lotErr;

          const bidsByLot = new Map<string, Bid[]>();
          for (const b of bidRows ?? []) {
            const list = bidsByLot.get(b.lot_id) ?? [];
            list.push({
              id: String(b.id),
              vendorId: String(b.vendor_label),
              vendorLabel: String(b.vendor_label),
              amountPerKg: Number(b.amount_per_kg),
              createdAt: String(b.created_at),
            });
            bidsByLot.set(b.lot_id, list);
          }

          setLots(
            (lotRows ?? []).map((row) =>
              mapSupabaseLot(row, bidsByLot.get(String(row.id)) ?? [])
            )
          );

          if (settingsRow) {
            const storedCat = readStoredCatalog();
            const remoteCatalog = (settingsRow.catalog_config ?? {}) as Partial<SiteSettings>;
            setSiteSettings({
              ...DEFAULT_SETTINGS,
              ...(storedCat ?? {}),
              ...remoteCatalog,
              announcementText: String(settingsRow.announcement_text ?? ''),
              heroHeadline: String(settingsRow.hero_headline),
              heroSubheadline: String(settingsRow.hero_subheadline),
              heroCtaPrimary: String(settingsRow.hero_cta_primary),
              heroCtaSecondary: String(settingsRow.hero_cta_secondary),
              heroImageUrl: String(settingsRow.hero_image_url),
              categories:
                Array.isArray(remoteCatalog.categories) && remoteCatalog.categories.length > 0
                  ? remoteCatalog.categories
                  : storedCat?.categories ?? DEFAULT_CATEGORIES,
              grades:
                Array.isArray(remoteCatalog.grades) && remoteCatalog.grades.length > 0
                  ? remoteCatalog.grades
                  : storedCat?.grades ?? DEFAULT_GRADES,
              heroBannerSlides:
                Array.isArray(remoteCatalog.heroBannerSlides) &&
                remoteCatalog.heroBannerSlides.length > 0
                  ? remoteCatalog.heroBannerSlides
                  : storedCat?.heroBannerSlides ?? DEFAULT_HERO_SLIDES,
              updatedAt: String(settingsRow.updated_at),
            });
          }
        } else {
          const [lotsRes, settingsRes] = await Promise.all([
            fetch('/api/lots'),
            fetch('/api/site-settings'),
          ]);
          if (!lotsRes.ok) throw new Error('Failed to load lots');
          const lotsData = (await lotsRes.json()) as { lots: Lot[] };
          if (settingsRes.ok) {
            const sData = (await settingsRes.json()) as {
              siteSettings: SiteSettings;
            };
            setSiteSettings(sData.siteSettings);
          }
          if (simulateSkeleton) {
            await new Promise((r) => setTimeout(r, 360));
          }
          setLots(lotsData.lots);
        }
        await loadNotifications();
      } finally {
        setIsLoading(false);
      }
    },
    [loadNotifications]
  );

  useEffect(() => {
    void refreshLots(false);
  }, [refreshLots]);

  // Sync Supabase auth session & realtime updates when configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let mounted = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session?.user) {
        setToken(session.access_token);
        const profile = await loadSupabaseProfile(
          session.user.id,
          session.user.email ?? ''
        );
        if (mounted && profile) setUser(profile);
        await loadNotifications();
      }
    });

    const { data: authSub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setToken(session.access_token);
          const profile = await loadSupabaseProfile(
            session.user.id,
            session.user.email ?? ''
          );
          if (mounted) setUser(profile);
          await loadNotifications();
        } else {
          setToken(null);
          setUser(null);
          setNotifications([]);
        }
      }
    );

    const rtChannel = supabase
      .channel('trade-fresh-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lots' },
        () => void refreshLots(false)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => void refreshLots(false)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => void refreshLots(false)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => void loadNotifications()
      )
      .subscribe();

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
      void supabase?.removeChannel(rtChannel);
    };
  }, [loadNotifications, loadSupabaseProfile, refreshLots]);

  // Verify stored sandbox token on mount
  useEffect(() => {
    if (isSupabaseConfigured || !token) return;
    void fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    });
  }, [token]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    },
    []
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (ids.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', ids);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      return;
    }
    if (!token) return;
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) {
      const data = (await res.json()) as { notifications: AppNotification[] };
      setNotifications(data.notifications);
    }
  }, [authHeaders, notifications, token]);

  const submitContactInquiry = useCallback(
    async (
      payload: ContactPayload
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.from('contact_inquiries').insert({
            name: payload.name.trim(),
            email: payload.email.trim(),
            company: payload.company.trim(),
            message: payload.message.trim(),
          });
          if (error) return { ok: false, error: error.message };
          showToast('Inquiry received. Our mandi desk will respond shortly.');
          return { ok: true };
        }
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not send inquiry.' };
        }
        showToast('Inquiry received. Our mandi desk will respond shortly.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error sending message.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [showToast]
  );

  const signInWithCredentials = useCallback(
    async (
      email: string,
      password: string,
      expectedRole: 'user' | 'admin'
    ): Promise<{ ok: boolean; user?: AuthUser; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error || !data.user || !data.session) {
            return {
              ok: false,
              error: error?.message || 'Invalid email or password.',
            };
          }
          const profile = await loadSupabaseProfile(
            data.user.id,
            data.user.email ?? email
          );
          if (!profile) {
            await supabase.auth.signOut();
            return { ok: false, error: 'Profile record not found.' };
          }
          if (profile.role !== expectedRole) {
            await supabase.auth.signOut();
            return {
              ok: false,
              error:
                profile.role === 'admin'
                  ? 'This is an Admin account. Switch to the Admin tab to sign in.'
                  : 'This is a User (Vendor) account. Admin access is required.',
            };
          }
          setToken(data.session.access_token);
          setUser(profile);
          showToast(
            profile.role === 'admin'
              ? 'Signed in to Trader Admin Desk.'
              : `Signed in as ${profile.vendorCode}.`
          );
          return { ok: true, user: profile };
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, expectedRole }),
        });
        const data = (await res.json()) as {
          user?: AuthUser;
          token?: string;
          error?: string;
        };
        if (!res.ok || !data.user || !data.token) {
          return { ok: false, error: data.error || 'Sign in failed.' };
        }
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        showToast(
          data.user.role === 'admin'
            ? 'Signed in to Trader Admin Desk.'
            : `Signed in as ${data.user.vendorCode}.`
        );
        return { ok: true, user: data.user };
      } catch {
        return { ok: false, error: 'Network error while signing in.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [loadSupabaseProfile, showToast]
  );

  const registerUser = useCallback(
    async (
      payload: RegisterUserPayload
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: payload.email.trim(),
            password: payload.password,
            options: {
              data: {
                full_name: payload.fullName.trim(),
                company_name: payload.companyName.trim(),
              },
            },
          });
          if (error) {
            return { ok: false, error: error.message };
          }
          if (data.session && data.user) {
            setToken(data.session.access_token);
            const profile = await loadSupabaseProfile(
              data.user.id,
              data.user.email ?? payload.email
            );
            if (profile) setUser(profile);
            const celebKey = `tradefresh.celebrated.${payload.email.trim().toLowerCase()}`;
            if (!localStorage.getItem(celebKey)) {
              localStorage.setItem(celebKey, '1');
              setCelebrationActive(true);
            }
            showToast('Welcome to Trade Fresh! Account created.', 'success');
            return { ok: true };
          }
          const celebKey = `tradefresh.celebrated.${payload.email.trim().toLowerCase()}`;
          if (!localStorage.getItem(celebKey)) {
            localStorage.setItem(celebKey, '1');
            setCelebrationActive(true);
          }
          showToast('Account created. Verify email if prompted, then sign in.', 'success');
          return { ok: true };
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          user?: AuthUser;
          token?: string;
          error?: string;
        };
        if (!res.ok || !data.user || !data.token) {
          return { ok: false, error: data.error || 'Registration failed.' };
        }
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        const celebKey = `tradefresh.celebrated.${data.user.email.toLowerCase()}`;
        if (!localStorage.getItem(celebKey)) {
          localStorage.setItem(celebKey, '1');
          setCelebrationActive(true);
        }
        showToast(`Account created (${data.user.vendorCode}).`, 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error during registration.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [loadSupabaseProfile, showToast]
  );

  const registerAdmin = useCallback(
    async (
      payload: RegisterAdminPayload
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/auth/register-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          user?: AuthUser;
          token?: string;
          error?: string;
        };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Admin registration failed.' };
        }

        if (isSupabaseConfigured && supabase) {
          const signInRes = await signInWithCredentials(
            payload.email,
            payload.password,
            'admin'
          );
          return signInRes.ok
            ? { ok: true }
            : { ok: false, error: signInRes.error };
        }

        if (data.user && data.token) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
        showToast('Admin account provisioned.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error during admin registration.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [showToast, signInWithCredentials]
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setToken(null);
    setNotifications([]);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    showToast('Signed out.');
  }, [showToast]);

  const updateProfile = useCallback(
    async (patch: {
      displayName: string;
      companyName: string;
      phone: string;
      address: string;
      city: string;
      gstNumber: string;
    }): Promise<{ ok: boolean; error?: string }> => {
      if (!user) return { ok: false, error: 'Sign in first.' };
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase
            .from('profiles')
            .update({
              full_name: patch.displayName,
              company_name: patch.companyName,
              phone: patch.phone,
              address: patch.address,
              city: patch.city,
              gst_number: patch.gstNumber,
            })
            .eq('id', user.id);
          if (error) return { ok: false, error: error.message };
        }
        const nextUser: AuthUser = { ...user, ...patch };
        setUser(nextUser);
        if (!isSupabaseConfigured) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        }
        showToast('Profile saved.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Failed to update profile.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [showToast, user]
  );

  const deleteAccount = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    if (!user) return { ok: false, error: 'Sign in first.' };
    setIsSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('profiles')
          .update({ account_status: 'deleted' })
          .eq('id', user.id);
        await supabase.auth.signOut();
      }
      setUser(null);
      setToken(null);
      setNotifications([]);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      showToast('Account closed.');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete account.' };
    } finally {
      setIsSyncing(false);
    }
  }, [showToast, user]);

  const placeBid = useCallback(
    async (
      lotId: string,
      amountPerKg: number
    ): Promise<{ ok: boolean; error?: string }> => {
      const target = lots.find((l) => l.id === lotId);
      if (target) {
        if (target.status !== 'open') {
          const msg = 'Bidding is closed on this lot.';
          showToast(msg, 'error');
          return { ok: false, error: msg };
        }
        const endMs = new Date(target.endsAt).getTime();
        if (Number.isFinite(endMs) && endMs <= Date.now()) {
          const msg = 'Bidding time expired. Bidding is closed for this lot.';
          showToast(msg, 'error');
          return { ok: false, error: msg };
        }
      }

      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.rpc('place_bid', {
            p_lot_id: lotId,
            p_amount_per_kg: amountPerKg,
          });
          if (error) {
            showToast(error.message, 'error');
            return { ok: false, error: error.message };
          }
          await refreshLots(false);
          showToast(`Bid placed at ₹${amountPerKg}/kg.`, 'success');
          return { ok: true };
        }

        const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}/bids`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ amountPerKg }),
        });
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          const msg = data.error || 'Could not place bid.';
          showToast(msg, 'error');
          return { ok: false, error: msg };
        }
        if (data.lots) setLots(data.lots);
        await loadNotifications();
        showToast(`Bid placed at ₹${amountPerKg}/kg.`, 'success');
        return { ok: true };
      } catch {
        const msg = 'Network error while placing bid.';
        showToast(msg, 'error');
        return { ok: false, error: msg };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, loadNotifications, lots, refreshLots, showToast]
  );

  const createLot = useCallback(
    async (
      payload: CreateLotPayload
    ): Promise<{ ok: boolean; lot?: Lot; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const slug = payload.produce.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const id = `lot-${slug}-${Date.now()}`;
          const lotCode = `TF-${1047 + lots.length}`;
          const durationHours =
            payload.windowMinutes && payload.windowMinutes > 0
              ? payload.windowMinutes / 60
              : payload.windowHours;
          const endsAt = new Date(
            Date.now() + durationHours * 3600 * 1000
          ).toISOString();
          const matchedCat = siteSettings.categories.find(
            (c) => c.name.toLowerCase() === payload.produce.toLowerCase()
          );
          const defaultImg = matchedCat?.imageUrl || '/images/produce-tomato.jpg';

          const baseRow = {
            id,
            lot_code: lotCode,
            title:
              payload.title?.trim() ||
              `${payload.origin} ${payload.grade} ${payload.produce}`,
            description:
              payload.description?.trim() ||
              `Direct farm-sourced ${payload.produce.toLowerCase()} lot graded at ${payload.origin}.`,
            tags:
              payload.tags && payload.tags.length > 0
                ? payload.tags
                : [payload.grade, payload.origin],
            produce: payload.produce,
            sub_category: payload.subCategory?.trim() || '',
            grade: payload.grade,
            quantity_kg: payload.quantityKg,
            origin: payload.origin,
            farm_name:
              payload.farmName?.trim() || `${payload.origin} Direct Growers`,
            harvest_date: payload.harvestDate,
            ask_price_per_kg: payload.askPricePerKg,
            ends_at: endsAt,
            status: 'open',
            image_url: payload.imageUrl || defaultImg,
            featured_on_home: payload.featuredOnHome ?? true,
            quality_report: {
              grade: payload.grade,
              moisturePct: payload.moisturePct ?? 90.0,
              sizeGrading: payload.sizeGrading?.trim() || 'Standard market spec',
              defectPct: payload.defectPct ?? 1.5,
              testedBy: 'Desk QC',
              testedAt: 'Intake check',
              outcome: 'pass',
              photoNote: 'Intake lot logged',
              customCategory: payload.produce,
              subCategory: payload.subCategory?.trim() || '',
              customGrade: payload.grade,
            },
            delivery_address:
              payload.deliveryAddress?.trim() ||
              'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
            shipping_carrier:
              payload.shippingCarrier?.trim() || 'Trade Fresh Logistics',
            vehicle_number: 'Pending dispatch',
            trader_contact: {
              name: 'Raghav Deshmukh',
              phone: '+91 98204 51190',
              hub: `${payload.origin} Hub`,
            },
            timeline: [
              {
                key: 'locked',
                label: 'Deal locked',
                completedAt: null,
                statusLine: 'Awaiting highest bid lock by trader',
              },
              {
                key: 'quality_checked',
                label: 'Quality checked',
                completedAt: null,
                statusLine: 'Final dispatch audit pending',
              },
              {
                key: 'dispatched',
                label: 'Dispatched',
                completedAt: null,
                statusLine: 'Transport queued',
              },
              {
                key: 'delivered',
                label: 'Delivered',
                completedAt: null,
                statusLine: 'Pending vendor receipt',
              },
            ],
            created_by: user?.id ?? null,
          };

          let { error } = await supabase.from('lots').insert(baseRow);

          if (error) {
            // Fallback for databases where migration 005 has not relaxed check constraints yet
            const standardProduce = ['Tomato', 'Onion', 'Potato', 'Okra', 'Capsicum'].includes(
              payload.produce
            )
              ? payload.produce
              : 'Tomato';
            const standardGrade = ['Grade A', 'Grade B'].includes(payload.grade)
              ? payload.grade
              : 'Grade A';
            const { sub_category: _sc, ...withoutSub } = baseRow;
            const retry = await supabase.from('lots').insert({
              ...withoutSub,
              produce: standardProduce,
              grade: standardGrade,
            });
            error = retry.error;
          }

          if (error) return { ok: false, error: error.message };
          await supabase.from('notifications').insert({
            lot_id: id,
            title: `New Ask Order · ${payload.produce}`,
            message: `${payload.quantityKg} kg at ₹${payload.askPricePerKg}/kg ask from ${payload.origin}.`,
            recipient_role: 'all',
            kind: 'lot',
          });
          await refreshLots(false);
          showToast(
            `Published ${payload.produce} lot (${payload.quantityKg} kg) at ₹${payload.askPricePerKg}/kg ask.`,
            'success'
          );
          return { ok: true };
        }

        const res = await fetch('/api/lots', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          lot?: Lot;
          lots?: Lot[];
          error?: string;
        };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not create lot.' };
        }
        if (data.lots) setLots(data.lots);
        await loadNotifications();
        showToast(
          `Published ${payload.produce} lot (${payload.quantityKg} kg) at ₹${payload.askPricePerKg}/kg ask.`
        );
        return { ok: true, lot: data.lot };
      } catch {
        return { ok: false, error: 'Network error while creating lot.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, loadNotifications, lots.length, refreshLots, showToast, user?.id]
  );

  const updateLot = useCallback(
    async (
      lotId: string,
      payload: UpdateLotPayload
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const patch: Record<string, unknown> = {};
          if (payload.title !== undefined) patch.title = payload.title;
          if (payload.description !== undefined)
            patch.description = payload.description;
          if (payload.tags !== undefined) patch.tags = payload.tags;
          if (payload.produce !== undefined) patch.produce = payload.produce;
          if (payload.subCategory !== undefined)
            patch.sub_category = payload.subCategory;
          if (payload.grade !== undefined) patch.grade = payload.grade;
          if (payload.quantityKg !== undefined)
            patch.quantity_kg = payload.quantityKg;
          if (payload.origin !== undefined) patch.origin = payload.origin;
          if (payload.askPricePerKg !== undefined)
            patch.ask_price_per_kg = payload.askPricePerKg;
          if (payload.featuredOnHome !== undefined)
            patch.featured_on_home = payload.featuredOnHome;
          if (payload.imageUrl !== undefined) patch.image_url = payload.imageUrl;
          if (payload.deliveryAddress !== undefined)
            patch.delivery_address = payload.deliveryAddress;
          if (payload.shippingCarrier !== undefined)
            patch.shipping_carrier = payload.shippingCarrier;
          if (payload.vehicleNumber !== undefined)
            patch.vehicle_number = payload.vehicleNumber;
          if (payload.endsAt !== undefined) patch.ends_at = payload.endsAt;

          const { error } = await supabase
            .from('lots')
            .update(patch)
            .eq('id', lotId);
          if (error) return { ok: false, error: error.message };
          await refreshLots(false);
          showToast('Lot updated.');
          return { ok: true };
        }

        const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}`, {
          method: 'PATCH',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Unable to update lot.' };
        }
        if (data.lots) setLots(data.lots);
        showToast('Lot updated.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while updating lot.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, refreshLots, showToast]
  );

  const deleteLot = useCallback(
    async (lotId: string): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.from('lots').delete().eq('id', lotId);
          if (error) return { ok: false, error: error.message };
          await refreshLots(false);
          showToast('Lot deleted.');
          return { ok: true };
        }
        const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Unable to delete lot.' };
        }
        if (data.lots) setLots(data.lots);
        showToast('Lot deleted.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while deleting lot.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, refreshLots, showToast]
  );

  const updateAskPrice = useCallback(
    async (
      lotId: string,
      askPricePerKg: number
    ): Promise<{ ok: boolean; error?: string }> => {
      const res = await updateLot(lotId, { askPricePerKg });
      if (res.ok) showToast(`Ask price updated to ₹${askPricePerKg}/kg.`);
      return res;
    },
    [showToast, updateLot]
  );

  const toggleLotFeatured = useCallback(
    async (
      lotId: string,
      featuredOnHome: boolean
    ): Promise<{ ok: boolean; error?: string }> => {
      const res = await updateLot(lotId, { featuredOnHome });
      if (res.ok) {
        showToast(
          featuredOnHome ? 'Lot featured on homepage.' : 'Removed from homepage.'
        );
      }
      return res;
    },
    [showToast, updateLot]
  );

  const uploadLotImage = useCallback(
    async (file: File): Promise<{ ok: boolean; url?: string; error?: string }> => {
      if (file.size > 1.5 * 1024 * 1024) {
        return { ok: false, error: 'Image must be under 1.5 MB.' };
      }
      if (isSupabaseConfigured && supabase) {
        const ext = file.name.split('.').pop() || 'jpg';
        const objectPath = `lots/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage
          .from('lot-images')
          .upload(objectPath, file, { upsert: false });
        if (error) return { ok: false, error: error.message };
        const { data } = supabase.storage
          .from('lot-images')
          .getPublicUrl(objectPath);
        return { ok: true, url: data.publicUrl };
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        return { ok: false, error: data.error || 'Upload failed.' };
      }
      return { ok: true, url: data.url };
    },
    [authHeaders]
  );

  const updateSiteSettings = useCallback(
    async (
      patch: Partial<Omit<SiteSettings, 'updatedAt'>>
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        const nextMerged: SiteSettings = {
          ...siteSettings,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        saveStoredCatalog(nextMerged);

        if (isSupabaseConfigured && supabase) {
          const catalogConfig = {
            enableSubcategoriesGlobal: nextMerged.enableSubcategoriesGlobal,
            categories: nextMerged.categories,
            grades: nextMerged.grades,
            heroBannerSlides: nextMerged.heroBannerSlides,
          };

          const baseUpdate = {
            announcement_text: nextMerged.announcementText,
            hero_headline: nextMerged.heroHeadline,
            hero_subheadline: nextMerged.heroSubheadline,
            hero_cta_primary: nextMerged.heroCtaPrimary,
            hero_cta_secondary: nextMerged.heroCtaSecondary,
            hero_image_url: nextMerged.heroImageUrl,
            updated_at: nextMerged.updatedAt,
          };

          let { error } = await supabase
            .from('site_settings')
            .update({ ...baseUpdate, catalog_config: catalogConfig })
            .eq('id', 1);

          if (error) {
            const retry = await supabase
              .from('site_settings')
              .update(baseUpdate)
              .eq('id', 1);
            error = retry.error;
          }

          if (error) return { ok: false, error: error.message };
          setSiteSettings(nextMerged);
          showToast('Site & catalog controls published.');
          return { ok: true };
        }

        const res = await fetch('/api/site-settings', {
          method: 'PATCH',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(patch),
        });
        const data = (await res.json()) as {
          siteSettings?: SiteSettings;
          error?: string;
        };
        if (!res.ok || !data.siteSettings) {
          return { ok: false, error: data.error || 'Could not update homepage.' };
        }
        setSiteSettings(data.siteSettings);
        showToast('Site & catalog controls published.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error updating site settings.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, showToast, siteSettings]
  );

  const lockDeal = useCallback(
    async (lotId: string): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.rpc('lock_deal', {
            p_lot_id: lotId,
          });
          if (error) return { ok: false, error: error.message };
          await refreshLots(false);
          showToast('Deal locked to highest bidder.');
          return { ok: true };
        }

        const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}/lock`, {
          method: 'POST',
          headers: authHeaders(),
        });
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not lock deal.' };
        }
        if (data.lots) setLots(data.lots);
        await loadNotifications();
        showToast('Deal locked to highest bidder. Quality check pending.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while locking deal.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, loadNotifications, refreshLots, showToast]
  );

  const submitQualityCheck = useCallback(
    async (
      lotId: string,
      payload: QualityCheckPayload
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const lot = lots.find((l) => l.id === lotId);
          if (!lot) return { ok: false, error: 'Lot not found.' };
          const now = new Date().toISOString();
          const nextTimeline = lot.timeline.map((step) =>
            step.key === 'quality_checked'
              ? {
                  ...step,
                  completedAt: now,
                  statusLine:
                    payload.outcome === 'pass'
                      ? `${payload.grade} passed (${payload.defectPct}% defects, ${payload.moisturePct}% moisture)`
                      : `${payload.grade} flagged (${payload.defectPct}% defects)`,
                }
              : step
          );
          const { error } = await supabase
            .from('lots')
            .update({
              grade: payload.grade,
              status: 'locked',
              quality_report: {
                ...lot.qualityReport,
                ...payload,
                testedAt: 'Just now',
              },
              timeline: nextTimeline,
            })
            .eq('id', lotId);
          if (error) return { ok: false, error: error.message };
          await refreshLots(false);
          showToast(`Quality check saved (${payload.outcome.toUpperCase()}).`);
          return { ok: true };
        }

        const res = await fetch(
          `/api/lots/${encodeURIComponent(lotId)}/quality-check`,
          {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload),
          }
        );
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          return {
            ok: false,
            error: data.error || 'Could not submit quality check.',
          };
        }
        if (data.lots) setLots(data.lots);
        await loadNotifications();
        showToast(`Quality check saved (${payload.outcome.toUpperCase()}).`);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while saving quality check.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, loadNotifications, lots, refreshLots, showToast]
  );

  const advanceDelivery = useCallback(
    async (
      lotId: string,
      stage: 'dispatched' | 'delivered',
      shippingMeta?: { shippingCarrier?: string; vehicleNumber?: string }
    ): Promise<{ ok: boolean; error?: string }> => {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const lot = lots.find((l) => l.id === lotId);
          if (!lot) return { ok: false, error: 'Lot not found.' };
          const now = new Date().toISOString();
          const vehicle =
            shippingMeta?.vehicleNumber?.trim() || lot.vehicleNumber || 'MH-15-TR-4418';
          const carrier =
            shippingMeta?.shippingCarrier?.trim() || lot.shippingCarrier || 'Trade Fresh Logistics';
          const nextTimeline = lot.timeline.map((step) => {
            if (stage === 'dispatched' && step.key === 'dispatched') {
              return {
                ...step,
                completedAt: now,
                statusLine: `Dispatched from ${lot.traderContact.hub} via ${vehicle}`,
              };
            }
            if (stage === 'delivered' && step.key === 'delivered') {
              return {
                ...step,
                completedAt: now,
                statusLine: `Signed off at ${lot.deliveryAddress}`,
              };
            }
            return step;
          });
          const { error } = await supabase
            .from('lots')
            .update({
              status: stage,
              shipping_carrier: carrier,
              vehicle_number: vehicle,
              timeline: nextTimeline,
            })
            .eq('id', lotId);
          if (error) return { ok: false, error: error.message };
          await refreshLots(false);
          showToast(
            stage === 'dispatched'
              ? 'Lot marked Dispatched.'
              : 'Lot marked Delivered.'
          );
          return { ok: true };
        }

        const res = await fetch(
          `/api/lots/${encodeURIComponent(lotId)}/delivery`,
          {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ stage, ...shippingMeta }),
          }
        );
        const data = (await res.json()) as { lots?: Lot[]; error?: string };
        if (!res.ok) {
          return {
            ok: false,
            error: data.error || 'Could not update delivery stage.',
          };
        }
        if (data.lots) setLots(data.lots);
        await loadNotifications();
        showToast(
          stage === 'dispatched'
            ? 'Lot marked Dispatched.'
            : 'Lot marked Delivered.'
        );
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while updating delivery.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authHeaders, loadNotifications, lots, refreshLots, showToast]
  );

  const resetDemo = useCallback(async () => {
    if (isSupabaseConfigured) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) {
        showToast('Admin sign-in required to reset desk data.');
        return;
      }
      const data = (await res.json()) as {
        lots: Lot[];
        siteSettings: SiteSettings;
        notifications?: AppNotification[];
      };
      setLots(data.lots);
      setSiteSettings(data.siteSettings);
      if (data.notifications) setNotifications(data.notifications);
      showToast('Desk data reset to initial mandi lots.');
    } finally {
      setIsSyncing(false);
    }
  }, [authHeaders, showToast]);

  const role: UserRole = user?.role ?? 'guest';
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const effectiveNetworkState = forcedNetState ?? networkState;

  return (
    <TradeStoreContext.Provider
      value={{
        lots,
        siteSettings,
        notifications,
        popupAlerts,
        dismissPopupAlert,
        unreadCount,
        theme,
        toggleTheme,
        networkState: effectiveNetworkState,
        simulateNetworkState: setForcedNetState,
        celebrationActive,
        dismissCelebration,
        isLoading,
        isSyncing,
        isSupabaseMode: isSupabaseConfigured,
        nowMs,
        user,
        role,
        toast,
        toastTone,
        dismissToast,
        showToast,
        refreshLots,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
        deleteAccount,
        submitContactInquiry,
        signInWithCredentials,
        registerUser,
        registerAdmin,
        signOut,
        placeBid,
        createLot,
        updateLot,
        deleteLot,
        updateAskPrice,
        toggleLotFeatured,
        uploadLotImage,
        updateSiteSettings,
        lockDeal,
        submitQualityCheck,
        advanceDelivery,
        resetDemo,
      }}
    >
      {children}
    </TradeStoreContext.Provider>
  );
}

export function useTradeStore(): TradeStoreValue {
  const ctx = useContext(TradeStoreContext);
  if (!ctx) {
    throw new Error('useTradeStore must be used inside TradeStoreProvider');
  }
  return ctx;
}
