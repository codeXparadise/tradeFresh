import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AppNotification,
  AuthUser,
  ContactInquiry,
  Lot,
  ProduceCategory,
  ProduceGrade,
  QualityReport,
  SiteSettings,
} from '../src/types/trade.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export interface SandboxAccount extends AuthUser {
  passwordHash: string;
}

interface StoreData {
  lots: Lot[];
  siteSettings: SiteSettings;
  users: SandboxAccount[];
  notifications: AppNotification[];
  inquiries: ContactInquiry[];
}

function hashPassword(password: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, originalHex] = stored.split(':');
  if (!salt || !originalHex) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (candidate.length !== original.length) return false;
  return crypto.timingSafeEqual(candidate, original);
}

function futureIso(hours: number, minutes: number, seconds: number): string {
  const ms = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  return new Date(Date.now() + ms).toISOString();
}

function pastIso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
}

const PRODUCE_IMAGE_MAP: Record<string, string> = {
  Tomato: '/images/produce-tomato.jpg',
  Onion: '/images/produce-onion.jpg',
  Okra: '/images/produce-okra.jpg',
  Potato: '/images/produce-potato.jpg',
  Capsicum: '/images/produce-capsicum.jpg',
};

export function defaultCategories() {
  return [
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
}

export function defaultHeroSlides() {
  return [
    {
      id: 'slide-1',
      tag: 'MORNING MANDI DESK · LIVE',
      headline: 'Farm-direct harvests, settled by live vendor bids.',
      subheadline:
        'Single-origin tomatoes, onions, potatoes & okra graded at dawn, priced with a transparent ask, and dispatched within hours.',
      imageUrl: '/images/hero-harvest.jpg',
    },
    {
      id: 'slide-2',
      tag: 'VERIFIED QUALITY BENCH',
      headline: 'Every crate moisture-checked before the bid opens.',
      subheadline:
        'View lab moisture %, size grading, and defect tolerance upfront before committing your wholesale bid per kg.',
      imageUrl: '/images/about-yard.jpg',
    },
    {
      id: 'slide-3',
      tag: 'COLD-CHAIN APMC DISPATCH',
      headline: 'Locked to top bidder, delivered to your mandi bay.',
      subheadline:
        'Track four live fulfillment checkpoints from desk lock to sealed vehicle arrival.',
      imageUrl: '/images/contact-hub.jpg',
    },
  ];
}

export function defaultSiteSettings(): SiteSettings {
  return {
    announcementText:
      'Live Nashik & Lasalgaon morning arrivals open for vendor bidding — zero brokerage fees.',
    heroHeadline: 'Fresh produce, decided by bids.',
    heroSubheadline:
      'Farm-sourced vegetable lots graded by the trader, priced with a clear ask, and locked to the highest vendor bid.',
    heroCtaPrimary: 'Browse live lots',
    heroCtaSecondary: 'Vendor Sign in',
    heroImageUrl: '/images/hero-harvest.jpg',
    enableSubcategoriesGlobal: true,
    categories: defaultCategories(),
    grades: ['Grade A+', 'Grade A', 'Grade B', 'Export Sortex'],
    heroBannerSlides: defaultHeroSlides(),
    updatedAt: new Date().toISOString(),
  };
}

function defaultUsers(): SandboxAccount[] {
  return [
    {
      id: 'usr-vendor-demo',
      email: 'vendor@freshmart.in',
      role: 'user',
      displayName: 'Arjun Mehta (FreshMart)',
      companyName: 'FreshMart Wholesale Vashi',
      vendorCode: 'Vendor #B-14',
      passwordHash: hashPassword('demo1234'),
    },
    {
      id: 'usr-admin-demo',
      email: 'trader@tradefresh.in',
      role: 'admin',
      displayName: 'Raghav Deshmukh',
      companyName: 'Trade Fresh Aggregation Desk',
      vendorCode: 'ADMIN-DESK',
      passwordHash: hashPassword('admin1234'),
    },
  ];
}

function defaultNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-1',
      recipientRole: 'all',
      title: 'Morning Nashik Tomato Lot Open',
      body: 'TF-1042 (800 kg Grade A Tomato) opened at ₹20/kg ask; top bid currently ₹22/kg.',
      kind: 'bid',
      lotId: 'lot-tomato-01',
      isRead: false,
      createdAt: pastIso(0.2),
    },
    {
      id: 'notif-2',
      recipientRole: 'user',
      title: 'Quality Check Passed · TF-1039',
      body: 'Narayangaon Tomato (600 kg) cleared Grade A moisture & defect inspection for dispatch.',
      kind: 'qc',
      lotId: 'lot-tomato-06',
      isRead: false,
      createdAt: pastIso(0.5),
    },
    {
      id: 'notif-3',
      recipientRole: 'admin',
      title: 'New Bid on Okra · TF-1044',
      body: 'Vendor #B-14 placed ₹38/kg on 300 kg Pune Grade A Okra.',
      kind: 'bid',
      lotId: 'lot-okra-03',
      isRead: false,
      createdAt: pastIso(0.15),
    },
  ];
}

