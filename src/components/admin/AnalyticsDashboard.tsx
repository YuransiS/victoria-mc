'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, MousePointer2, Users, CreditCard } from 'lucide-react';

export default function AnalyticsDashboard({ leads, traffic, globalActions }: any) {
  
  // Simple stats
  const stats = useMemo(() => {
    let totalUAH = 0;
    let totalUSD = 0;
    
    leads.forEach((l: any) => {
        totalUAH += l._revenueUAH || 0;
        totalUSD += l._revenueUSD || 0;
    });

    return {
       totalViews: traffic.length,
       totalLeads: leads.length,
       totalUAH,
       totalUSD
    };
  }, [leads, traffic]);

  // Funnel data
  const funnelData = useMemo(() => {
    const visits = traffic.length;
    const registrations = leads.length;
    
    let paidTripwire = 0;
    let booked = 0;
    let paidFull = 0;

    leads.forEach((l: any) => {
       if (l._computedStatus === 'Купив тріпваєр') paidTripwire++;
       if (l._computedStatus === 'Заброньовано') booked++;
       if (l._computedStatus === 'Оплачено') paidFull++;
    });

    return [
      { name: 'Відвідувачі (Traffic)', value: visits, color: '#222' },
      { name: 'Ліди (Реєстрації)', value: registrations, color: '#333' },
      { name: 'Тріпваєр ($9/$39)', value: paidTripwire, color: '#444' },
      { name: 'Бронь (1000₴)', value: booked, color: '#C4A47C' },
      { name: 'Повна Оплата', value: paidFull, color: '#D4B48C' },
    ];
  }, [leads, traffic]);

  // UTM Source Analysis
  const utmData = useMemo(() => {
     const sources: Record<string, { leads: number, paid: number, revenueUAH: number, revenueUSD: number }> = {};
     
     leads.forEach((l: any) => {
         // try to get source from original data or utm_source
         let source = l.utm_source || l.source || l["Source"] || 'Direct / Unknown';
         if (source.toString().trim() === '') source = 'Direct / Unknown';

         if (!sources[source]) sources[source] = { leads: 0, paid: 0, revenueUAH: 0, revenueUSD: 0 };
         
         sources[source].leads++;
         if (l._computedStatus === 'Оплачено' || l._computedStatus === 'Заброньовано' || l._computedStatus === 'Купив тріпваєр') {
             sources[source].paid++;
         }
         sources[source].revenueUAH += l._revenueUAH || 0;
         sources[source].revenueUSD += l._revenueUSD || 0;
     });

     return Object.entries(sources).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.leads - a.leads).slice(0, 5);
  }, [leads]);

  // Daily Registration Trend
  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    leads.forEach((l: any) => {
       const dateStr = l.date || l["Дата та час"];
       if (dateStr) {
           // Basic parsing for dd.mm.yyyy
           const parts = dateStr.toString().split(' ')[0].split('.');
           if(parts.length >= 2) {
               const day = `${parts[0]}.${parts[1]}`;
               days[day] = (days[day] || 0) + 1;
           }
       }
    });

    return Object.entries(days).map(([name, count]) => ({ name, count })).slice(-14); // last 14 active days
  }, [leads]);

  return (
    <div className="space-y-8 pb-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat icon={<MousePointer2 className="text-white/40"/>} label="Трафік" value={stats.totalViews} />
        <Stat icon={<Users className="text-white/40"/>} label="Всього лідів" value={stats.totalLeads} />
        <Stat icon={<CreditCard className="text-[#C4A47C]"/>} label="Дохід (UAH)" value={`${stats.totalUAH.toLocaleString()} ₴`} />
        <Stat icon={<DollarSign className="text-[#C4A47C]"/>} label="Дохід (USD)" value={`$${stats.totalUSD.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
           <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-6">Воронка Конверсії</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                 <XAxis type="number" stroke="#ffffff30" tick={{fontSize: 10}} />
                 <YAxis dataKey="name" type="category" stroke="#ffffff30" tick={{fontSize: 10}} width={100} />
                 <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '12px'}} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {funnelData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Source Analysis */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
           <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-6">ТОП-5 Джерел (UTM)</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] uppercase font-bold text-white/30 border-b border-white/5">
                   <th className="pb-3">Джерело</th>
                   <th className="pb-3 text-right">Ліди</th>
                   <th className="pb-3 text-right">Клієнти</th>
                   <th className="pb-3 text-right">Дохід (UAH)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {utmData.map(row => (
                   <tr key={row.name}>
                     <td className="py-3 text-xs font-bold text-white/80">{row.name}</td>
                     <td className="py-3 text-xs text-white/60 text-right">{row.leads}</td>
                     <td className="py-3 text-xs text-[#C4A47C] font-bold text-right">{row.paid}</td>
                     <td className="py-3 text-xs text-white/90 text-right">{row.revenueUAH.toLocaleString()} ₴</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 p-6 rounded-3xl">
           <h3 className="text-xs uppercase font-bold text-white/50 tracking-wider mb-6">Динаміка реєстрацій (Останні дні)</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#C4A47C" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#C4A47C" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" stroke="#ffffff30" tick={{fontSize: 10}} />
                 <YAxis stroke="#ffffff30" tick={{fontSize: 10}} />
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                 <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '12px'}} />
                 <Area type="monotone" dataKey="count" stroke="#C4A47C" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-[#111] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-white/[0.02] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-white/90">{value}</p>
      </div>
    </div>
  );
}
