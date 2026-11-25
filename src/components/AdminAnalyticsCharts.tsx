import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, BarChart3, ShieldAlert } from 'lucide-react';
import type { Lot } from '../types/trade';
import { getHighestBidAmount, isLotTimedOut } from '../utils/format';

interface AdminAnalyticsChartsProps {
  lots: Lot[];
  grades: string[];
  nowMs: number;
}

const PIE_COLORS = ['#5E9E31', '#1F4E2B', '#D97706', '#3B82F6', '#D33F24'];

export function AdminAnalyticsCharts({
  lots,
  grades,
  nowMs,
}: AdminAnalyticsChartsProps) {
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [defectThreshold, setDefectThreshold] = useState<number>(2.5);

  const filteredLots = useMemo(() => {
    if (gradeFilter === 'All') return lots;
    return lots.filter((l) => l.grade === gradeFilter);
  }, [gradeFilter, lots]);

  const priceSpreadData = useMemo(() => {
    return filteredLots.slice(0, 8).map((lot) => {
      const high = getHighestBidAmount(lot);
      return {
        name: lot.lotCode,
        produce: lot.produce,
        ask: lot.askPricePerKg,
        highBid: high || lot.askPricePerKg,
      };
    });
  }, [filteredLots]);

  const qualityData = useMemo(() => {
    return filteredLots.slice(0, 8).map((lot) => ({
      name: lot.lotCode,
      moisture: Number(lot.qualityReport?.moisturePct ?? 90),
      defect: Number(lot.qualityReport?.defectPct ?? 1.5),
      aboveLimit: Number(lot.qualityReport?.defectPct ?? 1.5) > defectThreshold,
    }));
  }, [defectThreshold, filteredLots]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Open: 0,
      'Timed Out': 0,
      'QC / Locked': 0,
      Dispatched: 0,
      Delivered: 0,
    };
    for (const l of lots) {
      if (l.status === 'open') {
        if (isLotTimedOut(l, nowMs)) counts['Timed Out'] += 1;
        else counts.Open += 1;
      } else if (l.status === 'qc_pending' || l.status === 'locked') {
        counts['QC / Locked'] += 1;
      } else if (l.status === 'dispatched') {
        counts.Dispatched += 1;
      } else if (l.status === 'delivered') {
        counts.Delivered += 1;
      }
    }
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [lots, nowMs]);

  const flaggedCount = qualityData.filter((q) => q.aboveLimit).length;

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      {/* Dynamic Quality Control Toolbar */}
      <div
        className="tf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={18} color="#5E9E31" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>
              Live Desk Analytics & Quality Measures
            </div>
            <div style={{ fontSize: '12px', color: 'var(--tf-muted)' }}>
              Computed dynamically from {filteredLots.length} lots · {flaggedCount} above {defectThreshold}% defect threshold
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span className="tf-label">Grade</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="tf-select"
              style={{ minHeight: '36px', width: 'auto' }}
            >
              <option value="All">All Grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <ShieldAlert size={14} color="#D97706" />
            <span className="tf-label">Defect Alert: {defectThreshold.toFixed(1)}%</span>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.5}
              value={defectThreshold}
              onChange={(e) => setDefectThreshold(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* 3 Dynamic Charts Grid */}
      <div className="tf-charts-grid">
        {/* Ask vs Top Bid Spread */}
        <div className="tf-card" style={{ padding: '18px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="tf-label">Price Discovery (₹/kg)</span>
              <h3 className="tf-heading-font" style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 600 }}>
                Ask vs. Highest Bid
              </h3>
            </div>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceSpreadData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--tf-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--tf-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--tf-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tf-surface)',
                    border: '1px solid var(--tf-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ask" name="Ask (₹/kg)" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highBid" name="Top Bid (₹/kg)" fill="#5E9E31" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Moisture & Defect Telemetry */}
        <div className="tf-card" style={{ padding: '18px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="tf-label">Quality Lab Telemetry</span>
              <h3 className="tf-heading-font" style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 600 }}>
                Defect % vs. Threshold
              </h3>
            </div>
            <Activity size={16} color="#5E9E31" />
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={qualityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--tf-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--tf-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--tf-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tf-surface)',
                    border: '1px solid var(--tf-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={defectThreshold}
                  stroke="#D33F24"
                  strokeDasharray="4 4"
                  label={{ value: 'Max Limit', position: 'insideTopRight', fontSize: 11, fill: '#D33F24' }}
                />
                <Area
                  type="monotone"
                  dataKey="defect"
                  name="Defect %"
                  stroke="#1F4E2B"
                  fill="#82CC6C"
                  fillOpacity={0.35}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fulfillment Pipeline Pie */}
        <div className="tf-card" style={{ padding: '18px', display: 'grid', gap: '12px' }}>
          <div>
            <span className="tf-label">Fulfillment Mix</span>
            <h3 className="tf-heading-font" style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 600 }}>
              Lots by Stage
            </h3>
          </div>
          <div style={{ width: '100%', height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tf-surface)',
                    border: '1px solid var(--tf-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
            {statusBreakdown.map((item, idx) => (
              <span
                key={item.name}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--tf-muted)' }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                  }}
                />
                {item.name}: <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tf-charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 960px) {
          .tf-charts-grid {
            grid-template-columns: 1.2fr 1.2fr 0.9fr;
          }
        }
      `}</style>
    </section>
  );
}