export function buildSeedLots(): Lot[] {
  return [
    {
      id: 'lot-tomato-01',
      lotCode: 'TF-1042',
      title: 'Vine-Ripened Nashik Roma Tomatoes',
      description:
        'Daylight-graded firm red tomatoes packed in 25 kg ventilated crates for regional mandi dispatch.',
      tags: ['Daylight QC', 'Ventilated Crates', 'Nashik FPO'],
      produce: 'Tomato',
      grade: 'Grade A',
      quantityKg: 800,
      origin: 'Nashik',
      farmName: 'Sahyadri FPO · Plot 14',
      harvestDate: 'Today, 05:30 AM',
      askPricePerKg: 20,
      endsAt: futureIso(2, 14, 0),
      status: 'open',
      imageUrl: '/images/produce-tomato.jpg',
      featuredOnHome: true,
      bids: [
        {
          id: 'b-101',
          vendorId: 'Vendor #B-14',
          vendorLabel: 'Vendor #B-14',
          amountPerKg: 22,
          createdAt: pastIso(0.2),
        },
        {
          id: 'b-102',
          vendorId: 'Vendor #K-08',
          vendorLabel: 'Vendor #K-08',
          amountPerKg: 21,
          createdAt: pastIso(0.5),
        },
        {
          id: 'b-103',
          vendorId: 'Vendor #M-22',
          vendorLabel: 'Vendor #M-22',
          amountPerKg: 20,
          createdAt: pastIso(0.9),
        },
        {
          id: 'b-104',
          vendorId: 'Vendor #B-14',
          vendorLabel: 'Vendor #B-14',
          amountPerKg: 19,
          createdAt: pastIso(1.3),
        },
        {
          id: 'b-105',
          vendorId: 'Vendor #R-03',
          vendorLabel: 'Vendor #R-03',
          amountPerKg: 18,
          createdAt: pastIso(1.8),
        },
      ],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 93.4,
        sizeGrading: '55–65 mm uniform',
        defectPct: 1.8,
        testedBy: 'R. Deshmukh (Desk QC)',
        testedAt: 'Today, 08:15 AM',
        outcome: 'pass',
        photoNote: 'Crate sample #1042-A verified under daylight bench',
      },
      deliveryAddress: 'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
      shippingCarrier: 'Sahyadri Cold Chain',
      vehicleNumber: 'Pending dispatch',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Nashik Aggregation Yard',
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
          statusLine: 'Final pre-dispatch moisture and crate audit pending',
        },
        {
          key: 'dispatched',
          label: 'Dispatched',
          completedAt: null,
          statusLine: 'Reefer van assignment queued',
        },
        {
          key: 'delivered',
          label: 'Delivered',
          completedAt: null,
          statusLine: 'Pending vendor gate receipt',
        },
      ],
    },
    {
      id: 'lot-onion-02',
      lotCode: 'TF-1043',
      title: 'Cured Lasalgaon Red Rabi Onions',
      description:
        'Dry-skin cured red onions packed in 50 kg mesh sacks ready for wholesale yard loading.',
      tags: ['Dry Cured', 'Mesh Sacks', 'Lasalgaon'],
      produce: 'Onion',
      grade: 'Grade B',
      quantityKg: 1500,
      origin: 'Lasalgaon',
      farmName: 'Godavari Growers Co-op',
      harvestDate: 'Yesterday, 04:00 PM',
      askPricePerKg: 18,
      endsAt: futureIso(0, 45, 20),
      status: 'open',
      imageUrl: '/images/produce-onion.jpg',
      featuredOnHome: true,
      bids: [
        {
          id: 'b-201',
          vendorId: 'Vendor #S-19',
          vendorLabel: 'Vendor #S-19',
          amountPerKg: 17,
          createdAt: pastIso(0.3),
        },
        {
          id: 'b-202',
          vendorId: 'Vendor #D-05',
          vendorLabel: 'Vendor #D-05',
          amountPerKg: 16,
          createdAt: pastIso(0.8),
        },
      ],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade: 'Grade B',
        moisturePct: 86.2,
        sizeGrading: '45–55 mm cured',
        defectPct: 3.4,
        testedBy: 'R. Deshmukh (Desk QC)',
        testedAt: 'Today, 07:40 AM',
        outcome: 'pass',
        photoNote: 'Mesh sack lot #1043 dry-skin verified',
      },
      deliveryAddress: 'Unit 7, Azadpur Wholesale Yard, New Delhi',
      shippingCarrier: 'Godavari Freight',
      vehicleNumber: 'Pending dispatch',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Lasalgaon Sorting Shed',
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
          statusLine: 'Final dispatch inspection pending',
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
    },
    {
      id: 'lot-okra-03',
      lotCode: 'TF-1044',
      title: 'Tender Baramati Green Okra',
      description:
        'Early-morning snapped tender pods graded for zero-bruise retail and hotel supply.',
      tags: ['Snap Tested', 'Cold Ready', 'Morning Harvest'],
      produce: 'Okra',
      grade: 'Grade A',
      quantityKg: 300,
      origin: 'Pune',
      farmName: 'Baramati Fresh Collective',
      harvestDate: 'Today, 06:00 AM',
      askPricePerKg: 35,
      endsAt: futureIso(4, 30, 0),
      status: 'open',
      imageUrl: '/images/produce-okra.jpg',
      featuredOnHome: true,
      bids: [
        {
          id: 'b-301',
          vendorId: 'Vendor #B-14',
          vendorLabel: 'Vendor #B-14',
          amountPerKg: 38,
          createdAt: pastIso(0.15),
        },
        {
          id: 'b-302',
          vendorId: 'Vendor #N-11',
          vendorLabel: 'Vendor #N-11',
          amountPerKg: 36,
          createdAt: pastIso(0.6),
        },
        {
          id: 'b-303',
          vendorId: 'Vendor #K-08',
          vendorLabel: 'Vendor #K-08',
          amountPerKg: 35,
          createdAt: pastIso(1.1),
        },
      ],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 89.1,
        sizeGrading: '80–100 mm tender',
        defectPct: 1.2,
        testedBy: 'A. Kulkarni (Desk QC)',
        testedAt: 'Today, 09:05 AM',
        outcome: 'pass',
        photoNote: 'Ventilated crate sample #1044-B passed snap test',
      },
      deliveryAddress: 'Bay 12, Gultekdi Market Yard, Pune',
      shippingCarrier: 'Deccan Agro Express',
      vehicleNumber: 'Pending dispatch',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Pune Cold Hub',
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
          statusLine: 'Pre-dispatch QC pending',
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
    },
    {
      id: 'lot-potato-04',
      lotCode: 'TF-1045',
      title: 'Washed Malwa Chipsona Potatoes',
      description:
        'Washed 60+ mm processing-grade tubers packed in breathable jute bags.',
      tags: ['Washed', '60mm+', 'Chipsona'],
      produce: 'Potato',
      grade: 'Grade A',
      quantityKg: 2000,
      origin: 'Indore',
      farmName: 'Malwa Agro Farms',
      harvestDate: 'Yesterday, 02:30 PM',
      askPricePerKg: 16,
      endsAt: futureIso(3, 10, 0),
      status: 'open',
      imageUrl: '/images/produce-potato.jpg',
      featuredOnHome: false,
      bids: [
        {
          id: 'b-401',
          vendorId: 'Vendor #M-22',
          vendorLabel: 'Vendor #M-22',
          amountPerKg: 18,
          createdAt: pastIso(0.4),
        },
        {
          id: 'b-402',
          vendorId: 'Vendor #S-19',
          vendorLabel: 'Vendor #S-19',
          amountPerKg: 17,
          createdAt: pastIso(1.0),
        },
      ],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 78.5,
        sizeGrading: '60+ mm washed',
        defectPct: 1.9,
        testedBy: 'R. Deshmukh (Desk QC)',
        testedAt: 'Today, 08:50 AM',
        outcome: 'pass',
        photoNote: 'Washed Chipsona batch #1045 inspected',
      },
      deliveryAddress: 'Gate 4, Devi Ahilya Mandi, Indore',
      shippingCarrier: 'Malwa Logistics',
      vehicleNumber: 'Pending dispatch',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Indore Aggregation Yard',
      },
      timeline: [
        {
          key: 'locked',
          label: 'Deal locked',
          completedAt: null,
          statusLine: 'Awaiting highest bid lock',
        },
        {
          key: 'quality_checked',
          label: 'Quality checked',
          completedAt: null,
          statusLine: 'Pre-dispatch audit pending',
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
    },
    {
      id: 'lot-capsicum-05',
      lotCode: 'TF-1046',
      title: 'Polyhouse Kolar Green Capsicum',
      description:
        'Glossy thick-walled polyhouse peppers packed in ventilated corrugated cartons.',
      tags: ['Polyhouse', 'Export Grade', 'Kolar'],
      produce: 'Capsicum',
      grade: 'Grade A',
      quantityKg: 450,
      origin: 'Kolar',
      farmName: 'Nandi Polyhouse Growers',
      harvestDate: 'Today, 05:00 AM',
      askPricePerKg: 42,
      endsAt: futureIso(1, 50, 0),
      status: 'open',
      imageUrl: '/images/produce-capsicum.jpg',
      featuredOnHome: false,
      bids: [
        {
          id: 'b-501',
          vendorId: 'Vendor #K-08',
          vendorLabel: 'Vendor #K-08',
          amountPerKg: 44,
          createdAt: pastIso(0.25),
        },
      ],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 91.0,
        sizeGrading: '150–180 g glossy green',
        defectPct: 0.9,
        testedBy: 'A. Kulkarni (Desk QC)',
        testedAt: 'Today, 09:20 AM',
        outcome: 'pass',
        photoNote: 'Corrugated carton lot #1046-C cold-chain ready',
      },
      deliveryAddress: 'Shop 29, Yeshwanthpur APMC, Bengaluru',
      shippingCarrier: 'Southern Cold Fleet',
      vehicleNumber: 'Pending dispatch',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Kolar Packhouse',
      },
      timeline: [
        {
          key: 'locked',
          label: 'Deal locked',
          completedAt: null,
          statusLine: 'Awaiting highest bid lock',
        },
        {
          key: 'quality_checked',
          label: 'Quality checked',
          completedAt: null,
          statusLine: 'Pre-dispatch audit pending',
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
    },
    {
      id: 'lot-tomato-06',
      lotCode: 'TF-1039',
      title: 'Narayangaon Firm Crate Tomatoes',
      description:
        'Locked morning harvest lot cleared for cold-chain transit to Vashi APMC.',
      tags: ['Locked', 'QC Passed', 'Vashi Dispatch'],
      produce: 'Tomato',
      grade: 'Grade A',
      quantityKg: 600,
      origin: 'Narayangaon',
      farmName: 'Junnar Valley FPO',
      harvestDate: 'Today, 04:45 AM',
      askPricePerKg: 21,
      endsAt: pastIso(0.5),
      status: 'locked',
      imageUrl: '/images/produce-tomato.jpg',
      featuredOnHome: false,
      bids: [
        {
          id: 'b-601',
          vendorId: 'Vendor #B-14',
          vendorLabel: 'Vendor #B-14',
          amountPerKg: 24,
          createdAt: pastIso(1.2),
        },
        {
          id: 'b-602',
          vendorId: 'Vendor #N-11',
          vendorLabel: 'Vendor #N-11',
          amountPerKg: 23,
          createdAt: pastIso(1.6),
        },
      ],
      winningVendorId: 'Vendor #B-14',
      winningBidPerKg: 24,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 92.8,
        sizeGrading: '60 mm firm red',
        defectPct: 1.4,
        testedBy: 'R. Deshmukh (Desk QC)',
        testedAt: 'Today, 10:15 AM',
        outcome: 'pass',
        photoNote: '24-crate pallet #1039 sealed after QC sign-off',
      },
      deliveryAddress: 'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
      shippingCarrier: 'Sahyadri Cold Chain',
      vehicleNumber: 'MH-14-TF-8821',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Narayangaon Packhouse',
      },
      timeline: [
        {
          key: 'locked',
          label: 'Deal locked',
          completedAt: pastIso(1.0),
          statusLine: 'Locked to Vendor #B-14 at ₹24/kg',
        },
        {
          key: 'quality_checked',
          label: 'Quality checked',
          completedAt: pastIso(0.5),
          statusLine: 'Grade A passed (1.4% defects, 92.8% moisture)',
        },
        {
          key: 'dispatched',
          label: 'Dispatched',
          completedAt: null,
          statusLine: 'Loading scheduled at Narayangaon Dock 2',
        },
        {
          key: 'delivered',
          label: 'Delivered',
          completedAt: null,
          statusLine: 'Awaiting arrival at Vashi APMC',
        },
      ],
    },
    {
      id: 'lot-onion-07',
      lotCode: 'TF-1035',
      title: 'Pimpalgaon Export-Sorted Red Onions',
      description:
        'Delivered wholesale lot of cured red onions signed off at Vashi APMC Gate 2.',
      tags: ['Delivered', 'Grade A', '24 Bags'],
      produce: 'Onion',
      grade: 'Grade A',
      quantityKg: 1200,
      origin: 'Pimpalgaon',
      farmName: 'Khandesh Onion Producers',
      harvestDate: 'Yesterday, 06:00 AM',
      askPricePerKg: 19,
      endsAt: pastIso(5),
      status: 'delivered',
      imageUrl: '/images/produce-onion.jpg',
      featuredOnHome: false,
      bids: [
        {
          id: 'b-701',
          vendorId: 'Vendor #B-14',
          vendorLabel: 'Vendor #B-14',
          amountPerKg: 21,
          createdAt: pastIso(6),
        },
      ],
      winningVendorId: 'Vendor #B-14',
      winningBidPerKg: 21,
      qualityReport: {
        grade: 'Grade A',
        moisturePct: 85.0,
        sizeGrading: '50–60 mm red',
        defectPct: 1.5,
        testedBy: 'A. Kulkarni (Desk QC)',
        testedAt: 'Yesterday, 02:10 PM',
        outcome: 'pass',
        photoNote: '24 x 50 kg jute bags cleared & weighed',
      },
      deliveryAddress: 'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
      shippingCarrier: 'Khandesh Roadlines',
      vehicleNumber: 'MH-15-TR-4418',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: 'Pimpalgaon Yard',
      },
      timeline: [
        {
          key: 'locked',
          label: 'Deal locked',
          completedAt: pastIso(5.5),
          statusLine: 'Locked to Vendor #B-14 at ₹21/kg',
        },
        {
          key: 'quality_checked',
          label: 'Quality checked',
          completedAt: pastIso(4.5),
          statusLine: 'Grade A passed (1.5% defects, 85.0% moisture)',
        },
        {
          key: 'dispatched',
          label: 'Dispatched',
          completedAt: pastIso(3.5),
          statusLine: 'Dispatched via MH-15-TR-4418',
        },
        {
          key: 'delivered',
          label: 'Delivered',
          completedAt: pastIso(1.2),
          statusLine: 'Signed off at Vashi APMC Gate 2',
        },
      ],
    },
  ];
}

