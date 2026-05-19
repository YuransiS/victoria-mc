'use client';

import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from 'recharts';
import { DollarSign, MousePointer2, Users, CreditCard, TrendingUp, Layers, Globe, Calendar, Filter } from 'lucide-react';

interface Lead {
  _leadDate: number;
  _computedStatus: string;
  _revenueUAH: number;
  _revenueUSD: number;
  _bookingUAH: number;
  _allSheets?: string[];
  _sheet?: string;
  utm_source?: string;
  source?: string;
  Source?: string;
  [key: string]: any;
}

interface Traffic {
  date?: string;
  visitorId?: string;
  "Дата та час"?: string;
  "Дата"?: string;
  created_at?: string;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  leads: Lead[];
  traffic: Traffic[];
  globalActions?: any;
}

const parseDate = (dString: any): number | null => {
  if (!dString) return null;
  if (typeof dString === 'number') return dString;
  
  const str = dString.toString().trim();
  if (!str) return null;

  // Check if it's already a timestamp
  if (/^\d+$/.test(str)) {
    return parseInt(str);
  }
  
  // Try native Date.parse first
  const nativeParsed = Date.parse(str);
  if (!isNaN(nativeParsed)) {
    return nativeParsed;
  }
  
  // Normalize: replace comma with space, replace multiple spaces with single space
  const cleanStr = str.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Parse DD.MM.YYYY HH:MM:SS or DD.MM.YYYY HH:MM or DD.MM.YYYY
  const dmyRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  const match = cleanStr.match(dmyRegex);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // JS months are 0-11
    const year = parseInt(match[3]);
    const hour = match[4] ? parseInt(match[4]) : 0;
    const minute = match[5] ? parseInt(match[5]) : 0;
    const second = match[6] ? parseInt(match[6]) : 0;
    return new Date(year, month, day, hour, minute, second).getTime();
  }
  
  // Fallback for YYYY-MM-DD HH:MM:SS
  const normalizedStr = str.includes('T') ? str : str.replace(/-/g, '/');
  const fallbackParsed = Date.parse(normalizedStr);
  return isNaN(fallbackParsed) ? null : fallbackParsed;
};

