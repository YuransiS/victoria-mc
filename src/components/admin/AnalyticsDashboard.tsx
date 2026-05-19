'use client';

import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from 'recharts';
import { DollarSign, MousePointer2, Users, CreditCard, TrendingUp, Layers, Globe, Activity } from 'lucide-react';

interface Lead {
  _leadDate: number;
  _computedStatus: string;
  _revenueUAH: number;
  _revenueUSD: number;
  _bookingUAH: number;
  utm_source?: string;
  source?: string;
  Source?: string;
  [key: string]: any;
}

interface Traffic {
  date?: string;
  visitorId?: string;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  leads: Lead[];
  traffic: Traffic[];
  globalActions?: any;
}

export default function AnalyticsDashboard({ leads, traffic, globalActions }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'month' | 'all'>('month');

  // Simple stats calculation
  const stats = useMemo(() => {
    let totalUAH = 0;
    let totalUSD = 0;
    let totalBookings = 0;
    
    leads.forEach((l) => {
      totalUAH += l._revenueUAH || 0;
      totalUSD += l._revenueUSD || 0;
      totalBookings += l._bookingUAH || 0;
    });

    const overallConversion = traffic.length > 0 
      ? ((leads.length / traffic.length) * 100).toFixed(1) 
      : '0.0';

    return {
      totalViews: traffic.length,
      totalLeads: leads.length,
      totalUAH,
      totalUSD,
      totalBookings,
      overallConversion
    };
  }, [leads, traffic]);

  // Conversion Funnel data
  const funnelData = useMemo(() => {
    const visits = traffic.length;
    const registrations = leads.length;
    
    let paidTripwire = 0;
    let booked = 0;
    let paidFull = 0;

    leads.forEach((l) => {
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
        // Ensure at least 5% width is visible in the Recharts bar so small conversions are clickable/visible
        displayValue: Math.max(step.value, maxVal * 0.05)
      };
    });
  }, [leads, traffic]);

  // UTM Source Analysis with strictly separated UAH & USD columns directly from DSU merged totals
  const utmData = useMemo(() => {
    const sources: Record<string, { leads: number; paid: number; revenueUAH: number; revenueUSD: number }> = {};
    
    leads.forEach((l) => {
      let source = l.utm_source || l.source || l["Source"] || l["Джерело"] || 'Direct / Unknown';
      source = source.toString().trim();
      if (source === '' || source === 'none' || source === 'null' || source === 'undefined') {
        source = 'Direct / Unknown';
      }

      if (!sources[source]) {
        sources[source] = { leads: 0, paid: 0, revenueUAH: 0, revenueUSD: 0 };
      }
      
      sources[source].leads++;
      
      const status = (l._computedStatus || '').toString().toLowerCase();
      const isPaid = status.includes('оплачено') || status.includes('трипвай') || status.includes('тріпва') || status.includes('заброньовано');
      
      if (isPaid) {
        sources[source].paid++;
      }
      
      // Sum UAH revenue (full + bookings) and USD revenue directly from normalized fields
      sources[source].revenueUAH += (l._revenueUAH || 0) + (l._bookingUAH || 0);
      sources[source].revenueUSD += l._revenueUSD || 0;
    });

    return Object.entries(sources)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 5);
  }, [leads]);

  // Daily Registration Trend with Date Padding & Period Selection
  const trendData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Current Month start
    
    if (period === 'all') {
      let minTimestamp = today.getTime();
      leads.forEach((l) => {
        let t = l._leadDate;
        if (!t) {
          const dateStr = l.date || l["Дата та час"] || l.created_at;
          if (dateStr) {
            const nativeParsed = Date.parse(dateStr.toString().replace(/-/g, '/'));
            if (!isNaN(nativeParsed)) {
              t = nativeParsed;
            }
          }
        }
        if (t && t > 0 && t < minTimestamp) {
          minTimestamp = t;
        }
      });
      startDate = new Date(minTimestamp);
    }
    
    // Normalize start/end dates to midnight
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Generate full list of consecutive days
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
    
    // Sum registrations per day
    leads.forEach((l) => {
      let t = l._leadDate;
      if (!t) {
        const dateStr = l.date || l["Дата та час"] || l.created_at;
        if (dateStr) {
          const nativeParsed = Date.parse(dateStr.toString().replace(/-/g, '/'));
          if (!isNaN(nativeParsed)) {
            t = nativeParsed;
          }
        }
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
  }, [leads, period]);

  // Premium custom tooltip components
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
    <div className="space-y-8 pb-8 animate-fade-in">
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
        {/* Funnel Chart */}
        <div className="bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">Воронка Конверсії</h3>
              <p className="text-[10px] text-white/30 uppercase font-semibold">Шлях відвідувача до клієнта</p>
            </div>
            <Layers size={16} className="text-white/20" />
          </div>
          <div className="h-[300px]">
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

        {/* Source Analysis */}
        <div className="bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">ТОП-5 Джерел (UTM)</h3>
              <p className="text-[10px] text-white/30 uppercase font-semibold">Розподіл трафіку та прибутковості</p>
            </div>
            <Globe size={16} className="text-white/20" />
          </div>
          <div className="overflow-x-auto premium-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase font-black text-white/20 tracking-wider border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="pb-4 pt-2 px-3">Джерело</th>
                  <th className="pb-4 pt-2 px-3 text-right">Ліди</th>
                  <th className="pb-4 pt-2 px-3 text-right">Клієнти</th>
                  <th className="pb-4 pt-2 px-3 text-right">Дохід UAH</th>
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
                    <td className="py-4 px-3 text-xs text-[#C4A47C] font-bold text-right">{row.paid}</td>
                    <td className="py-4 px-3 text-xs text-white/80 font-semibold text-right">{row.revenueUAH.toLocaleString()} ₴</td>
                    <td className="py-4 px-3 text-xs text-emerald-400 font-extrabold text-right">${row.revenueUSD.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart with Premium Date Toggles */}
        <div className="lg:col-span-2 bg-[#111115] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-white/[0.08] transition-all duration-500">
          <div className="absolute top-0 right-0 h-48 w-48 bg-[#C4A47C]/[0.01] rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <h3 className="text-xs uppercase font-extrabold text-[#C4A47C] tracking-[0.2em] mb-1">Динаміка реєстрацій</h3>
              <p className="text-[10px] text-white/30 uppercase font-semibold">Денний темп приросту лідів</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/[0.05] p-1 rounded-xl">
              <button 
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${period === 'month' ? 'bg-[#C4A47C] text-black shadow-lg shadow-[#C4A47C]/15 scale-[1.02]' : 'text-white/40 hover:text-white/80'}`}
              >
                Поточний місяць
              </button>
              <button 
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${period === 'all' ? 'bg-[#C4A47C] text-black shadow-lg shadow-[#C4A47C]/15 scale-[1.02]' : 'text-white/40 hover:text-white/80'}`}
              >
                За весь час
              </button>
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