let storeCache: StoreData = loadOrSeedStore();

function loadOrSeedStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      if (
        Array.isArray(parsed.lots) &&
        parsed.lots.length > 0 &&
        parsed.lots[0].title !== undefined &&
        parsed.siteSettings &&
        Array.isArray(parsed.users) &&
        parsed.users.length > 0 &&
        Array.isArray(parsed.notifications)
      ) {
        const defaults = defaultSiteSettings();
        return {
          lots: parsed.lots,
          siteSettings: {
            ...defaults,
            ...parsed.siteSettings,
            categories:
              Array.isArray(parsed.siteSettings.categories) &&
              parsed.siteSettings.categories.length > 0
                ? parsed.siteSettings.categories
                : defaults.categories,
            grades:
              Array.isArray(parsed.siteSettings.grades) &&
              parsed.siteSettings.grades.length > 0
                ? parsed.siteSettings.grades
                : defaults.grades,
            heroBannerSlides:
              Array.isArray(parsed.siteSettings.heroBannerSlides) &&
              parsed.siteSettings.heroBannerSlides.length > 0
                ? parsed.siteSettings.heroBannerSlides
                : defaults.heroBannerSlides,
          },
          users: parsed.users,
          notifications: parsed.notifications,
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
        };
      }
    }
  } catch {
    // Re-seed if missing or old schema.
  }
  const seeded: StoreData = {
    lots: buildSeedLots(),
    siteSettings: defaultSiteSettings(),
    users: defaultUsers(),
    notifications: defaultNotifications(),
    inquiries: [],
  };
  persistStore(seeded);
  return seeded;
}