export default function AnalyticsDashboard({ leads: rawLeads, traffic: rawTraffic, globalActions }: AnalyticsDashboardProps) {
  // Filter for real paid traffic (only count those with "traff" in utm_source)
  const leads = useMemo(() => {
    return rawLeads.filter((l) => {
      const utmSource = (l.utm_source || l.source || l["Source"] || l["Джерело"] || '').toString().toLowerCase();
      return utmSource.includes('traff');
    });
  }, [rawLeads]);

  const traffic = useMemo(() => {
    return rawTraffic.filter((tr) => {
      const utmSource = (tr.utm_source || tr.source || tr["UTM Source"] || '').toString().toLowerCase();
      return utmSource.includes('traff');
    });
  }, [rawTraffic]);

  // 1. Funnel component local filters (Autonomous)
  const [funnelPeriod, setFunnelPeriod] = useState<'month' | 'prev_month' | 'all' | 'custom'>('month');
  const [funnelCustomStart, setFunnelCustomStart] = useState<string>('');
  const [funnelCustomEnd, setFunnelCustomEnd] = useState<string>('');
  const [funnelSheet, setFunnelSheet] = useState<string>('all');

  // 2. UTM Source local filters (Autonomous)
  const [utmPeriod, setUtmPeriod] = useState<'month' | 'all'>('month');
  const [utmSheet, setUtmSheet] = useState<string>('all');

  // 3. Trends local filters (Autonomous)
  const [trendPeriod, setTrendPeriod] = useState<'month' | 'all'>('month');
  const [trendSheet, setTrendSheet] = useState<string>('all');

  // Dynamically extract sheet list from leads for dropdowns
  const sheetNames = useMemo(() => {
    const names = new Set<string>();
    leads.forEach((l) => {
      if (l._allSheets && Array.isArray(l._allSheets)) {
        l._allSheets.forEach((s) => {
          if (s) names.add(s.toString().trim());
        });
      } else if (l._sheet) {
        names.add(l._sheet.toString().trim());
      }
    });
    return Array.from(names).sort();
  }, [leads]);

  // FUNNEL FILTERED LEADS
  const funnelFilteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Sheet/tab filter
      if (funnelSheet !== 'all') {
        const sheets = l._allSheets || [];
        const matchesSheet = sheets.includes(funnelSheet) || l._sheet === funnelSheet;
        if (!matchesSheet) return false;
      }

      // Date range filter
      let t = l._leadDate;
      if (!t) {
        const dateStr = l.date || l["Дата та час"] || l["Дата"] || l.created_at;
        const parsed = parseDate(dateStr);
        if (parsed) t = parsed;
      }
      if (!t) return false;

      if (funnelPeriod === 'month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= start;
      } else if (funnelPeriod === 'prev_month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
        return t >= start && t <= end;
      } else if (funnelPeriod === 'custom') {
        const start = funnelCustomStart ? new Date(funnelCustomStart + 'T00:00:00').getTime() : 0;
        const end = funnelCustomEnd ? new Date(funnelCustomEnd + 'T23:59:59').getTime() : Infinity;
        return t >= start && t <= end;
      }
      return true; // 'all'
    });
  }, [leads, funnelPeriod, funnelCustomStart, funnelCustomEnd, funnelSheet]);

  // FUNNEL FILTERED TRAFFIC
  const funnelFilteredTraffic = useMemo(() => {
    return traffic.filter((tr) => {
      // Traffic is sheet-agnostic (to prevent visit count from going to 0 on sheet filter),
      // but it must obey the date/period filter with complete robust date mapping.
      let t = tr._leadDate;
      if (!t) {
        const dateStr = tr.date || tr["Дата та час"] || tr["Дата"] || tr.created_at;
        const parsed = parseDate(dateStr);
        if (parsed) t = parsed;
      }
      if (!t) return false;

      if (funnelPeriod === 'month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= start;
      } else if (funnelPeriod === 'prev_month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
        return t >= start && t <= end;
      } else if (funnelPeriod === 'custom') {
        const start = funnelCustomStart ? new Date(funnelCustomStart + 'T00:00:00').getTime() : 0;
        const end = funnelCustomEnd ? new Date(funnelCustomEnd + 'T23:59:59').getTime() : Infinity;
        return t >= start && t <= end;
      }
      return true; // 'all'
    });
  }, [traffic, funnelPeriod, funnelCustomStart, funnelCustomEnd]);

  // TOP STATS - Synchronized with currently filtered Funnel data
  const stats = useMemo(() => {
    let totalUAH = 0;
    let totalUSD = 0;
    let totalBookings = 0;
    
    funnelFilteredLeads.forEach((l) => {
      totalUAH += l._revenueUAH || 0;
      totalUSD += l._revenueUSD || 0;
      totalBookings += l._bookingUAH || 0;
    });

    const overallConversion = funnelFilteredTraffic.length > 0 
      ? ((funnelFilteredLeads.length / funnelFilteredTraffic.length) * 100).toFixed(1) 
      : '0.0';

    return {
      totalViews: funnelFilteredTraffic.length,
      totalLeads: funnelFilteredLeads.length,
      totalUAH,
      totalUSD,
      totalBookings,
      overallConversion
    };
  }, [funnelFilteredLeads, funnelFilteredTraffic]);

  // Conversion Funnel Data
  const funnelData = useMemo(() => {
    const visits = funnelFilteredTraffic.length;
    const registrations = funnelFilteredLeads.length;
    
    let paidTripwire = 0;
    let booked = 0;
    let paidFull = 0;

    funnelFilteredLeads.forEach((l) => {
      const status = (l._computedStatus || '').toString().toLowerCase();
      const isTripwire = status.includes('трипвай') || status.includes('тріпва') || status === 'купив тріпваєр';
      const isBooking = (l._bookingUAH > 0) || status.includes('бронь') || status.includes('заброньовано');
      const isFullPaid = status === 'оплачено' && !isBooking;

      if (isTripwire) paidTripwire++;
      if (isBooking) booked++;
      if (isFullPaid) paidFull++;
    });

    const rawSteps = [
      { name: 'Відвідувачі (Traffic)', value: visits, color: '#1A1A1E' },
      { name: 'Ліди (Реєстрації)', value: registrations, color: '#2A2A30' },
      { name: 'Тріпваєр ($9/$39)', value: paidTripwire, color: '#4A3D2C' },
      { name: 'Бронь (1000₴)', value: booked, color: '#A08058' },
      { name: 'Повна Оплата', value: paidFull, color: '#C4A47C' },
    ];

    const maxVal = visits || 1;

    return rawSteps.map((step) => {
      const percent = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
      return {
        ...step,
        percent: percent.toFixed(1),
        // Minimum visual bar width offset
        displayValue: Math.max(step.value, maxVal * 0.05)
      };
    });
  }, [funnelFilteredLeads, funnelFilteredTraffic]);

  // UTM SOURCE LEADS (Filtered Locally by utmPeriod and utmSheet)
  const utmFilteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Sheet/tab filter
      if (utmSheet !== 'all') {
        const sheets = l._allSheets || [];
        const matchesSheet = sheets.includes(utmSheet) || l._sheet === utmSheet;
        if (!matchesSheet) return false;
      }

      // Period filter
      let t = l._leadDate;
      if (!t) {
        const dateStr = l.date || l["Дата та час"] || l["Дата"] || l.created_at;
        const parsed = parseDate(dateStr);
        if (parsed) t = parsed;
      }
      if (!t) return false;

      if (utmPeriod === 'month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= start;
      }
      return true; // 'all'
    });
  }, [leads, utmPeriod, utmSheet]);

  // UTM Source Analysis Grouping & Cascade Sort
  const utmData = useMemo(() => {
    const sources: Record<string, { leads: number; tripwires: number; revenueUSD: number }> = {};
    
    utmFilteredLeads.forEach((l) => {
      // Group by utm_medium or campaign to display the actual advertising campaign/set instead of broad 'traff'
      let source = l.utm_medium || l.utm_campaign || 'Direct / Unknown';
      source = source.toString().trim();
      if (source === '' || source === 'none' || source === 'null' || source === 'undefined') {
        source = 'Direct / Unknown';
      }

      if (!sources[source]) {
        sources[source] = { leads: 0, tripwires: 0, revenueUSD: 0 };
      }
      
      sources[source].leads++;
      
      const status = (l._computedStatus || '').toString().toLowerCase();
      const isTripwire = status.includes('трипвай') || status.includes('тріпва') || status === 'купив тріпваєр';
      
      if (isTripwire) {
        sources[source].tripwires++;
      }
      
      sources[source].revenueUSD += l._revenueUSD || 0;
    });

    return Object.entries(sources)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        if (b.tripwires !== a.tripwires) return b.tripwires - a.tripwires;
        if (b.revenueUSD !== a.revenueUSD) return b.revenueUSD - a.revenueUSD;
        return b.leads - a.leads;
      })
      .slice(0, 5);
  }, [utmFilteredLeads]);

  // TREND FILTERS (Filtered Locally by trendPeriod and trendSheet)
  const trendFilteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Sheet/tab filter
      if (trendSheet !== 'all') {
        const sheets = l._allSheets || [];
        const matchesSheet = sheets.includes(trendSheet) || l._sheet === trendSheet;
        if (!matchesSheet) return false;
      }

      // Period filter
      let t = l._leadDate;
      if (!t) {
        const dateStr = l.date || l["Дата та час"] || l["Дата"] || l.created_at;
        const parsed = parseDate(dateStr);
        if (parsed) t = parsed;
      }
      if (!t) return false;

      if (trendPeriod === 'month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= start;
      }
      return true; // 'all'
    });
  }, [leads, trendPeriod, trendSheet]);

  // Trend Data Generation
  const trendData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Month start
    
    if (trendPeriod === 'all') {
      let minTimestamp = today.getTime();
      trendFilteredLeads.forEach((l) => {
        let t = l._leadDate;
        if (!t) {
          const dateStr = l.date || l["Дата та час"] || l["Дата"] || l.created_at;
          const parsed = parseDate(dateStr);
          if (parsed) t = parsed;
        }
        if (t && t > 0 && t < minTimestamp) {
          minTimestamp = t;
        }
      });
      startDate = new Date(minTimestamp);
    }
    
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const dateMap: Record<string, number> = {};
    const current = new Date(start.getTime());
    const limitDate = new Date(end.getTime());
    
    let safetyCount = 0;
    while (current <= limitDate && safetyCount < 1500) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      dateMap[key] = 0;
      current.setDate(current.getDate() + 1);
      safetyCount++;
    }
    
    trendFilteredLeads.forEach((l) => {
      let t = l._leadDate;
      if (!t) {
        const dateStr = l.date || l["Дата та час"] || l["Дата"] || l.created_at;
        const parsed = parseDate(dateStr);
        if (parsed) t = parsed;
      }
      if (t && t > 0) {
        const d = new Date(t);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (key in dateMap) {
          dateMap[key]++;
        }
      }
    });
    
    return Object.entries(dateMap).map(([key, count]) => {
      const [, month, day] = key.split('-');
      return {
        name: `${day}.${month}`,
        count
      };
    });
  }, [trendFilteredLeads, trendPeriod]);

  // Premium custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D0D11]/95 backdrop-blur-md border border-white/[0.08] p-3 rounded-xl shadow-2xl animate-scale-in">
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#C4A47C]" />
            <p className="text-xs font-bold text-[#C4A47C]">
              Реєстрацій: <span className="text-white font-extrabold">{payload[0].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const FunnelTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0D0D11]/95 backdrop-blur-md border border-white/[0.08] p-4 rounded-xl shadow-2xl animate-scale-in">
          <p className="text-xs font-black text-white uppercase tracking-wider mb-2 border-b border-white/5 pb-1.5">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p className="text-white/50">Кількість: <span className="text-white font-bold">{data.value}</span></p>
            <p className="text-white/50">Конверсія від трафіку: <span className="text-[#C4A47C] font-bold">{data.percent}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-24 md:pb-32 animate-fade-in">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <Stat 
          icon={<MousePointer2 className="text-[#C4A47C]" size={20} />} 
          label="Трафік (Візити)" 
          value={stats.totalViews.toLocaleString()} 
          glowColor="rgba(196,164,124,0.05)"
        />
        <Stat 
          icon={<Users className="text-[#C4A47C]" size={20} />} 
          label="Всього лідів" 
          value={stats.totalLeads.toLocaleString()} 
          glowColor="rgba(196,164,124,0.05)"
        />
        <Stat 
          icon={<TrendingUp className="text-emerald-400" size={20} />} 
          label="Конверсія" 
          value={`${stats.overallConversion}%`} 
          glowColor="rgba(52,211,153,0.05)"
        />
        <Stat 
          icon={<CreditCard className="text-[#3B82F6]" size={20} />} 
          label="Бронювання (UAH)" 
          value={`${stats.totalBookings.toLocaleString()} ₴`} 
          glowColor="rgba(59,130,246,0.05)"
        />
        <Stat 
          icon={<DollarSign className="text-emerald-400" size={20} />} 
          label="Дохід (USD)" 
          value={`$${stats.totalUSD.toLocaleString()}`} 
          glowColor="rgba(16,185,129,0.05)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart with Integrated Autonomous Filters */}
        <div id="admin-conversion-funnel" className="bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-5 border-b border-white/[0.04] pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">Воронка Конверсії</h3>
                <p className="text-[10px] text-white/30 uppercase font-semibold">Шлях відвідувача до клієнта</p>
              </div>
              <Layers size={16} className="text-white/20" />
            </div>

            {/* Micro-filter Panel for Funnel */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Period Dropdown Selector */}
              <div className="flex flex-col gap-1 shrink-0 min-w-[150px]">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Calendar size={8} /> Період
                </label>
                <div className="relative">
                  <select 
                    value={funnelPeriod} 
                    onChange={(e) => setFunnelPeriod(e.target.value as any)}
                    className="w-full appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2 text-[10px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="month" className="bg-[#111115]">Поточний місяць</option>
                    <option value="prev_month" className="bg-[#111115]">Минулий місяць</option>
                    <option value="all" className="bg-[#111115]">За весь час</option>
                    <option value="custom" className="bg-[#111115]">Кастомний діапазон</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1.5 w-1.5 rotate-[135deg]" />
                </div>
              </div>

              {/* Dynamic Google Sheet Dropdown Selector */}
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[180px]">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Filter size={8} /> Джерело даних (Лист)
                </label>
                <div className="relative">
                  <select 
                    value={funnelSheet} 
                    onChange={(e) => setFunnelSheet(e.target.value)}
                    className="w-full appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2 text-[10px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-8 cursor-pointer"
                  >
                    <option value="all" className="bg-[#111115]">Всі листи</option>
                    {sheetNames.map((name) => (
                      <option key={name} value={name} className="bg-[#111115]">{name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1.5 w-1.5 rotate-[135deg]" />
                </div>
              </div>
            </div>

            {/* Sliding custom date range inputs when 'custom' is selected */}
            {funnelPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-black/30 rounded-2xl border border-white/[0.05] animate-scale-in">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-white/40">Початок періоду</label>
                  <input 
                    type="date" 
                    value={funnelCustomStart} 
                    onChange={(e) => setFunnelCustomStart(e.target.value)} 
                    className="bg-[#18181C] border border-white/[0.08] rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-[#C4A47C]/30 transition-colors w-full [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-white/40">Кінець періоду</label>
                  <input 
                    type="date" 
                    value={funnelCustomEnd} 
                    onChange={(e) => setFunnelCustomEnd(e.target.value)} 
                    className="bg-[#18181C] border border-white/[0.08] rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-[#C4A47C]/30 transition-colors w-full [color-scheme:dark]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 50, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                <XAxis type="number" stroke="#ffffff20" hide />
                <YAxis dataKey="name" type="category" stroke="#ffffff30" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} width={120} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<FunnelTooltip />} />
                <Bar dataKey="displayValue" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-500 hover:opacity-80" />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    fill="rgba(255, 255, 255, 0.6)" 
                    fontSize={10} 
                    fontWeight="bold"
                    formatter={((val: any, index: any) => {
                      if (typeof index === 'number') {
                        const entry = funnelData[index];
                        return `${val} (${entry?.percent}%)`;
                      }
                      return val;
                    }) as any} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 UTM Sources with Autonomous Filters */}
        <div id="admin-utm-sources" className="bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-4 border-b border-white/[0.04] pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">ТОП-5 Джерел (UTM)</h3>
                <p className="text-[10px] text-white/30 uppercase font-semibold">Розподіл трафіку та прибутковості</p>
              </div>
              <Globe size={16} className="text-white/20" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* UTM Period Selector */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Calendar size={8} /> Період
                </label>
                <div className="relative">
                  <select 
                    value={utmPeriod} 
                    onChange={(e) => setUtmPeriod(e.target.value as any)}
                    className="appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 text-[9px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-7 cursor-pointer"
                  >
                    <option value="month" className="bg-[#111115]">Поточний місяць</option>
                    <option value="all" className="bg-[#111115]">За весь час</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1 w-1 rotate-[135deg]" />
                </div>
              </div>

              {/* UTM Sheet Selector */}
              <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Filter size={8} /> Джерело даних (Лист)
                </label>
                <div className="relative">
                  <select 
                    value={utmSheet} 
                    onChange={(e) => setUtmSheet(e.target.value)}
                    className="w-full appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 text-[9px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-7 cursor-pointer"
                  >
                    <option value="all" className="bg-[#111115]">Всі листи</option>
                    {sheetNames.map((name) => (
                      <option key={name} value={name} className="bg-[#111115]">{name}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1 w-1 rotate-[135deg]" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto premium-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase font-black text-white/20 tracking-wider border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="pb-4 pt-2 px-3">Джерело</th>
                  <th className="pb-4 pt-2 px-3 text-right">Ліди</th>
                  <th className="pb-4 pt-2 px-3 text-right">Трипваєри (кол-во)</th>
                  <th className="pb-4 pt-2 px-3 text-right">Дохід USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {utmData.map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.02] transition-colors group/row">
                    <td className="py-4 px-3 text-xs font-bold text-white/80 max-w-[140px] truncate" title={row.name}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#C4A47C] opacity-40 group-hover/row:opacity-100 transition-opacity" />
                        {row.name}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-xs text-white/50 text-right font-medium">{row.leads}</td>
                    <td className="py-4 px-3 text-xs text-[#C4A47C] font-bold text-right">{row.tripwires}</td>
                    <td className="py-4 px-3 text-xs text-emerald-400 font-extrabold text-right">${row.revenueUSD.toLocaleString()}</td>
                  </tr>
                ))}
                {utmData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[10px] uppercase font-bold text-white/20 tracking-widest">
                      Немає даних за обраний період
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart with Autonomous Filters */}
        <div id="admin-registrations-chart" className="lg:col-span-2 bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-48 w-48 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-4 border-b border-white/[0.04] pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">Динаміка реєстрацій</h3>
                <p className="text-[10px] text-white/30 uppercase font-semibold">Денний темп приросту лідів за обраний період</p>
              </div>
              <TrendingUp size={16} className="text-white/20" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Trend Period Selector */}
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Calendar size={8} /> Період
                </label>
                <div className="relative">
                  <select 
                    value={trendPeriod} 
                    onChange={(e) => setTrendPeriod(e.target.value as any)}
                    className="appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 text-[9px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-7 cursor-pointer"
                  >
                    <option value="month" className="bg-[#111115]">Поточний місяць</option>
                    <option value="all" className="bg-[#111115]">За весь час</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1 w-1 rotate-[135deg]" />
                </div>
              </div>

              {/* Trend Sheet Selector */}
              <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1">
                  <Filter size={8} /> Джерело даних (Лист)
                </label>
                <div className="relative">
                  <select 
                    value={trendSheet} 
                    onChange={(e) => setTrendSheet(e.target.value)}
                    className="w-full appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 text-[9px] font-bold text-white/80 focus:outline-none focus:border-[#C4A47C]/40 transition-colors pr-7 cursor-pointer"
                  >
                    <option value="all" className="bg-[#111115]">Всі листи</option>
                    {sheetNames.map((name) => (
                      <option key={name} value={name} className="bg-[#111115]">{name}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-t border-white/20 h-1 w-1 rotate-[135deg]" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A47C" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#C4A47C" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} 
                  allowDecimals={false} 
                  dx={-5}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Реєстрації" 
                  stroke="#C4A47C" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  glowColor: string;
}

function Stat({ icon, label, value, glowColor }: StatProps) {
  return (
    <div 
      className="bg-[#111115] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#C4A47C]/30 shadow-xl group"
      style={{ boxShadow: `0 10px 30px -10px ${glowColor}` }}
    >
      <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-[#C4A47C]/20 shrink-0">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 truncate">{label}</p>
        <p className="text-xl font-bold tracking-tight text-white/95 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
