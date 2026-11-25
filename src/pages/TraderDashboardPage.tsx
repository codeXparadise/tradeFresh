import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Eye,
  Lock,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { AdminAnalyticsCharts } from '../components/AdminAnalyticsCharts';
import { LiveTicker } from '../components/LiveTicker';
import { LotCard } from '../components/LotCard';
import { MetricCard } from '../components/MetricCard';
import { StatusChip } from '../components/StatusChip';
import { Timeline } from '../components/Timeline';
import { useTradeStore } from '../context/TradeStoreContext';
import type {
  CategoryConfig,
  Lot,
  ProduceCategory,
  ProduceGrade,
} from '../types/trade';
import {
  formatCountdown,
  formatInr,
  formatKg,
  formatTimestamp,
  getHighestBidEntry,
  isLotBiddingClosed,
} from '../utils/format';

export type AdminSection =
  | 'overview'
  | 'create'
  | 'lots'
  | 'deals'
  | 'shipping'
  | 'site';

interface TraderDashboardPageProps {
  section: AdminSection;
  onNavigate: (path: string) => void;
}

export function TraderDashboardPage({
  section,
  onNavigate,
}: TraderDashboardPageProps) {
  const {
    lots,
    siteSettings,
    notifications,
    nowMs,
    isSyncing,
    isSupabaseMode,
    createLot,
    updateLot,
    deleteLot,
    toggleLotFeatured,
    uploadLotImage,
    updateSiteSettings,
    lockDeal,
    submitQualityCheck,
    advanceDelivery,
    resetDemo,
    showToast,
  } = useTradeStore();

  const categories = siteSettings.categories ?? [];
  const grades = siteSettings.grades ?? ['Grade A', 'Grade B'];

  // Homepage / Site CMS & Taxonomy controls
  const [heroHeadline, setHeroHeadline] = useState(siteSettings.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(
    siteSettings.heroSubheadline
  );
  const [announcementText, setAnnouncementText] = useState(
    siteSettings.announcementText
  );
  const [heroCtaPrimary, setHeroCtaPrimary] = useState(
    siteSettings.heroCtaPrimary
  );
  const [enableSubcategoriesGlobal, setEnableSubcategoriesGlobal] = useState(
    siteSettings.enableSubcategoriesGlobal ?? true
  );
  const [draftCategories, setDraftCategories] = useState<CategoryConfig[]>(
    categories
  );
  const [draftGrades, setDraftGrades] = useState<string[]>(grades);
  const [newCatName, setNewCatName] = useState('');
  const [newSubInputs, setNewSubInputs] = useState<Record<string, string>>({});
  const [newGradeName, setNewGradeName] = useState('');
  const [showSitePreview, setShowSitePreview] = useState(true);
  const [cmsError, setCmsError] = useState<string | null>(null);

  useEffect(() => {
    setHeroHeadline(siteSettings.heroHeadline);
    setHeroSubheadline(siteSettings.heroSubheadline);
    setAnnouncementText(siteSettings.announcementText);
    setHeroCtaPrimary(siteSettings.heroCtaPrimary);
    setEnableSubcategoriesGlobal(siteSettings.enableSubcategoriesGlobal ?? true);
    setDraftCategories(siteSettings.categories ?? []);
    setDraftGrades(siteSettings.grades ?? ['Grade A', 'Grade B']);
  }, [siteSettings]);

  // Create Ask Order form state
  const [title, setTitle] = useState('Vine-Ripened Nashik Roma Tomatoes');
  const [description, setDescription] = useState(
    'Daylight-graded firm red tomatoes packed in 25 kg ventilated crates.'
  );
  const [tagsInput, setTagsInput] = useState('Daylight QC, Farm Direct, Crates');
  const [produce, setProduce] = useState<ProduceCategory>(
    categories[0]?.name || 'Tomato'
  );
  const [subCategory, setSubCategory] = useState<string>(
    categories[0]?.subcategories[0] || ''
  );
  const [customCatInline, setCustomCatInline] = useState('');
  const [customSubInline, setCustomSubInline] = useState('');
  const [grade, setGrade] = useState<ProduceGrade>(grades[0] || 'Grade A');
  const [customGradeInline, setCustomGradeInline] = useState('');
  const [quantityKg, setQuantityKg] = useState('500');
  const [origin, setOrigin] = useState('Nashik');
  const [farmName, setFarmName] = useState('Sahyadri FPO');
  const [harvestDate, setHarvestDate] = useState('Today, 06:00 AM');
  const [askPrice, setAskPrice] = useState('22');
  const [windowUnit, setWindowUnit] = useState<'hours' | 'minutes'>('hours');
  const [windowAmount, setWindowAmount] = useState('2');
  const [moisturePct, setMoisturePct] = useState('92.5');
  const [defectPct, setDefectPct] = useState('1.5');
  const [sizeGrading, setSizeGrading] = useState('55–65 mm uniform');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai'
  );
  const [shippingCarrier, setShippingCarrier] = useState('Trade Fresh Cold Chain');
  const [lotImageUrl, setLotImageUrl] = useState('/images/produce-tomato.jpg');
  const [featuredOnHome, setFeaturedOnHome] = useState(true);
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createShakeKey, setCreateShakeKey] = useState(0);

  // Selected lot drawer / edit state
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [drawerDismissed, setDrawerDismissed] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editProduce, setEditProduce] = useState('');
  const [editSubCat, setEditSubCat] = useState('');
  const [editAskInput, setEditAskInput] = useState('');
  const [editQtyInput, setEditQtyInput] = useState('');
  const [editOriginInput, setEditOriginInput] = useState('');
  const [editGradeInput, setEditGradeInput] = useState<ProduceGrade>('Grade A');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Shipping inputs
  const [shipCarrierInput, setShipCarrierInput] = useState('');
  const [shipVehicleInput, setShipVehicleInput] = useState('');

  // Quality check form state
  const [qcGrade, setQcGrade] = useState<ProduceGrade>('Grade A');
  const [qcMoisture, setQcMoisture] = useState('92.4');
  const [qcDefect, setQcDefect] = useState('1.5');
  const [qcPhotoNote, setQcPhotoNote] = useState('Crate sample #QC-01 verified');
  const [qcOutcome, setQcOutcome] = useState<'pass' | 'fail'>('pass');
  const [drawerError, setDrawerError] = useState<string | null>(null);

  const activeCategoryCfg = useMemo(
    () =>
      categories.find(
        (c) => c.name.toLowerCase() === produce.toLowerCase()
      ) ?? null,
    [categories, produce]
  );

  const selectedLot: Lot | null = useMemo(() => {
    if (drawerDismissed) return null;
    if (selectedLotId) {
      return lots.find((l) => l.id === selectedLotId) ?? lots[0] ?? null;
    }
    return lots[0] ?? null;
  }, [drawerDismissed, lots, selectedLotId]);

  useEffect(() => {
    if (!selectedLot) return;
    setEditTitle(selectedLot.title || selectedLot.produce);
    setEditDescription(selectedLot.description || '');
    setEditTags((selectedLot.tags || []).join(', '));
    setEditProduce(selectedLot.produce);
    setEditSubCat(selectedLot.subCategory || '');
    setEditAskInput(String(selectedLot.askPricePerKg));
    setEditQtyInput(String(selectedLot.quantityKg));
    setEditOriginInput(selectedLot.origin);
    setEditGradeInput(selectedLot.grade);
    setQcGrade(selectedLot.qualityReport.grade);
    setQcMoisture(String(selectedLot.qualityReport.moisturePct));
    setQcDefect(String(selectedLot.qualityReport.defectPct));
    setQcPhotoNote(selectedLot.qualityReport.photoNote);
    setQcOutcome(selectedLot.qualityReport.outcome === 'fail' ? 'fail' : 'pass');
    setShipCarrierInput(selectedLot.shippingCarrier || 'Trade Fresh Logistics');
    setShipVehicleInput(selectedLot.vehicleNumber || 'MH-14-TF-8821');
  }, [selectedLot]);

  const metrics = useMemo(() => {
    const activeLots = lots.filter((l) => !isLotBiddingClosed(l, nowMs));
    const openBids = activeLots.reduce((sum, l) => sum + l.bids.length, 0);
    const dealsLocked = lots.filter((l) => l.status !== 'open').length;
    const qtyToDeliver = lots
      .filter(
        (l) =>
          l.status === 'qc_pending' ||
          l.status === 'locked' ||
          l.status === 'dispatched'
      )
      .reduce((sum, l) => sum + l.quantityKg, 0);

    return {
      activeLots: activeLots.length,
      openBids,
      dealsLocked,
      qtyToDeliver,
    };
  }, [lots, nowMs]);

  const lockedDeals = useMemo(() => {
    return lots.filter((l) => l.status !== 'open');
  }, [lots]);

  const handleSelectLot = (lot: Lot) => {
    setDrawerDismissed(false);
    setSelectedLotId(lot.id);
    setConfirmDeleteId(null);
    setDrawerError(null);
  };

  const handleProduceChange = (nextProduce: ProduceCategory) => {
    setProduce(nextProduce);
    const cfg = categories.find(
      (c) => c.name.toLowerCase() === nextProduce.toLowerCase()
    );
    if (cfg?.imageUrl) setLotImageUrl(cfg.imageUrl);
    setSubCategory(
      cfg && cfg.allowSubcategories && cfg.subcategories.length > 0
        ? cfg.subcategories[0]
        : ''
    );
    setTitle(`Fresh ${origin || 'Mandi'} ${grade} ${nextProduce}`);
  };

  const handleAddInlineCategory = async () => {
    const trimmed = customCatInline.trim();
    if (trimmed.length < 2) return;
    if (!categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      const next: CategoryConfig = {
        id: `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: trimmed,
        allowSubcategories: true,
        subcategories: customSubInline.trim() ? [customSubInline.trim()] : [],
        imageUrl: lotImageUrl,
      };
      await updateSiteSettings({ categories: [...categories, next] });
    }
    setProduce(trimmed);
    if (customSubInline.trim()) setSubCategory(customSubInline.trim());
    setCustomCatInline('');
    setCustomSubInline('');
  };

  const handleAddInlineGrade = async () => {
    const trimmed = customGradeInline.trim();
    if (!trimmed) return;
    if (!grades.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      await updateSiteSettings({ grades: [...grades, trimmed] });
    }
    setGrade(trimmed);
    setCustomGradeInline('');
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    applyToSelected = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateError(null);
    setDrawerError(null);
    setUploadingImage(true);
    const res = await uploadLotImage(file);
    setUploadingImage(false);
    if (!res.ok || !res.url) {
      if (applyToSelected) setDrawerError(res.error || 'Upload failed.');
      else setCreateError(res.error || 'Upload failed.');
      return;
    }
    if (applyToSelected && selectedLot) {
      await updateLot(selectedLot.id, { imageUrl: res.url });
    } else {
      setLotImageUrl(res.url);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsError(null);
    const res = await updateSiteSettings({
      heroHeadline,
      heroSubheadline,
      announcementText,
      heroCtaPrimary,
      enableSubcategoriesGlobal,
      categories: draftCategories,
      grades: draftGrades,
    });
    if (!res.ok && res.error) setCmsError(res.error);
  };

  // Preview Lot object constructed from Create form state
  const previewLotObj: Lot = useMemo(() => {
    const numericQty = Number(quantityKg) || 500;
    const numericAsk = Number(askPrice) || 20;
    const mins =
      windowUnit === 'minutes'
        ? Math.max(1, Number(windowAmount) || 30)
        : Math.max(1, Number(windowAmount) || 2) * 60;
    return {
      id: 'preview-lot',
      lotCode: 'PREVIEW',
      title: title.trim() || `${origin} ${grade} ${produce}`,
      description: description.trim(),
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      produce,
      subCategory:
        enableSubcategoriesGlobal &&
        (!activeCategoryCfg || activeCategoryCfg.allowSubcategories)
          ? subCategory.trim()
          : '',
      grade,
      quantityKg: numericQty,
      origin: origin.trim() || 'Nashik',
      farmName: farmName.trim() || 'Direct Grower',
      harvestDate: harvestDate.trim() || 'Today',
      askPricePerKg: numericAsk,
      endsAt: new Date(nowMs + mins * 60 * 1000).toISOString(),
      status: 'open',
      imageUrl: lotImageUrl,
      featuredOnHome,
      bids: [],
      winningVendorId: null,
      winningBidPerKg: null,
      qualityReport: {
        grade,
        moisturePct: Number(moisturePct) || 90,
        sizeGrading,
        defectPct: Number(defectPct) || 1.5,
        testedBy: 'Desk QC',
        testedAt: 'Preview',
        outcome: 'pass',
        photoNote: 'Preview',
      },
      deliveryAddress,
      shippingCarrier,
      vehicleNumber: 'Pending',
      traderContact: {
        name: 'Raghav Deshmukh',
        phone: '+91 98204 51190',
        hub: `${origin} Hub`,
      },
      timeline: [],
    };
  }, [
    activeCategoryCfg,
    askPrice,
    defectPct,
    deliveryAddress,
    description,
    enableSubcategoriesGlobal,
    farmName,
    featuredOnHome,
    grade,
    harvestDate,
    lotImageUrl,
    moisturePct,
    nowMs,
    origin,
    produce,
    quantityKg,
    shippingCarrier,
    sizeGrading,
    subCategory,
    tagsInput,
    title,
    windowAmount,
    windowUnit,
  ]);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const qty = Number(quantityKg);
    const ask = Number(askPrice);
    const durVal = Number(windowAmount);
    if (
      !origin.trim() ||
      !Number.isFinite(qty) ||
      qty < 10 ||
      !Number.isFinite(ask) ||
      ask <= 0 ||
      !Number.isFinite(durVal) ||
      durVal <= 0
    ) {
      setCreateError('Enter valid origin, quantity (>=10 kg), ask price, and duration.');
      setCreateShakeKey((k) => k + 1);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await createLot({
      title: title.trim(),
      description: description.trim(),
      tags,
      produce,
      subCategory:
        enableSubcategoriesGlobal &&
        (!activeCategoryCfg || activeCategoryCfg.allowSubcategories)
          ? subCategory.trim()
          : '',
      grade,
      quantityKg: qty,
      origin: origin.trim(),
      farmName: farmName.trim(),
      harvestDate: harvestDate.trim() || 'Today, 06:00 AM',
      askPricePerKg: ask,
      windowHours: windowUnit === 'hours' ? durVal : durVal / 60,
      windowMinutes: windowUnit === 'minutes' ? durVal : undefined,
      imageUrl: lotImageUrl,
      featuredOnHome,
      moisturePct: Number(moisturePct),
      defectPct: Number(defectPct),
      sizeGrading,
      deliveryAddress,
      shippingCarrier,
    });
    if (!res.ok) {
      setCreateError(res.error || 'Could not publish lot.');
      setCreateShakeKey((k) => k + 1);
      return;
    }
    onNavigate('/admin/lots');
  };

  const handleSaveLotEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;
    setDrawerError(null);
    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Parameters<typeof updateLot>[1] = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags,
      produce: editProduce.trim() || selectedLot.produce,
      subCategory: editSubCat.trim(),
      grade: editGradeInput,
      quantityKg: Number(editQtyInput),
      origin: editOriginInput.trim(),
    };
    if (selectedLot.status === 'open') {
      payload.askPricePerKg = Number(editAskInput);
    }

    const res = await updateLot(selectedLot.id, payload);
    if (!res.ok && res.error) setDrawerError(res.error);
  };

  const handleExtendWindow = async (lot: Lot) => {
    const newEnds = new Date(Date.now() + 3600 * 1000).toISOString();
    const res = await updateLot(lot.id, { endsAt: newEnds });
    if (res.ok) showToast(`Extended bidding window on ${lot.lotCode} by +1 hour.`, 'info');
  };

  const handleDeleteLot = async (lotId: string) => {
    setDrawerError(null);
    const res = await deleteLot(lotId);
    if (!res.ok && res.error) {
      setDrawerError(res.error);
      return;
    }
    setConfirmDeleteId(null);
    setSelectedLotId(null);
  };

  const handleLockDeal = async (lotId: string) => {
    setDrawerError(null);
    const res = await lockDeal(lotId);
    if (!res.ok && res.error) setDrawerError(res.error);
  };

  const handleQualitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;
    setDrawerError(null);
    const res = await submitQualityCheck(selectedLot.id, {
      grade: qcGrade,
      moisturePct: Number(qcMoisture),
      defectPct: Number(qcDefect),
      photoNote: qcPhotoNote,
      outcome: qcOutcome,
    });
    if (!res.ok && res.error) setDrawerError(res.error);
  };

  const handleDelivery = async (
    lotId: string,
    stage: 'dispatched' | 'delivered',
    meta?: { shippingCarrier?: string; vehicleNumber?: string }
  ) => {
    setDrawerError(null);
    const res = await advanceDelivery(lotId, stage, meta);
    if (!res.ok && res.error) setDrawerError(res.error);
  };

  const highestBidEntry = selectedLot ? getHighestBidEntry(selectedLot) : null;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Live Ask / Bids Ticker inside Admin Dashboard */}
      <div className="tf-card" style={{ overflow: 'hidden' }}>
        <LiveTicker lots={lots} />
      </div>

      {/* SECTION: OVERVIEW WITH REAL RECHARTS ANALYTICS */}
      {section === 'overview' ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
            <div>
              <span className="tf-label">Admin Desk · Overview</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
                Trader Operations & Analytics
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate('/admin/create')}
                className="tf-btn tf-btn-bb"
              >
                + Create Ask Order
              </button>
              {!isSupabaseMode ? (
                <button
                  type="button"
                  onClick={() => void resetDemo()}
                  disabled={isSyncing}
                  className="tf-btn tf-btn-secondary"
                >
                  <RotateCcw size={16} />
                  Reset sandbox
                </button>
              ) : null}
            </div>
          </div>

          <div className="tf-metrics-grid">
            <MetricCard label="Open lots" value={metrics.activeLots} />
            <MetricCard label="Live bids" value={metrics.openBids} />
            <MetricCard label="Deals locked" value={metrics.dealsLocked} />
            <MetricCard
              label="Quantity to deliver"
              value={metrics.qtyToDeliver.toLocaleString('en-IN')}
              unit="kg"
            />
          </div>

          {/* Dynamic Charts & Quality Measures */}
          <AdminAnalyticsCharts lots={lots} grades={grades} nowMs={nowMs} />

          <div className="tf-overview-grid">
            <div className="tf-card" style={{ overflowX: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                  Active lots at a glance
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/lots')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tf-primary)', fontSize: '13px', fontWeight: 600 }}
                >
                  Manage all →
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--tf-border-strong)', backgroundColor: 'var(--tf-bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Lot</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Ask</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Top Bid</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.slice(0, 6).map((lot) => {
                    const top = getHighestBidEntry(lot);
                    const closed = isLotBiddingClosed(lot, nowMs);
                    return (
                      <tr key={lot.id} style={{ borderBottom: '1px solid var(--tf-border)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{lot.title || lot.produce}</div>
                          <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                            {lot.lotCode} · {lot.produce}
                            {lot.subCategory ? ` (${lot.subCategory})` : ''} · {formatKg(lot.quantityKg)}
                          </div>
                        </td>
                        <td className="tf-tabular" style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {formatInr(lot.askPricePerKg)}/kg
                        </td>
                        <td className="tf-tabular" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--tf-primary)' }}>
                          {top ? `${formatInr(top.amountPerKg)}/kg` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {lot.status === 'open' && closed ? (
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tf-live-text)' }}>
                              Bidding Closed
                            </span>
                          ) : (
                            <StatusChip status={lot.status} />
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {lot.status === 'open' && top ? (
                            <button
                              type="button"
                              onClick={() => void handleLockDeal(lot.id)}
                              className="tf-btn tf-btn-primary"
                              style={{ minHeight: '36px', paddingInline: '12px', fontSize: '13px' }}
                            >
                              Lock deal
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectLot(lot);
                                onNavigate('/admin/lots');
                              }}
                              className="tf-btn tf-btn-secondary"
                              style={{ minHeight: '36px', paddingInline: '12px', fontSize: '13px' }}
                            >
                              Inspect
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* New Activity Feed */}
            <div className="tf-card" style={{ overflow: 'hidden', alignSelf: 'start' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tf-border)' }}>
                <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                  Recent activity
                </h2>
              </div>
              <div>
                {notifications.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 18px',
                      borderBottom:
                        idx === Math.min(4, notifications.length - 1)
                          ? 'none'
                          : '1px solid var(--tf-border)',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                      {item.body}
                    </div>
                    <div className="tf-tabular" style={{ fontSize: '11px', color: 'var(--tf-muted)', marginTop: '4px' }}>
                      {formatTimestamp(item.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* SECTION: DEDICATED CREATE ASK ORDER SUB-PAGE + LIVE PREVIEW */}
      {section === 'create' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span className="tf-label">Admin · Custom Ask Order</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
                Create Custom Ask Order
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--tf-muted)' }}>
                Configure custom categories, optional subcategories, custom quality grades, bidding time, and preview before publishing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOrderPreview((p) => !p)}
              className={`tf-btn ${showOrderPreview ? 'tf-btn-primary' : 'tf-btn-secondary'}`}
            >
              <Eye size={16} />
              {showOrderPreview ? 'Hide Live Preview' : 'Preview Before Publishing'}
            </button>
          </div>

          <div className={showOrderPreview ? 'tf-create-with-preview' : undefined}>
            <form
              key={createShakeKey}
              onSubmit={handleCreateLot}
              className={`tf-card ${createError ? 'tf-shake-error' : ''}`}
              style={{ padding: '24px', display: 'grid', gap: '20px' }}
            >
              <div className="tf-create-split">
                {/* Left: Photo preview & upload */}
                <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                  <div className="tf-card" style={{ overflow: 'hidden' }}>
                    <img
                      src={lotImageUrl}
                      alt="Produce lot preview"
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <label className="tf-btn tf-btn-secondary" style={{ cursor: 'pointer', width: '100%' }}>
                    <Upload size={16} />
                    {uploadingImage ? 'Uploading image...' : 'Upload custom photo'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => void handleFileUpload(e, false)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={featuredOnHome}
                      onChange={(e) => setFeaturedOnHome(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Feature on Homepage
                  </label>
                </div>

                {/* Right: Customizable fields */}
                <div style={{ display: 'grid', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span className="tf-label">Lot title</span>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Vine-Ripened Nashik Roma Tomatoes"
                      className="tf-input"
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span className="tf-label">Lot description</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe crate packaging, firmness, sorting notes..."
                      className="tf-textarea"
                    />
                  </label>

                  {/* Category + Optional Subcategory + Custom Grade Controls */}
                  <div className="tf-create-lot-grid">
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Category</span>
                      <select
                        value={produce}
                        onChange={(e) => handleProduceChange(e.target.value)}
                        className="tf-select"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                        {!categories.some((c) => c.name === produce) ? (
                          <option value={produce}>{produce}</option>
                        ) : null}
                      </select>
                    </label>

                    {enableSubcategoriesGlobal &&
                    (!activeCategoryCfg || activeCategoryCfg.allowSubcategories) ? (
                      <label style={{ display: 'grid', gap: '6px' }}>
                        <span className="tf-label">Sub-Category (Optional)</span>
                        <input
                          list="tf-subcat-options"
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          placeholder="Optional variety..."
                          className="tf-input"
                        />
                        <datalist id="tf-subcat-options">
                          {(activeCategoryCfg?.subcategories ?? []).map((sc) => (
                            <option key={sc} value={sc} />
                          ))}
                        </datalist>
                      </label>
                    ) : null}

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Quality grade</span>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="tf-select"
                      >
                        {grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                        {!grades.includes(grade) ? (
                          <option value={grade}>{grade}</option>
                        ) : null}
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Quantity (kg)</span>
                      <input
                        type="number"
                        min={10}
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Ask price (₹/kg)</span>
                      <input
                        type="number"
                        min={1}
                        value={askPrice}
                        onChange={(e) => setAskPrice(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Bidding Duration</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(56px, 1fr) 74px', gap: '6px' }}>
                        <input
                          type="number"
                          min={1}
                          value={windowAmount}
                          onChange={(e) => setWindowAmount(e.target.value)}
                          className="tf-input tf-tabular"
                        />
                        <select
                          value={windowUnit}
                          onChange={(e) => setWindowUnit(e.target.value as 'hours' | 'minutes')}
                          className="tf-select"
                        >
                          <option value="hours">hrs</option>
                          <option value="minutes">mins</option>
                        </select>
                      </div>
                    </div>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Village / Origin</span>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="tf-input"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Farmer / FPO</span>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="tf-input"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Moisture %</span>
                      <input
                        type="number"
                        step="0.1"
                        value={moisturePct}
                        onChange={(e) => setMoisturePct(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Defect %</span>
                      <input
                        type="number"
                        step="0.1"
                        value={defectPct}
                        onChange={(e) => setDefectPct(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Size grading</span>
                      <input
                        type="text"
                        value={sizeGrading}
                        onChange={(e) => setSizeGrading(e.target.value)}
                        className="tf-input"
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span className="tf-label">Carrier</span>
                      <input
                        type="text"
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                        className="tf-input"
                      />
                    </label>
                  </div>

                  {/* Quick Inline Custom Category & Grade Adders */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--tf-bg)',
                      border: '1px solid var(--tf-border)',
                      display: 'grid',
                      gap: '10px',
                    }}
                  >
                    <span className="tf-label">Quick Custom Category & Grade</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <input
                        type="text"
                        value={customCatInline}
                        onChange={(e) => setCustomCatInline(e.target.value)}
                        placeholder="New category (e.g. Spinach)"
                        className="tf-input"
                        style={{ flex: 1, minWidth: '150px', minHeight: '38px' }}
                      />
                      <input
                        type="text"
                        value={customSubInline}
                        onChange={(e) => setCustomSubInline(e.target.value)}
                        placeholder="Subcategory (optional)"
                        className="tf-input"
                        style={{ flex: 1, minWidth: '140px', minHeight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => void handleAddInlineCategory()}
                        className="tf-btn tf-btn-secondary"
                        style={{ minHeight: '38px' }}
                      >
                        <Plus size={14} /> Add Category
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <input
                        type="text"
                        value={customGradeInline}
                        onChange={(e) => setCustomGradeInline(e.target.value)}
                        placeholder="New custom grade (e.g. Export A+)"
                        className="tf-input"
                        style={{ flex: 1, minWidth: '170px', minHeight: '38px' }}
                      />
                      <button
                        type="button"
                        onClick={() => void handleAddInlineGrade()}
                        className="tf-btn tf-btn-secondary"
                        style={{ minHeight: '38px' }}
                      >
                        <Plus size={14} /> Add Grade
                      </button>
                    </div>
                  </div>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span className="tf-label">Tags (comma separated)</span>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="tf-input"
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px' }}>
                    <span className="tf-label">Harvest & Target APMC Delivery Address</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                      <input
                        type="text"
                        value={harvestDate}
                        onChange={(e) => setHarvestDate(e.target.value)}
                        className="tf-input"
                      />
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="tf-input"
                      />
                    </div>
                  </label>

                  {createError ? (
                    <p role="alert" style={{ margin: 0, fontSize: '13px', color: 'var(--tf-live-text)', fontWeight: 600 }}>
                      {createError}
                    </p>
                  ) : null}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowOrderPreview(true)}
                      className="tf-btn tf-btn-secondary"
                    >
                      <Eye size={15} />
                      Preview Card
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/admin/lots')}
                      className="tf-btn tf-btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSyncing || uploadingImage}
                      className="tf-btn tf-btn-bb"
                    >
                      Publish Ask Order
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {showOrderPreview ? (
              <aside className="tf-card tf-fade-up" style={{ padding: '18px', display: 'grid', gap: '14px', alignContent: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tf-label" style={{ color: '#5E9E31' }}>
                    Live Pre-Publish Card Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOrderPreview(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tf-muted)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <LotCard lot={previewLotObj} nowMs={nowMs} onOpen={() => {}} />
                <div style={{ fontSize: '12px', color: 'var(--tf-muted)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--tf-bg)' }}>
                  <strong>Specs:</strong> {previewLotObj.produce}
                  {previewLotObj.subCategory ? ` › ${previewLotObj.subCategory}` : ''} · Moisture {moisturePct}% · Defect {defectPct}% · {sizeGrading}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* SECTION: MANAGE LOTS (EDIT / DELETE / EXTEND / LOCK) */}
      {section === 'lots' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span className="tf-label">Admin · Lot Management</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
                Edit, Price & Manage Lots
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/create')}
              className="tf-btn tf-btn-bb"
            >
              + Create Ask Order
            </button>
          </div>

          <div className="tf-admin-workspace">
            <div className="tf-card" style={{ overflowX: 'auto', minWidth: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--tf-border-strong)', backgroundColor: 'var(--tf-bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Lot</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Ask</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Top Bid</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Window</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => {
                    const top = getHighestBidEntry(lot);
                    const selected = selectedLot?.id === lot.id;
                    const closed = isLotBiddingClosed(lot, nowMs);
                    return (
                      <tr
                        key={lot.id}
                        onClick={() => handleSelectLot(lot)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--tf-border)',
                          backgroundColor: selected ? 'var(--tf-sage)' : 'var(--tf-surface)',
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{lot.title || lot.produce}</div>
                          <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                            {lot.lotCode} · {lot.produce}
                            {lot.subCategory ? ` (${lot.subCategory})` : ''} · {lot.grade}
                          </div>
                        </td>
                        <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {formatKg(lot.quantityKg)}
                        </td>
                        <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {formatInr(lot.askPricePerKg)}/kg
                        </td>
                        <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--tf-primary)' }}>
                          {top ? `${formatInr(top.amountPerKg)}/kg` : '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <StatusChip status={lot.status} />
                        </td>
                        <td
                          className="tf-tabular"
                          style={{
                            padding: '14px 16px',
                            textAlign: 'right',
                            color: closed ? 'var(--tf-live-text)' : 'var(--tf-ink)',
                            fontWeight: closed ? 600 : 400,
                          }}
                        >
                          {closed ? 'Bidding Closed' : formatCountdown(lot.endsAt, nowMs)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedLot ? (
              <aside className="tf-card" style={{ padding: '20px', display: 'grid', gap: '16px', alignContent: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '1px solid var(--tf-border)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="tf-label">{selectedLot.lotCode}</span>
                      <StatusChip status={selectedLot.status} />
                    </div>
                    <h2 className="tf-heading-font" style={{ margin: '6px 0 0', fontSize: '20px' }}>
                      {selectedLot.title || selectedLot.produce}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close inspector"
                    onClick={() => {
                      setDrawerDismissed(true);
                      setSelectedLotId(null);
                    }}
                    className="tf-btn tf-btn-ghost"
                    style={{ padding: '0 10px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {drawerError ? (
                  <p role="alert" style={{ margin: 0, fontSize: '13px', color: 'var(--tf-live-text)' }}>
                    {drawerError}
                  </p>
                ) : null}

                {/* Image + Homepage toggle */}
                <div style={{ display: 'grid', gap: '10px' }}>
                  <img
                    src={selectedLot.imageUrl}
                    alt={selectedLot.produce}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label className="tf-btn tf-btn-secondary" style={{ cursor: 'pointer', flex: 1, minHeight: '38px', fontSize: '13px' }}>
                      <Upload size={14} />
                      Replace photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleFileUpload(e, true)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        void toggleLotFeatured(selectedLot.id, !selectedLot.featuredOnHome)
                      }
                      className={`tf-btn ${
                        selectedLot.featuredOnHome ? 'tf-btn-primary' : 'tf-btn-secondary'
                      }`}
                      style={{ flex: 1, minHeight: '38px', fontSize: '13px' }}
                    >
                      <Star size={14} />
                      {selectedLot.featuredOnHome ? 'On Home' : 'Add Home'}
                    </button>
                  </div>
                </div>

                {/* Full Edit Lot Form */}
                <form onSubmit={handleSaveLotEdit} style={{ display: 'grid', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Title</span>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="tf-input"
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Description</span>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="tf-textarea"
                      style={{ minHeight: '72px' }}
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Category</span>
                      <select
                        value={editProduce}
                        onChange={(e) => setEditProduce(e.target.value)}
                        className="tf-select"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        {!categories.some((c) => c.name === editProduce) ? (
                          <option value={editProduce}>{editProduce}</option>
                        ) : null}
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Sub-Category</span>
                      <input
                        type="text"
                        value={editSubCat}
                        onChange={(e) => setEditSubCat(e.target.value)}
                        placeholder="Optional"
                        className="tf-input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Ask (₹/kg)</span>
                      <input
                        type="number"
                        min={1}
                        disabled={selectedLot.status !== 'open'}
                        value={editAskInput}
                        onChange={(e) => setEditAskInput(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Qty (kg)</span>
                      <input
                        type="number"
                        min={10}
                        value={editQtyInput}
                        onChange={(e) => setEditQtyInput(e.target.value)}
                        className="tf-input tf-tabular"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Origin</span>
                      <input
                        type="text"
                        value={editOriginInput}
                        onChange={(e) => setEditOriginInput(e.target.value)}
                        className="tf-input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span className="tf-label">Grade</span>
                      <select
                        value={editGradeInput}
                        onChange={(e) => setEditGradeInput(e.target.value)}
                        className="tf-select"
                      >
                        {grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                        {!grades.includes(editGradeInput) ? (
                          <option value={editGradeInput}>{editGradeInput}</option>
                        ) : null}
                      </select>
                    </label>
                  </div>

                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Tags</span>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="tf-input"
                    />
                  </label>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={isSyncing} className="tf-btn tf-btn-secondary" style={{ flex: 1 }}>
                      <Pencil size={15} />
                      Save changes
                    </button>
                    {selectedLot.status === 'open' ? (
                      <button
                        type="button"
                        onClick={() => void handleExtendWindow(selectedLot)}
                        className="tf-btn tf-btn-secondary"
                        title="Extend bidding window by +1 hour"
                      >
                        +1 Hr
                      </button>
                    ) : null}
                  </div>
                </form>

                {selectedLot.status === 'open' && highestBidEntry ? (
                  <button
                    type="button"
                    onClick={() => void handleLockDeal(selectedLot.id)}
                    disabled={isSyncing}
                    className="tf-btn tf-btn-bb"
                    style={{ width: '100%' }}
                  >
                    <Lock size={15} />
                    Lock deal ({highestBidEntry.vendorLabel} · {formatInr(highestBidEntry.amountPerKg)}/kg)
                  </button>
                ) : null}

                {/* Delete Lot */}
                <div style={{ borderTop: '1px solid var(--tf-border)', paddingTop: '12px' }}>
                  {confirmDeleteId === selectedLot.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => void handleDeleteLot(selectedLot.id)}
                        className="tf-btn tf-btn-danger"
                        style={{ flex: 1 }}
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="tf-btn tf-btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(selectedLot.id)}
                      className="tf-btn tf-btn-danger"
                      style={{ width: '100%' }}
                    >
                      <Trash2 size={15} />
                      Delete lot
                    </button>
                  )}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* SECTION: DEALS */}
      {section === 'deals' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <span className="tf-label">Admin · Locked Deals</span>
            <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
              Locked Deals & Quality Verification
            </h1>
          </div>

          <div className="tf-admin-workspace">
            <div className="tf-card" style={{ overflowX: 'auto', minWidth: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--tf-border-strong)', backgroundColor: 'var(--tf-bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Deal / Produce</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Winning Buyer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Locked Rate</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }} className="tf-label">Contract Value</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }} className="tf-label">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lockedDeals.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--tf-muted)' }}>
                        No deals locked yet. Lock an open lot from Manage Lots.
                      </td>
                    </tr>
                  ) : (
                    lockedDeals.map((deal) => {
                      const rate = deal.winningBidPerKg ?? deal.askPricePerKg;
                      const total = rate * deal.quantityKg;
                      const isSel = selectedLot?.id === deal.id;
                      return (
                        <tr
                          key={deal.id}
                          onClick={() => handleSelectLot(deal)}
                          style={{
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--tf-border)',
                            backgroundColor: isSel ? 'var(--tf-sage)' : 'var(--tf-surface)',
                          }}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{deal.title || deal.produce}</div>
                            <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
                              {deal.lotCode} · {formatKg(deal.quantityKg)}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                            {deal.winningVendorId || 'Vendor #B-14'}
                          </td>
                          <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                            {formatInr(rate)}/kg
                          </td>
                          <td className="tf-tabular" style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--tf-primary)' }}>
                            {formatInr(total)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <StatusChip status={deal.status} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {selectedLot && selectedLot.status !== 'open' ? (
              <form
                onSubmit={handleQualitySubmit}
                className="tf-card"
                style={{ padding: '20px', display: 'grid', gap: '12px', alignContent: 'start' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px' }}>
                    Quality Check · {selectedLot.lotCode}
                  </h2>
                  <StatusChip status={selectedLot.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Grade</span>
                    <select
                      value={qcGrade}
                      onChange={(e) => setQcGrade(e.target.value)}
                      className="tf-select"
                    >
                      {grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Moisture %</span>
                    <input
                      type="number"
                      step="0.1"
                      value={qcMoisture}
                      onChange={(e) => setQcMoisture(e.target.value)}
                      className="tf-input tf-tabular"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '4px' }}>
                    <span className="tf-label">Defect %</span>
                    <input
                      type="number"
                      step="0.1"
                      value={qcDefect}
                      onChange={(e) => setQcDefect(e.target.value)}
                      className="tf-input tf-tabular"
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gap: '6px', padding: '10px 12px', borderRadius: '6px', border: '1px dashed var(--tf-border-strong)', backgroundColor: 'var(--tf-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--tf-muted)' }}>
                    <Camera size={16} />
                    <span>Sample inspection note</span>
                  </div>
                  <input
                    type="text"
                    value={qcPhotoNote}
                    onChange={(e) => setQcPhotoNote(e.target.value)}
                    className="tf-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setQcOutcome('pass')}
                    className={`tf-btn ${
                      qcOutcome === 'pass' ? 'tf-btn-primary' : 'tf-btn-secondary'
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcOutcome('fail')}
                    className={`tf-btn ${
                      qcOutcome === 'fail' ? 'tf-btn-primary' : 'tf-btn-secondary'
                    }`}
                  >
                    Fail
                  </button>
                </div>

                <button type="submit" disabled={isSyncing} className="tf-btn tf-btn-bb">
                  <CheckCircle2 size={16} />
                  Save Quality Report
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* SECTION: SHIPPING */}
      {section === 'shipping' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <span className="tf-label">Admin · Shipping & Logistics</span>
            <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
              Order Shipping & Dispatch Control
            </h1>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {lockedDeals.map((deal) => (
              <div key={deal.id} className="tf-card" style={{ padding: '22px', display: 'grid', gap: '18px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--tf-border)', paddingBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StatusChip status={deal.status} />
                      <span className="tf-label">{deal.lotCode}</span>
                    </div>
                    <h2 className="tf-heading-font" style={{ margin: '6px 0 0', fontSize: '22px' }}>
                      {deal.title || deal.produce} ({formatKg(deal.quantityKg)})
                    </h2>
                    <div style={{ fontSize: '14px', color: 'var(--tf-muted)', marginTop: '2px' }}>
                      Buyer: <strong>{deal.winningVendorId || 'Vendor #B-14'}</strong> · Destination: {deal.deliveryAddress}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    {deal.status === 'locked' ? (
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() =>
                          void handleDelivery(deal.id, 'dispatched', {
                            shippingCarrier: shipCarrierInput,
                            vehicleNumber: shipVehicleInput,
                          })
                        }
                        className="tf-btn tf-btn-bb"
                      >
                        <Truck size={16} />
                        Mark Dispatched
                      </button>
                    ) : null}
                    {deal.status === 'dispatched' ? (
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => void handleDelivery(deal.id, 'delivered')}
                        className="tf-btn tf-btn-primary"
                      >
                        <PackageCheck size={16} />
                        Mark Delivered
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="tf-shipping-grid">
                  <Timeline steps={deal.timeline} />

                  <div style={{ padding: '16px', borderRadius: '6px', backgroundColor: 'var(--tf-bg)', border: '1px solid var(--tf-border)', display: 'grid', gap: '10px', alignContent: 'start' }}>
                    <div className="tf-label">Dispatch Details</div>
                    <div style={{ fontSize: '14px' }}>
                      <strong>Carrier:</strong> {deal.shippingCarrier || 'Trade Fresh Logistics'}
                    </div>
                    <div className="tf-tabular" style={{ fontSize: '14px' }}>
                      <strong>Vehicle:</strong> {deal.vehicleNumber || 'Pending assignment'}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <strong>Origin Hub:</strong> {deal.traderContact.hub}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* SECTION: SITE CONTROLS & TAXONOMY MANAGER + LIVE PREVIEW */}
      {section === 'site' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <span className="tf-label">Admin · Catalog & Homepage CMS</span>
              <h1 className="tf-heading-font" style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 600 }}>
                Categories, Grades & Site Controls
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--tf-muted)' }}>
                Customize categories, toggle subcategories on/off, define custom grades, and preview homepage changes before publishing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSitePreview((p) => !p)}
              className="tf-btn tf-btn-secondary"
            >
              <Eye size={16} />
              {showSitePreview ? 'Hide Homepage Preview' : 'Preview Changes'}
            </button>
          </div>

          <form onSubmit={handleSaveSiteSettings} style={{ display: 'grid', gap: '20px' }}>
            {showSitePreview ? (
              <div
                className="tf-card tf-fade-up"
                style={{
                  overflow: 'hidden',
                  borderColor: 'var(--tf-bb-green)',
                }}
              >
                <div style={{ backgroundColor: '#1F4E2B', color: '#F7FAF5', padding: '7px 14px', fontSize: '12px', textAlign: 'center' }}>
                  LIVE HOMEPAGE PREVIEW · {announcementText || 'Announcement bar'}
                </div>
                <div
                  style={{
                    position: 'relative',
                    padding: '28px',
                    backgroundColor: '#172E1E',
                    color: '#FFFFFF',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#A5E38A', letterSpacing: '0.06em' }}>
                    HERO BANNER PREVIEW
                  </span>
                  <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '28px', color: '#FFFFFF' }}>
                    {heroHeadline}
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#D7E7D4', maxWidth: '580px' }}>
                    {heroSubheadline}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '6px' }}>
                    <span className="tf-btn tf-btn-bb" style={{ minHeight: '36px', fontSize: '13px', cursor: 'default' }}>
                      {heroCtaPrimary}
                    </span>
                    <span style={{ fontSize: '12px', color: '#A5E38A', alignSelf: 'center' }}>
                      {draftCategories.length} categories · {draftGrades.length} grades · Subcategories {enableSubcategoriesGlobal ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="tf-cms-grid">
              {/* Left: Hero Text Settings */}
              <div className="tf-card" style={{ padding: '22px', display: 'grid', gap: '14px', alignContent: 'start' }}>
                <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px' }}>
                  Banner & Copy
                </h2>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span className="tf-label">Hero headline</span>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="tf-input"
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span className="tf-label">Hero subheadline</span>
                  <textarea
                    value={heroSubheadline}
                    onChange={(e) => setHeroSubheadline(e.target.value)}
                    className="tf-textarea"
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span className="tf-label">Primary CTA button text</span>
                  <input
                    type="text"
                    value={heroCtaPrimary}
                    onChange={(e) => setHeroCtaPrimary(e.target.value)}
                    className="tf-input"
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span className="tf-label">Top announcement bar</span>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="tf-input"
                  />
                </label>
              </div>

              {/* Right: Custom Categories, Optional Subcategories & Grades */}
              <div className="tf-card" style={{ padding: '22px', display: 'grid', gap: '16px', alignContent: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <h2 className="tf-heading-font" style={{ margin: 0, fontSize: '20px' }}>
                    Categories & Sub-Categories
                  </h2>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={enableSubcategoriesGlobal}
                      onChange={(e) => setEnableSubcategoriesGlobal(e.target.checked)}
                    />
                    Enable Subcategories
                  </label>
                </div>

                {/* Add Category */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Add category (e.g. Coriander)"
                    className="tf-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCatName.trim();
                      if (trimmed.length < 2) return;
                      if (draftCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
                      setDraftCategories((prev) => [
                        ...prev,
                        {
                          id: `cat-${Date.now()}`,
                          name: trimmed,
                          allowSubcategories: true,
                          subcategories: [],
                          imageUrl: '/images/produce-okra.jpg',
                        },
                      ]);
                      setNewCatName('');
                    }}
                    className="tf-btn tf-btn-secondary"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                {/* Category List */}
                <div style={{ display: 'grid', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                  {draftCategories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--tf-border)',
                        backgroundColor: 'var(--tf-bg)',
                        display: 'grid',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <strong>{cat.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {enableSubcategoriesGlobal ? (
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={cat.allowSubcategories}
                                onChange={(e) =>
                                  setDraftCategories((prev) =>
                                    prev.map((c) =>
                                      c.id === cat.id
                                        ? { ...c, allowSubcategories: e.target.checked }
                                        : c
                                    )
                                  )
                                }
                              />
                              Subcategories
                            </label>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              setDraftCategories((prev) =>
                                prev.filter((c) => c.id !== cat.id)
                              )
                            }
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tf-live-text)' }}
                            aria-label={`Remove ${cat.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {enableSubcategoriesGlobal && cat.allowSubcategories ? (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {cat.subcategories.map((sc) => (
                              <span
                                key={sc}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--tf-surface)',
                                  border: '1px solid var(--tf-border)',
                                  fontSize: '12px',
                                }}
                              >
                                {sc}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraftCategories((prev) =>
                                      prev.map((c) =>
                                        c.id === cat.id
                                          ? {
                                              ...c,
                                              subcategories: c.subcategories.filter(
                                                (x) => x !== sc
                                              ),
                                            }
                                          : c
                                      )
                                    )
                                  }
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--tf-muted)' }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              value={newSubInputs[cat.id] || ''}
                              onChange={(e) =>
                                setNewSubInputs((prev) => ({
                                  ...prev,
                                  [cat.id]: e.target.value,
                                }))
                              }
                              placeholder="Add subcategory..."
                              className="tf-input"
                              style={{ minHeight: '34px', fontSize: '13px' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = (newSubInputs[cat.id] || '').trim();
                                if (!val) return;
                                setDraftCategories((prev) =>
                                  prev.map((c) =>
                                    c.id === cat.id && !c.subcategories.includes(val)
                                      ? { ...c, subcategories: [...c.subcategories, val] }
                                      : c
                                  )
                                );
                                setNewSubInputs((prev) => ({ ...prev, [cat.id]: '' }));
                              }}
                              className="tf-btn tf-btn-secondary"
                              style={{ minHeight: '34px', paddingInline: '10px', fontSize: '12px' }}
                            >
                              + Sub
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Custom Quality Grades Manager */}
                <div style={{ borderTop: '1px solid var(--tf-border)', paddingTop: '14px', display: 'grid', gap: '10px' }}>
                  <span className="tf-label">Custom Quality Grades</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {draftGrades.map((g) => (
                      <span
                        key={g}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--tf-bb-green-soft)',
                          color: 'var(--tf-primary)',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {g}
                        {draftGrades.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftGrades((prev) => prev.filter((x) => x !== g))
                            }
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                          >
                            ×
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newGradeName}
                      onChange={(e) => setNewGradeName(e.target.value)}
                      placeholder="Add custom grade (e.g. Organic Certified)"
                      className="tf-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newGradeName.trim();
                        if (!val || draftGrades.includes(val)) return;
                        setDraftGrades((prev) => [...prev, val]);
                        setNewGradeName('');
                      }}
                      className="tf-btn tf-btn-secondary"
                    >
                      <Plus size={15} /> Grade
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {cmsError ? (
              <p role="alert" style={{ margin: 0, fontSize: '13px', color: 'var(--tf-live-text)' }}>
                {cmsError}
              </p>
            ) : null}

            <div>
              <button type="submit" disabled={isSyncing} className="tf-btn tf-btn-bb">
                Publish Site & Catalog Controls
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <style>{`
        .tf-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .tf-overview-grid,
        .tf-cms-grid,
        .tf-create-with-preview {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
        }
        .tf-create-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .tf-create-lot-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .tf-admin-workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .tf-shipping-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .tf-metrics-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .tf-create-lot-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .tf-shipping-grid {
            grid-template-columns: 1.4fr 1fr;
          }
        }
        @media (min-width: 1024px) {
          .tf-overview-grid {
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.85fr);
          }
          .tf-cms-grid {
            grid-template-columns: 1fr 1.15fr;
          }
          .tf-create-with-preview {
            grid-template-columns: 1.4fr 0.75fr;
            align-items: start;
          }
          .tf-create-with-preview .tf-create-lot-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .tf-create-with-preview .tf-create-split {
            grid-template-columns: 220px 1fr;
          }
          .tf-create-split {
            grid-template-columns: 260px 1fr;
          }
          .tf-create-lot-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .tf-admin-workspace {
            grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