function persistStore(data: StoreData): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Read-only serverless filesystem fallback (e.g. Vercel / Netlify Lambda)
  }
}

function pushNotification(
  input: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>
): void {
  storeCache.notifications.unshift({
    ...input,
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  if (storeCache.notifications.length > 40) {
    storeCache.notifications = storeCache.notifications.slice(0, 40);
  }
}

export function toPublicAuthUser(account: SandboxAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    displayName: account.displayName,
    companyName: account.companyName,
    vendorCode: account.vendorCode,
  };
}

export function authenticateSandboxUser(
  email: string,
  password: string
): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const account = storeCache.users.find(
    (u) => u.email.toLowerCase() === normalized
  );
  if (!account) return null;
  if (!verifyPassword(password, account.passwordHash)) return null;
  return toPublicAuthUser(account);
}

export function registerSandboxUser(input: {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role: 'user' | 'admin';
}): AuthUser {
  const normalized = input.email.trim().toLowerCase();
  const existing = storeCache.users.find(
    (u) => u.email.toLowerCase() === normalized
  );
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
  const vendorNum = 20 + storeCache.users.length;
  const account: SandboxAccount = {
    id,
    email: normalized,
    role: input.role,
    displayName: input.fullName.trim(),
    companyName: input.companyName.trim(),
    vendorCode:
      input.role === 'admin' ? 'ADMIN-DESK' : `Vendor #V-${vendorNum}`,
    passwordHash: hashPassword(input.password),
  };
  storeCache.users.push(account);
  persistStore(storeCache);
  return toPublicAuthUser(account);
}

