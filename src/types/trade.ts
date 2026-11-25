export type UserRole = 'guest' | 'user' | 'admin';

export type ProduceCategory = string;

export type ProduceGrade = string;

export type LotStatus =
  | 'open'
  | 'qc_pending'
  | 'locked'
  | 'dispatched'
  | 'delivered';

export interface CategoryConfig {
  id: string;
  name: string;
  allowSubcategories: boolean;
  subcategories: string[];
  imageUrl?: string;
}

export interface HeroBannerSlide {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
}

export interface Bid {
  id: string;
  vendorId: string;
  vendorLabel: string;
  amountPerKg: number;
  createdAt: string;
}

export interface QualityReport {
  grade: ProduceGrade;
  moisturePct: number;
  sizeGrading: string;
  defectPct: number;
  testedBy: string;
  testedAt: string;
  outcome: 'pending' | 'pass' | 'fail';
  photoNote: string;
}

export interface DeliveryStep {
  key: 'locked' | 'quality_checked' | 'dispatched' | 'delivered';
  label: string;
  completedAt: string | null;
  statusLine: string;
}

export interface Lot {
  id: string;
  lotCode: string;
  title: string;
  description: string;
  tags: string[];
  produce: ProduceCategory;
  subCategory?: string;
  grade: ProduceGrade;
  quantityKg: number;
  origin: string;
  farmName: string;
  harvestDate: string;
  askPricePerKg: number;
  endsAt: string;
  status: LotStatus;
  imageUrl: string;
  featuredOnHome: boolean;
  bids: Bid[];
  winningVendorId: string | null;
  winningBidPerKg: number | null;
  qualityReport: QualityReport;
  deliveryAddress: string;
  shippingCarrier: string;
  vehicleNumber: string;
  traderContact: {
    name: string;
    phone: string;
    hub: string;
  };
  timeline: DeliveryStep[];
}

export interface SiteSettings {
  announcementText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroImageUrl: string;
  enableSubcategoriesGlobal: boolean;
  categories: CategoryConfig[];
  grades: string[];
  heroBannerSlides: HeroBannerSlide[];
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  recipientRole: 'all' | 'user' | 'admin';
  title: string;
  body: string;
  message?: string;
  kind: 'bid' | 'lock' | 'qc' | 'shipping' | 'lot' | 'info';
  lotId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Exclude<UserRole, 'guest'>;
  displayName: string;
  companyName: string;
  vendorCode: string;
  phone?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
}