export function getLots(): Lot[] {
  return storeCache.lots;
}

export function getSiteSettings(): SiteSettings {
  return storeCache.siteSettings;
}

export function getNotifications(role: 'user' | 'admin'): AppNotification[] {
  return storeCache.notifications.filter(
    (n) => n.recipientRole === 'all' || n.recipientRole === role
  );
}

export function markAllNotificationsRead(role: 'user' | 'admin'): AppNotification[] {
  storeCache.notifications = storeCache.notifications.map((n) =>
    n.recipientRole === 'all' || n.recipientRole === role
      ? { ...n, isRead: true }
      : n
  );
  persistStore(storeCache);
  return getNotifications(role);
}

export function addContactInquiry(input: {
  name: string;
  email: string;
  company: string;
  message: string;
}): ContactInquiry {
  const item: ContactInquiry = {
    id: `inq-${crypto.randomUUID().slice(0, 8)}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  storeCache.inquiries.unshift(item);
  pushNotification({
    recipientRole: 'admin',
    title: `New Desk Inquiry from ${input.name}`,
    body: input.message.slice(0, 120),
    kind: 'info',
    lotId: null,
  });
  persistStore(storeCache);
  return item;
}

export function updateSiteSettings(
  patch: Partial<Omit<SiteSettings, 'updatedAt'>>
): SiteSettings {
  storeCache.siteSettings = {
    ...storeCache.siteSettings,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  persistStore(storeCache);
  return storeCache.siteSettings;
}

export function resetLots(): StoreData {
  storeCache = {
    lots: buildSeedLots(),
    siteSettings: defaultSiteSettings(),
    users: storeCache.users,
    notifications: defaultNotifications(),
    inquiries: storeCache.inquiries,
  };
  persistStore(storeCache);
  return storeCache;
}

export interface CreateLotInput {
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

export function createLot(input: CreateLotInput): Lot {
  const num = 1047 + storeCache.lots.length;
  const durationHours =
    input.windowMinutes && input.windowMinutes > 0
      ? input.windowMinutes / 60
      : input.windowHours;
  const matchedCat = storeCache.siteSettings.categories.find(
    (c) => c.name.toLowerCase() === input.produce.toLowerCase()
  );
  const newLot: Lot = {
    id: `lot-${input.produce.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    lotCode: `TF-${num}`,
    title:
      input.title?.trim() || `${input.origin} ${input.grade} ${input.produce}`,
    description:
      input.description?.trim() ||
      `Direct farm-sourced ${input.produce.toLowerCase()} lot graded at ${input.origin} aggregation hub.`,
    tags:
      input.tags && input.tags.length > 0
        ? input.tags
        : [input.grade, input.origin, 'Farm Direct'],
    produce: input.produce,
    subCategory: input.subCategory?.trim() || '',
    grade: input.grade,
    quantityKg: input.quantityKg,
    origin: input.origin,
    farmName: input.farmName?.trim() || `${input.origin} Direct Growers`,
    harvestDate: input.harvestDate,
    askPricePerKg: input.askPricePerKg,
    endsAt: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
    status: 'open',
    imageUrl:
      input.imageUrl?.trim() ||
      matchedCat?.imageUrl ||
      PRODUCE_IMAGE_MAP[input.produce] ||
      '/images/produce-tomato.jpg',
    featuredOnHome: input.featuredOnHome ?? true,
    bids: [],
    winningVendorId: null,
    winningBidPerKg: null,
    qualityReport: {
      grade: input.grade,
      moisturePct: input.moisturePct ?? 90.0,
      sizeGrading: input.sizeGrading?.trim() || 'Standard market spec',
      defectPct: input.defectPct ?? 1.5,
      testedBy: 'R. Deshmukh (Desk QC)',
      testedAt: 'Initial intake check',
      outcome: 'pass',
      photoNote: 'Intake lot tagged at aggregation hub',
    },
    deliveryAddress:
      input.deliveryAddress?.trim() ||
      'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
    shippingCarrier: input.shippingCarrier?.trim() || 'Trade Fresh Logistics',
    vehicleNumber: 'Pending dispatch',
    traderContact: {
      name: 'Raghav Deshmukh',
      phone: '+91 98204 51190',
      hub: `${input.origin} Aggregation Hub`,
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
        statusLine: 'Final dispatch quality audit pending',
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
  };
  storeCache.lots = [newLot, ...storeCache.lots];
  pushNotification({
    recipientRole: 'all',
    title: `New Ask Order · ${newLot.title}`,
    body: `${newLot.quantityKg} kg at ₹${newLot.askPricePerKg}/kg ask from ${newLot.origin}.`,
    kind: 'lot',
    lotId: newLot.id,
  });
  persistStore(storeCache);
  return newLot;
}

export function updateLotControls(
  lotId: string,
  patch: {
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
): Lot {
  const lot = storeCache.lots.find((item) => item.id === lotId);
  if (!lot) throw new Error('Lot not found.');

  if (patch.title !== undefined && patch.title.trim()) {
    lot.title = patch.title.trim();
  }
  if (patch.description !== undefined) {
    lot.description = patch.description.trim();
  }
  if (patch.tags !== undefined) {
    lot.tags = patch.tags;
  }
  if (patch.produce !== undefined && patch.produce.trim()) {
    lot.produce = patch.produce.trim();
  }
  if (patch.subCategory !== undefined) {
    lot.subCategory = patch.subCategory.trim();
  }
  if (patch.grade !== undefined && patch.grade.trim()) {
    lot.grade = patch.grade.trim();
  }
  if (patch.endsAt !== undefined && patch.endsAt.trim()) {
    lot.endsAt = patch.endsAt.trim();
  }
  if (patch.quantityKg !== undefined && Number.isFinite(patch.quantityKg) && patch.quantityKg > 0) {
    lot.quantityKg = Math.round(patch.quantityKg);
  }
  if (patch.origin !== undefined && patch.origin.trim()) {
    lot.origin = patch.origin.trim();
  }
  if (patch.askPricePerKg !== undefined) {
    if (lot.status !== 'open') {
      throw new Error('Ask price can only be updated while the lot is open.');
    }
    if (!Number.isFinite(patch.askPricePerKg) || patch.askPricePerKg <= 0) {
      throw new Error('Ask price must be greater than ₹0/kg.');
    }
    lot.askPricePerKg = Math.round(patch.askPricePerKg);
  }
  if (patch.featuredOnHome !== undefined) {
    lot.featuredOnHome = patch.featuredOnHome;
  }
  if (patch.imageUrl !== undefined && patch.imageUrl.trim()) {
    lot.imageUrl = patch.imageUrl.trim();
  }
  if (patch.deliveryAddress !== undefined && patch.deliveryAddress.trim()) {
    lot.deliveryAddress = patch.deliveryAddress.trim();
  }
  if (patch.shippingCarrier !== undefined) {
    lot.shippingCarrier = patch.shippingCarrier.trim();
  }
  if (patch.vehicleNumber !== undefined) {
    lot.vehicleNumber = patch.vehicleNumber.trim();
  }

  persistStore(storeCache);
  return lot;
}

export function deleteLot(lotId: string): Lot[] {
  const exists = storeCache.lots.some((l) => l.id === lotId);
  if (!exists) throw new Error('Lot not found.');
  storeCache.lots = storeCache.lots.filter((l) => l.id !== lotId);
  persistStore(storeCache);
  return storeCache.lots;
}

export function getHighestBid(lot: Lot): number {
  if (lot.bids.length === 0) return 0;
  return Math.max(...lot.bids.map((b) => b.amountPerKg));
}

export function placeBid(
  lotId: string,
  amountPerKg: number,
  vendorLabel: string
): Lot {
  const lot = storeCache.lots.find((item) => item.id === lotId);
  if (!lot) throw new Error('Lot not found.');
  if (lot.status !== 'open') {
    throw new Error('Bidding is closed on this lot.');
  }
  const endsMs = new Date(lot.endsAt).getTime();
  if (Number.isFinite(endsMs) && endsMs <= Date.now()) {
    throw new Error('Bidding window has timed out. Bidding is closed for this lot.');
  }
  const currentHighest = getHighestBid(lot);
  if (!Number.isFinite(amountPerKg) || amountPerKg <= currentHighest) {
    throw new Error(
      currentHighest > 0
        ? `Bid must be higher than the current highest bid (₹${currentHighest}/kg).`
        : 'Bid must be greater than ₹0/kg.'
    );
  }
  lot.bids.unshift({
    id: `b-${Date.now()}`,
    vendorId: vendorLabel,
    vendorLabel,
    amountPerKg: Math.round(amountPerKg),
    createdAt: new Date().toISOString(),
  });
  pushNotification({
    recipientRole: 'all',
    title: `New Bid on ${lot.produce} (${lot.lotCode})`,
    body: `${vendorLabel} bid ₹${Math.round(amountPerKg)}/kg.`,
    kind: 'bid',
    lotId: lot.id,
  });
  persistStore(storeCache);
  return lot;
}

export function lockDeal(lotId: string): Lot {
  const lot = storeCache.lots.find((item) => item.id === lotId);
  if (!lot) throw new Error('Lot not found.');
  if (lot.status !== 'open') {
    throw new Error('This lot is already locked.');
  }
  if (lot.bids.length === 0) {
    throw new Error('Cannot lock deal before any vendor places a bid.');
  }
  const topBid = [...lot.bids].sort((a, b) => b.amountPerKg - a.amountPerKg)[0];
  const now = new Date().toISOString();
  lot.status = 'qc_pending';
  lot.winningVendorId = topBid.vendorId;
  lot.winningBidPerKg = topBid.amountPerKg;

  const lockStep = lot.timeline.find((s) => s.key === 'locked');
  if (lockStep) {
    lockStep.completedAt = now;
    lockStep.statusLine = `Locked to ${topBid.vendorLabel} at ₹${topBid.amountPerKg}/kg`;
  }
  pushNotification({
    recipientRole: 'all',
    title: `Deal Locked · ${lot.lotCode}`,
    body: `${lot.produce} locked to ${topBid.vendorLabel} at ₹${topBid.amountPerKg}/kg.`,
    kind: 'lock',
    lotId: lot.id,
  });
  persistStore(storeCache);
  return lot;
}

export interface QualityCheckInput {
  grade: ProduceGrade;
  moisturePct: number;
  defectPct: number;
  photoNote: string;
  outcome: 'pass' | 'fail';
}

export function submitQualityCheck(
  lotId: string,
  input: QualityCheckInput
): Lot {
  const lot = storeCache.lots.find((item) => item.id === lotId);
  if (!lot) throw new Error('Lot not found.');
  if (lot.status === 'open') {
    throw new Error('Lock the deal before submitting final quality check.');
  }

  const now = new Date().toISOString();
  const report: QualityReport = {
    ...lot.qualityReport,
    grade: input.grade,
    moisturePct: Number(input.moisturePct),
    defectPct: Number(input.defectPct),
    photoNote: input.photoNote.trim() || 'Inspection photo batch logged',
    outcome: input.outcome,
    testedAt: 'Just now',
  };
  lot.grade = input.grade;
  lot.qualityReport = report;
  lot.status = 'locked';

  const qcStep = lot.timeline.find((s) => s.key === 'quality_checked');
  if (qcStep) {
    qcStep.completedAt = now;
    qcStep.statusLine =
      input.outcome === 'pass'
        ? `${input.grade} passed (${input.defectPct}% defects, ${input.moisturePct}% moisture)`
        : `${input.grade} flagged for re-sorting (${input.defectPct}% defects)`;
  }
  pushNotification({
    recipientRole: 'user',
    title: `Quality Report Updated · ${lot.lotCode}`,
    body: `${lot.produce} marked ${input.outcome.toUpperCase()} (${input.grade}).`,
    kind: 'qc',
    lotId: lot.id,
  });
  persistStore(storeCache);
  return lot;
}

export function advanceDelivery(
  lotId: string,
  stage: 'dispatched' | 'delivered',
  shippingMeta?: { shippingCarrier?: string; vehicleNumber?: string }
): Lot {
  const lot = storeCache.lots.find((item) => item.id === lotId);
  if (!lot) throw new Error('Lot not found.');

  if (shippingMeta?.shippingCarrier?.trim()) {
    lot.shippingCarrier = shippingMeta.shippingCarrier.trim();
  }
  if (shippingMeta?.vehicleNumber?.trim()) {
    lot.vehicleNumber = shippingMeta.vehicleNumber.trim();
  }

  const now = new Date().toISOString();
  if (stage === 'dispatched') {
    lot.status = 'dispatched';
    const step = lot.timeline.find((s) => s.key === 'dispatched');
    if (step) {
      step.completedAt = now;
      step.statusLine = `Dispatched from ${lot.traderContact.hub} via ${
        lot.vehicleNumber || 'MH-15-TR-4418'
      }`;
    }
    pushNotification({
      recipientRole: 'user',
      title: `Dispatched · ${lot.lotCode}`,
      body: `${lot.produce} (${lot.quantityKg} kg) dispatched via ${lot.shippingCarrier}.`,
      kind: 'shipping',
      lotId: lot.id,
    });
  } else {
    lot.status = 'delivered';
    const dispatchStep = lot.timeline.find((s) => s.key === 'dispatched');
    if (dispatchStep && !dispatchStep.completedAt) {
      dispatchStep.completedAt = now;
      dispatchStep.statusLine = `Dispatched from ${lot.traderContact.hub}`;
    }
    const deliveredStep = lot.timeline.find((s) => s.key === 'delivered');
    if (deliveredStep) {
      deliveredStep.completedAt = now;
      deliveredStep.statusLine = `Signed off at ${lot.deliveryAddress}`;
    }
    pushNotification({
      recipientRole: 'all',
      title: `Delivered · ${lot.lotCode}`,
      body: `${lot.produce} received at ${lot.deliveryAddress}.`,
      kind: 'shipping',
      lotId: lot.id,
    });
  }
  persistStore(storeCache);
  return lot;
}
