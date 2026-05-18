'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MousePointer2, CreditCard, Search, ChevronRight, User, Phone,
  Activity, History, Tag, BarChart3, PieChart as PieChartIcon,
  Filter, DollarSign, Copy, Check, Send, LogOut, Loader2, LayoutGrid, List,
  Compass, Globe, ExternalLink, FileText, Target, Calendar
} from 'lucide-react';
import KanbanBoard from '@/components/admin/KanbanBoard';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PaymentLinkGenerator from '@/components/admin/PaymentLinkGenerator';

interface Lead {
  date?: string;
  name?: string;
  phone?: string;
  telegram?: string;
  tariff?: string;
  amount?: string;
  niche?: string;
  orderId?: string;
  status?: string;
  visitorId?: string;
  "Дата та час"?: string;
  "Ім'я"?: string;
  "Телефон"?: string;
  "Telegram"?: string;
  "Тариф"?: string;
  "Сума"?: string;
  "Ніша"?: string;
  "Номер замовлення"?: string;
  "Статус оплати"?: string;
  "Visitor ID"?: string;
  "Коментар"?: string;
  comment?: string;
  _sheet: string;
  [key: string]: any;
}

interface Traffic {
  date?: string;
  visitorId?: string;
  "Дата та час"?: string;
  "Visitor ID"?: string;
  "Шлях"?: string;
  "IP"?: string;
  "User Agent"?: string;
  "UTM Source"?: string;
  [key: string]: any;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [globalUsers, setGlobalUsers] = useState<any[]>([]);
  const [globalActions, setGlobalActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'analytics'>('table');
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterNiche, setFilterNiche] = useState('all');

  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [localComment, setLocalComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isPaymentLinkOpen, setIsPaymentLinkOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const elements = [document.body, document.documentElement];
    if (selectedVisitorId) {
      elements.forEach(el => {
        el.style.overflow = 'hidden';
        el.style.height = '100vh';
      });
    } else {
      elements.forEach(el => {
        el.style.overflow = '';
        el.style.height = '';
      });
    }
    return () => {
      elements.forEach(el => {
        el.style.overflow = '';
        el.style.height = '';
      });
    };
  }, [selectedVisitorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data', { method: 'POST' });
      if (!res.ok) {
        const text = await res.text();
        console.error('API Error:', res.status, text);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLeads(data.leads || []);
      setTraffic(data.traffic || []);
      setGlobalUsers(data.global_users || []);
      setGlobalActions(data.global_actions || []);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseSheetDate = (dateStr: any): number => {
    if (!dateStr) return 0;
    const str = dateStr.toString().trim();
    if (!str) return 0;
    
    // Check if it's already a timestamp
    if (/^\d+$/.test(str)) {
      return parseInt(str);
    }
    
    // Try native Date.parse first (useful for ISO formats like 2026-05-10T12:41:34.000Z)
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
    
    // Fallback for dates like YYYY-MM-DD HH:MM:SS by replacing dashes only if it doesn't have 'T'
    const normalizedStr = str.includes('T') ? str : str.replace(/-/g, '/');
    const fallbackParsed = Date.parse(normalizedStr);
    return isNaN(fallbackParsed) ? 0 : fallbackParsed;
  };

  const getStatusData = (lead: Lead) => {
    const statusRaw = (lead.status || lead["Статус оплати"] || lead["Статус"] || '').toString().toLowerCase();
    const amountStr = (lead.amount || lead["Сума"] || lead["Ціна"] || '').toString();
    const amountRaw = amountStr.toLowerCase();
    const tariffRaw = (lead.tariff || lead["Тариф"] || lead["Пакет"] || '').toString().toUpperCase();

    let status = 'Очікує';
    let weight = 1;
    let revenueUAH = 0;
    let revenueUSD = 0;

    // Numerical extraction
    const amountVal = parseFloat(amountStr.replace(/[^\d.]/g, '')) || 0;
    const isPaid = statusRaw.includes('оплачено') || 
                   statusRaw.includes('approved') || 
                   statusRaw.includes('success') || 
                   statusRaw.includes('трипвайєр') || 
                   statusRaw.includes('тріпваєр') || 
                   statusRaw.includes('трипвайер');

    const isFailed = statusRaw.includes('declined') ||
                     statusRaw.includes('failed') ||
                     statusRaw.includes('expired') ||
                     statusRaw.includes('error') ||
                     statusRaw.includes('reject') ||
                     statusRaw.includes('відхилено') ||
                     statusRaw.includes('скасовано') ||
                     statusRaw.includes('помилка');

    const leadDateStr = lead.date || lead["Дата та час"] || lead["Дата"];
    const leadDateTime = parseSheetDate(leadDateStr);
    const isExpired = !isPaid && !isFailed && leadDateTime > 0 && (Date.now() - leadDateTime > 24 * 60 * 60 * 1000);

    const sheetNameClean = getSheetName(lead._sheet || '').toLowerCase();
    const isFreeSheet = ['vsl 1 етап', 'vsl форма', 'vsl воронка (старт)', 'безкоштовна лекція', 'ленд 1', 'ленд 2', 'мастеркласс', 'майстер клас'].some(s => sheetNameClean.includes(s)) ||
                        (!isPaid && amountVal === 0 && !tariffRaw && !statusRaw.includes('очікує') && !statusRaw.includes('pending'));

    const isTripwirePrice = amountVal === 9 || amountVal === 39;
    const isBookingPrice = amountVal === 1000;

    if (isFreeSheet) {
      status = 'Заявка';
      weight = 3;
    } else if ((isBookingPrice || statusRaw.includes('бронь') || statusRaw.includes('заброньовано')) && isPaid) {
      status = 'Оплачено';
      weight = 5;
      revenueUAH = isBookingPrice ? 1000 : 0;
    } else if ((isTripwirePrice || statusRaw.includes('трипвайєр') || statusRaw.includes('тріпваєр') || statusRaw.includes('трипвайер')) && isPaid) {
      status = 'Купив(-ла) трипвайєр';
      weight = 4;
      revenueUSD = amountVal || (amountRaw.includes('39') ? 39 : 9);
    } else if (isPaid && amountVal >= 100) {
      // If amount is 1000 UAH or more (e.g. course payment), it's full Paid
      status = 'Оплачено';
      weight = 5;
      if (tariffRaw.includes('ІНДИВІДУАЛЬНИЙ')) revenueUSD = 911;
      else if (tariffRaw.includes('ГРУПОВИЙ')) revenueUSD = 505;
      else if (tariffRaw.includes('САМОСТІЙНИЙ')) revenueUSD = 399;
      else {
        // If it's in UAH (like booking 1000), don't treat as USD
        if (amountVal === 1000) revenueUAH = 1000;
        else revenueUSD = amountVal;
      }
    } else if (isPaid && (amountVal > 0 || isTripwirePrice)) {
      status = 'Купив(-ла) трипвайєр';
      weight = 4;
      revenueUSD = amountVal || (amountRaw.includes('39') ? 39 : 9);
    } else if (isFailed || statusRaw.includes('відхилено') || statusRaw.includes('скасовано')) {
      status = 'Відхилено';
      weight = 0;
    } else if (isExpired) {
      status = 'Минув термін';
      weight = 0;
    } else if (isPaid) {
      // General paid status if we couldn't determine type but it's clearly paid
      status = 'Оплачено';
      weight = 5;
    }

    return { status, weight, revenueUAH, revenueUSD, tariff: tariffRaw, niche: String(lead.niche || lead["Ніша"] || lead["Niche"] || '') };
  };

  const normalizePhone = (p: any) => p?.toString().replace(/\D/g, '') || '';
  const normalizeTg = (t: any) => t?.toString().toLowerCase().replace('@', '').trim() || '';

  const getSheetName = (name: string) => {
    if (name === 'VSL 1 етап' || name === 'Ленд 1') return 'VSL Воронка (старт)';
    if (name === 'VSL Форма' || name === 'Ленд 2') return 'VSL Форма';
    if (name === 'Лиды МК' || name === 'Masterclass_Leads') return 'Майстер-клас';
    return name;
  };

  const getFriendlyPathName = (path: string) => {
    if (!path) return "🔗 Відвідування сайту";
    const p = path.toLowerCase().trim();
    
    if (p === '/' || p === '') return "🏠 Головна сторінка (VSL)";
    if (p.includes('/practicum')) return "📚 Практикум (Лендінг)";
    if (p.includes('/checkout')) return "💳 Сторінка оплати (Checkout)";
    if (p.includes('/free-lection')) return "🎥 Безкоштовна лекція";
    if (p.includes('/rozbir')) return "🎯 Запис на розбір";
    if (p.includes('/price')) return "💰 Прайс-лист";
    if (p.includes('/offer')) return "📜 Публічна оферта";
    if (p.includes('/privacy')) return "🔒 Політика конфіденційності";
    if (p.includes('/admin')) return "🖥️ Панель адміністратора";
    if (p.includes('/summarizer')) return "📝 Інструмент конспектування";
    
    return `🔗 Перегляд: ${path}`;
  };

  const getHistoryLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'Оплачено':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          label: 'Оплачено ✅'
        };
      case 'Купив(-ла) трипвайєр':
        return {
          bg: 'bg-[#C4A47C]/10 border-[#C4A47C]/20 text-[#C4A47C]',
          label: 'Трипвайєр ⚡'
        };
      case 'Заявка':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          label: 'Заявка 📝'
        };
      case 'Відхилено':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          label: 'Відхилено ❌'
        };
      case 'Минув термін':
        return {
          bg: 'bg-red-500/10 border-red-500/10 text-red-400/60',
          label: 'Минув термін ⏳'
        };
      case 'Очікує':
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          label: 'Очікує ⏳'
        };
    }
  };

  // Process and deduplicate leads
  const { processedLeads, visitorToSelectionId, uuidToSelectionId } = useMemo(() => {
    const map = new Map<string, any>();
    
    leads.forEach((l, index) => {
      const phone = normalizePhone(l.phone || l["Телефон"]);
      const tg = normalizeTg(l.telegram || l["Telegram"] || l["Телеграм"]);
      
      let identifier = '';
      const cleanUUID = (l.UUID || '').trim();
      const cleanPhone = phone;
      const cleanTg = tg;
      const cleanVisitor = (l.visitorId || l["Visitor ID"] || '').trim();

      const isValidPhone = cleanPhone.length >= 7;
      const isValidTg = cleanTg && 
                        cleanTg.length > 2 && 
                        cleanTg !== 'direct' && 
                        cleanTg !== 'none' && 
                        cleanTg !== 'null' && 
                        cleanTg !== 'undefined';
      
      const isValidVisitor = cleanVisitor.length > 5 && 
                             !cleanVisitor.toLowerCase().includes('null') && 
                             !cleanVisitor.toLowerCase().includes('undefined');
      
      if (cleanUUID) {
        identifier = cleanUUID;
      } else if (isValidPhone) {
        identifier = `phone-${cleanPhone}`;
      } else if (isValidTg) {
        identifier = `tg-${cleanTg}`;
      } else if (isValidVisitor) {
        identifier = `visitor-${cleanVisitor}`;
      } else {
        identifier = `temp-${index}-${Date.now()}-${Math.random()}`;
      }
      
      const sData = getStatusData(l);
      const leadDate = parseSheetDate(l.date || l["Дата та час"] || l["Дата"]);
      
      const enhancedLead = {
        ...l,
        _selectionId: identifier,
        _computedStatus: sData.status,
        _computedWeight: sData.weight,
        _revenueUAH: sData.revenueUAH,
        _revenueUSD: sData.revenueUSD,
        _tariff: sData.tariff,
        _niche: sData.niche,
        _allSheets: [getSheetName(l._sheet)],
        _tags: [] as string[],
        _latestAction: leadDate,
        _allVisitorIds: cleanVisitor ? [cleanVisitor] : [],
        _allUUIDs: cleanUUID ? [cleanUUID] : []
      };

      if (!map.has(identifier)) {
        map.set(identifier, enhancedLead);
      } else {
        const existing = map.get(identifier);
        
        // Mark as duplicate and add tag
        existing._isDuplicate = true;
        if (!existing._tags.includes('Повтор')) existing._tags.push('Повтор');
        
        // Merge sheets
        const mappedSheet = getSheetName(l._sheet);
        if (!existing._allSheets.includes(mappedSheet)) {
          existing._allSheets.push(mappedSheet);
        }
        
        // Update latest action if newer
        if (leadDate > existing._latestAction) {
          existing._latestAction = leadDate;
        }

        // Update all associated visitor IDs and UUIDs
        if (cleanVisitor && !existing._allVisitorIds.includes(cleanVisitor)) {
          existing._allVisitorIds.push(cleanVisitor);
        }
        if (cleanUUID && !existing._allUUIDs.includes(cleanUUID)) {
          existing._allUUIDs.push(cleanUUID);
        }

        // Merge phones/telegrams visually
        if (phone && String(existing.phone) !== String(phone) && !String(existing.phone || '').includes(phone)) {
            existing.phone = [existing.phone, phone].filter(Boolean).join(', ');
        }
        if (tg && String(existing.telegram) !== String(tg) && !String(existing.telegram || '').includes(tg)) {
            existing.telegram = [existing.telegram, tg].filter(Boolean).join(', ');
        }
        
        // Update if new lead has higher priority status, or if same priority but newer date
        const existingDate = parseSheetDate(existing.date || existing["Дата та час"] || existing["Дата"]);
        
        if (sData.weight > existing._computedWeight || (sData.weight === existing._computedWeight && leadDate > existingDate)) {
          const mergedTags = [...new Set([...existing._tags, 'Повтор'])];
          map.set(identifier, {
            ...enhancedLead,
            _allSheets: existing._allSheets,
            _isDuplicate: true,
            _tags: mergedTags,
            _latestAction: existing._latestAction, // Preserve the latest action we just updated
            _allVisitorIds: existing._allVisitorIds,
            _allUUIDs: existing._allUUIDs,
            phone: existing.phone, // preserve merged
            telegram: existing.telegram, // preserve merged
            comment: l.comment || l["Коментар"] || existing.comment || existing["Коментар"]
          });
        } else {
          existing.comment = existing.comment || existing["Коментар"] || l.comment || l["Коментар"];
        }
      }
    });

    // Populate global comments
    globalUsers.forEach(u => {
        if(u.UUID && u.Comment && map.has(u.UUID)) {
            const user = map.get(u.UUID);
            user.comment = u.Comment;
        }
    });

    // Build lookup indexes for correct traffic matching
    const visitorToSelectionId = new Map<string, string>();
    const uuidToSelectionId = new Map<string, string>();

    map.forEach((lead) => {
      lead._allVisitorIds.forEach((vid: string) => {
        visitorToSelectionId.set(vid, lead._selectionId);
      });
      lead._allUUIDs.forEach((uuid: string) => {
        uuidToSelectionId.set(uuid, lead._selectionId);
      });
    });

    // Process traffic to update latest action timestamp for existing leads
    traffic.forEach(t => {
       const vid = t.visitorId || t["Visitor ID"];
       const tUuid = (t as any).UUID;
       const tDate = parseSheetDate(t.date || t["Дата та час"] || t["Дата"]);
       
       let matchedSelectionId: string | undefined;
       if (tUuid) {
         matchedSelectionId = uuidToSelectionId.get(tUuid);
       }
       if (!matchedSelectionId && vid) {
         matchedSelectionId = visitorToSelectionId.get(vid);
       }
       
       if (matchedSelectionId && map.has(matchedSelectionId)) {
         const user = map.get(matchedSelectionId);
         if (tDate > user._latestAction) {
           user._latestAction = tDate;
         }
       }
    });

    // Final tag assignment based on cross-referencing traffic if needed, 
    // or just source-based tags
    const result = Array.from(map.values()).map(lead => {
        const tags = [...lead._tags];
        if (lead._allSheets.length > 1 && !tags.includes('Multi-Source')) tags.push('Multi-Source');
        if (lead._allSheets.includes('Бронювання') && !tags.includes('Booking')) tags.push('Booking');
        return { ...lead, _tags: tags };
    });
    
    return {
      processedLeads: result.sort((a, b) => b._latestAction - a._latestAction),
      visitorToSelectionId,
      uuidToSelectionId
    };
  }, [leads, traffic, globalUsers]);

  // Apply filters
  const finalLeads = useMemo(() => {
    return processedLeads.filter(l => {
      // Search
      const searchLower = search.toLowerCase();
      const name = (l.name || l["Ім'я"] || '').toString().toLowerCase();
      const phone = normalizePhone(l.phone || l["Телефон"]);
      const tg = normalizeTg(l.telegram || l["Telegram"]);
      
      if (search && !name.includes(searchLower) && !phone.includes(search) && !tg.includes(searchLower)) return false;

      // Status
      if (filterStatus !== 'all') {
        if (filterStatus === 'unpaid_intent') {
          // 1. Must NOT be paid anywhere
          const isPaidAnywhere = l._computedStatus === 'Оплачено' || l._computedStatus === 'Купив(-ла) трипвайєр';
          if (isPaidAnywhere) return false;

          // 2. Must have either attempted to pay or visited one of the paid pages
          const hasUnpaidLeadAttempt = l._allSheets.some((sheet: string) => 
            ['практикум', 'бронювання', 'розбір', 'price', 'checkout'].some(ps => sheet.toLowerCase().includes(ps))
          );
          
          const visitorTraffic = traffic.filter(t => {
            if (l.visitorId && (t.visitorId === l.visitorId || t["Visitor ID"] === l.visitorId)) return true;
            if (l.UUID && (t as any).UUID === l.UUID) return true;
            return false;
          });
          
          const hasVisitedPaidPage = visitorTraffic.some(t => {
            const path = (t.path || t["Шлях"] || '').toLowerCase();
            return path.includes('/practicum') || path.includes('/checkout') || path.includes('/price') || path.includes('/rozbir');
          });

          if (!hasUnpaidLeadAttempt && !hasVisitedPaidPage) return false;
        } else {
          if (l._computedStatus !== filterStatus) return false;
        }
      }
      
      // Source
      if (filterSource !== 'all' && !l._allSheets.includes(filterSource)) return false;

      // Niche
      if (filterNiche !== 'all' && !l._niche.toLowerCase().includes(filterNiche.toLowerCase())) return false;

      return true;
    });
  }, [processedLeads, search, filterStatus, filterSource, filterNiche]);

  const revenueStats = useMemo(() => {
    return processedLeads.reduce((acc, lead) => {
      acc.uah += lead._revenueUAH || 0;
      acc.usd += lead._revenueUSD || 0;
      return acc;
    }, { uah: 0, usd: 0 });
  }, [processedLeads]);

  const allNiches = useMemo(() => {
    return [...new Set(processedLeads.map(l => l._niche).filter(Boolean))];
  }, [processedLeads]);

  const allSources = useMemo(() => {
    return [...new Set(processedLeads.flatMap(l => l._allSheets))];
  }, [processedLeads]);


  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  // Actions
  const updateLeadStatus = async (newStatus: string) => {
    const selectedLead = processedLeads.find(l => l._selectionId === selectedVisitorId);
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          targetSheet: selectedLead._sheet, // Updating the most recent/highest weight sheet
          orderId: selectedLead.orderId || selectedLead["Номер замовлення"] || selectedLead.visitorId,
          status: newStatus
        })
      });
      const result = await res.json();
      if (result.result === 'success') {
        fetchData(); // refresh data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const updateLeadKanbanStatus = async (uuid: string, status: string) => {
    try {
      setGlobalUsers(prev => prev.map(u => u.UUID === uuid ? {...u, Sales_Status: status} : u));
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_global_user',
          uuid,
          sales_status: status
        })
      });
      const result = await res.json();
      if (result.result === 'success') fetchData();
    } catch(err) {}
  };

  const saveComment = async () => {
    const selectedLead = processedLeads.find(l => l._selectionId === selectedVisitorId);
    if (!selectedLead) return;
    setSavingComment(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_global_user',
          uuid: selectedLead.UUID || selectedLead._selectionId,
          comment: localComment
        })
      });
      const result = await res.json();
      if (result.result === 'success') {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingComment(false);
    }
  };

  const selectedLead = processedLeads.find(l => l._selectionId === selectedVisitorId);
  useEffect(() => {
    if (selectedLead) {
      setLocalComment(selectedLead.comment || selectedLead["Коментар"] || '');
    }
  }, [selectedVisitorId]);



  if (loading && leads.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#C4A47C]" />
          <p className="text-[#C4A47C] font-bold tracking-widest animate-pulse uppercase text-[10px]">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-8 font-sans selection:bg-[#C4A47C]/30">
      {/* Header & Controls */}
      <div className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="inline-block border-l-2 border-[#C4A47C] pl-4 mb-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-headline">
              Admin Portal
            </h1>
          </div>
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold">Victoria MC CRM</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-end gap-3">
          <div className="col-span-2 md:col-span-2 lg:w-64 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#C4A47C] transition-colors" />
            <input 
              type="text" 
              placeholder="Пошук..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#C4A47C] transition-all placeholder:text-white/20 text-xs font-bold"
            />
          </div>

          <FilterSelect 
            label="Статус"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { v: 'all', l: 'Всі статуси' },
              { v: 'Оплачено', l: 'Оплачено' },
              { v: 'Купив(-ла) трипвайєр', l: 'Тріпваєр' },
              { v: 'unpaid_intent', l: '🔥 Хотів купити, але не сплатив' },
              { v: 'Очікує', l: 'Очікує' },
              { v: 'Відхилено', l: 'Відхилено' },
              { v: 'Минув термін (Expired)', l: 'Минув термін' },
              { v: 'Заявка', l: 'Заявка (Безкоштовно)' }
            ]}
          />

          <FilterSelect 
            label="Джерело"
            value={filterSource}
            onChange={setFilterSource}
            options={[
              { v: 'all', l: 'Всі ленди' },
              ...allSources.map(s => ({ v: s, l: s }))
            ]}
          />

          <FilterSelect 
            label="Ніша"
            value={filterNiche}
            onChange={setFilterNiche}
            options={[
              { v: 'all', l: 'Всі ніші' },
              ...allNiches.map(s => ({ v: s, l: s }))
            ]}
          />

          <button 
            onClick={handleLogout}
            className="h-[46px] w-[46px] flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl text-white/30 hover:text-white transition-all active:scale-95"
            title="Вийти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          icon={<Users className="text-[#C4A47C]" />}
          label="Унікальних лідів"
          value={processedLeads.length}
          sub={`Всього ${leads.length} записів`}
        />
        <StatCard 
          icon={<DollarSign className="text-emerald-400" />}
          label="Дохід (USD)"
          value={`$${revenueStats.usd.toLocaleString()}`}
          sub="Повні оплати та тріпваєри"
        />
        <StatCard 
          icon={<CreditCard className="text-[#3B82F6]" />}
          label="Бронювання (UAH)"
          value={`${revenueStats.uah.toLocaleString()} ₴`}
          sub="Сума по 1000 грн за бронь"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-[#111] p-1 rounded-2xl w-fit border border-white/5">
        <button onClick={() => setActiveTab('kanban')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'kanban' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
          <LayoutGrid size={14} /> Канбан
        </button>
        <button onClick={() => setActiveTab('table')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'table' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
          <List size={14} /> Таблиця
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
          <BarChart3 size={14} /> Аналітика
        </button>
      </div>

      {activeTab === 'analytics' && (
        <AnalyticsDashboard leads={processedLeads} traffic={traffic} globalActions={globalActions} />
      )}

      {activeTab === 'kanban' && (
        <KanbanBoard leads={finalLeads} globalUsers={globalUsers} updateLeadStatus={updateLeadKanbanStatus} onLeadClick={setSelectedVisitorId} />
      )}

      {activeTab === 'table' && (
        <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="font-black uppercase tracking-widest text-[10px] text-white/30">Client Database</h2>
            <button onClick={fetchData} className="text-[10px] text-[#C4A47C] hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              {loading && <Loader2 size={12} className="animate-spin" />}
              Refresh
            </button>
          </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em] bg-white/[0.02]">
                <th className="px-8 py-5">Клієнт</th>
                <th className="px-8 py-5">Контакти</th>
                <th className="px-8 py-5">Статус / Пакет</th>
                <th className="px-8 py-5">Ніша</th>
                <th className="px-8 py-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {finalLeads.map((lead, i) => (
                <LeadRow 
                  key={lead._selectionId} 
                  lead={lead} 
                  onClick={() => setSelectedVisitorId(lead._selectionId)} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {selectedVisitorId && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisitorId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#111111] border border-white/10 rounded-3xl overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-[650px] md:max-h-[80vh] premium-scrollbar"
            >
              {/* Left Column */}
              <div 
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="w-full md:w-[360px] bg-[#0A0A0A] p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/5 md:overflow-y-auto md:h-full shrink-0 premium-scrollbar"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-white/5 flex items-center justify-center text-2xl font-bold text-white/80 shadow-inner">
                    {selectedLead["Ім'я"]?.[0] || 'U'}
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase font-bold text-white/30 tracking-[0.2em] mb-2">Змінити Статус</p>
                    <select 
                      value={selectedLead._computedStatus} 
                      disabled={updating}
                      onChange={(e) => updateLeadStatus(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer focus:outline-none focus:border-[#C4A47C] text-[#C4A47C] w-full text-center"
                    >
                      <option value="Оплачено" className="bg-[#111]">Оплачено (Курс/Бронь)</option>
                      <option value="Купив(-ла) трипвайєр" className="bg-[#111]">Тріпваєр ($9/$39)</option>
                      <option value="Відхилено" className="bg-[#111]">Відхилено</option>
                      <option value="Очікує" className="bg-[#111]">Очікує</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsPaymentLinkOpen(true)}
                    className="w-full bg-[#C4A47C]/10 text-[#C4A47C] hover:bg-[#C4A47C]/20 transition-colors rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-6"
                  >
                    <CreditCard size={14} /> Створити посилання на оплату
                  </button>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">{selectedLead.name || selectedLead["Ім'я"] || 'Anonymous'}</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedLead._allSheets.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-bold uppercase tracking-wider text-white/40">{s}</span>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <InfoRow icon={<Phone size={14} />} label="Телефон" value={selectedLead.phone || selectedLead["Телефон"] || '—'} isCopyable />
                    <InfoRow icon={<Send size={14} />} label="Telegram" value={selectedLead.telegram || selectedLead["Telegram"] || '—'} isTelegram color="text-[#C4A47C]" />
                    <InfoRow icon={<Tag size={14} />} label="Тариф" value={selectedLead._tariff || '—'} />
                    <InfoRow icon={<Activity size={14} />} label="Ніша" value={selectedLead._niche || '—'} italic />
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <p className="text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1">Маркетингове джерело (UTM)</p>
                    <InfoRow icon={<Compass size={14} />} label="Джерело" value={selectedLead.utm_source || selectedLead["utm_source"] || selectedLead["Source"] || selectedLead["Джерело"] || '—'} />
                    <InfoRow icon={<Globe size={14} />} label="Канал" value={selectedLead.utm_medium || selectedLead["utm_medium"] || selectedLead["Medium"] || selectedLead["Канал"] || '—'} />
                    <InfoRow icon={<Target size={14} />} label="Кампанія" value={selectedLead.utm_campaign || selectedLead["utm_campaign"] || selectedLead["Campaign"] || selectedLead["Кампанія"] || '—'} />
                    {(selectedLead.utm_content || selectedLead["utm_content"] || selectedLead["Content"]) && (
                      <InfoRow icon={<FileText size={14} />} label="Контент" value={selectedLead.utm_content || selectedLead["utm_content"] || selectedLead["Content"] || '—'} />
                    )}
                    {(selectedLead.url || selectedLead["url"] || selectedLead["URL"]) && (
                      <InfoRow icon={<ExternalLink size={14} />} label="URL першого торкання" value={selectedLead.url || selectedLead["url"] || selectedLead["URL"] || '—'} isCopyable />
                    )}
                  </div>

                  {/* First Touch Block */}
                  {(() => {
                    const leadPhone = normalizePhone(selectedLead.phone || selectedLead["Телефон"]);
                    const leadTg = normalizeTg(selectedLead.telegram || selectedLead["Telegram"]);
                    
                    const fLeads = leads.filter(l => {
                      if (selectedLead.UUID && l.UUID && l.UUID === selectedLead.UUID) return true;
                      const vid = l.visitorId || l["Visitor ID"];
                      const selVid = selectedLead.visitorId || selectedLead["Visitor ID"];
                      if (vid && selVid && vid === selVid && vid.length > 5) return true;
                      const p = normalizePhone(l.phone || l["Телефон"]);
                      if (p && leadPhone && leadPhone.includes(p) && p.length >= 7) return true;
                      const t = normalizeTg(l.telegram || l["Telegram"]);
                      const isValidTg = t && t.length > 2 && t !== 'direct' && t !== 'none' && t !== 'null' && t !== 'undefined';
                      const isSelectedLeadTgValid = leadTg && leadTg.length > 2 && leadTg !== 'direct' && leadTg !== 'none' && leadTg !== 'null' && leadTg !== 'undefined';
                      if (isValidTg && isSelectedLeadTgValid && leadTg.includes(t)) return true;
                      return false;
                    });

                    const fTraffic = traffic.filter(t => {
                      const vid = t.visitorId || t["Visitor ID"];
                      const tUuid = (t as any).UUID;
                      if (tUuid && uuidToSelectionId.get(tUuid) === selectedLead._selectionId) return true;
                      if (vid && visitorToSelectionId.get(vid) === selectedLead._selectionId) return true;
                      if (selectedLead.visitorId && (t.visitorId === selectedLead.visitorId || t["Visitor ID"] === selectedLead.visitorId)) return true;
                      if (selectedLead.UUID && (t as any).UUID === selectedLead.UUID) return true;
                      const matchedVisitorIds = fLeads.map(l => l.visitorId || l["Visitor ID"]).filter(Boolean);
                      if (vid && matchedVisitorIds.includes(vid)) return true;
                      return false;
                    });

                    const sortedChronological = [...fTraffic, ...fLeads].sort((a, b) => {
                      const dateA = parseSheetDate(a.date || a["Дата та час"] || a["Дата"]);
                      const dateB = parseSheetDate(b.date || b["Дата та час"] || b["Дата"]);
                      return dateA - dateB;
                    });

                    if (sortedChronological.length > 0) {
                      const firstEvent = sortedChronological[0];
                      const isLead = !!firstEvent._sheet;
                      const firstTouchDate = new Date(firstEvent.date || firstEvent["Дата та час"] || firstEvent["Дата"]).toLocaleString('uk-UA');
                      const firstTouchPage = isLead 
                        ? `Заявка: ${getSheetName(firstEvent._sheet)}` 
                        : getFriendlyPathName(firstEvent.path || firstEvent["Шлях"]);

                      return (
                        <div className="pt-6 border-t border-white/5 space-y-3">
                          <p className="text-[9px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1 flex items-center gap-1.5">
                            <Calendar size={10} className="text-[#C4A47C]" /> Перше касання (First Touch)
                          </p>
                          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3">
                            <div>
                              <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-0.5">Дата та час</span>
                              <span className="text-xs font-medium text-white/80">{firstTouchDate}</span>
                            </div>
                            <div>
                              <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-0.5">Сторінка входу</span>
                              <span className="text-xs font-semibold text-[#C4A47C]">{firstTouchPage}</span>
                            </div>
                            {(firstEvent.utm_source || firstEvent["utm_source"] || firstEvent["Source"]) && (
                              <div>
                                <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-0.5">UTM Source (Перше касання)</span>
                                <span className="text-xs font-medium text-white/70">{firstEvent.utm_source || firstEvent["utm_source"] || firstEvent["Source"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="pt-8 border-t border-white/5 mt-auto">
                    <p className="text-[9px] uppercase font-bold text-white/30 mb-3 tracking-[0.2em]">Нотатки</p>
                    <div className="relative group">
                      <textarea 
                        value={localComment}
                        onChange={(e) => setLocalComment(e.target.value)}
                        placeholder="Додати коментар..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-white/80 focus:outline-none focus:border-[#C4A47C] min-h-[120px] resize-none transition-all placeholder:text-white/10"
                      />
                      <button 
                        onClick={saveComment}
                        disabled={savingComment || localComment === (selectedLead.comment || selectedLead["Коментар"] || '')}
                        className="absolute bottom-3 right-3 px-4 py-2 bg-[#C4A47C] text-black text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-focus-within:opacity-100 disabled:opacity-0 transition-all hover:bg-[#D4B48C]"
                      >
                        {savingComment ? 'Збереження...' : 'Зберегти'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: History */}
              <div 
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="flex-1 p-6 md:p-8 md:overflow-y-auto md:h-full premium-scrollbar"
              >
                <div className="flex items-center gap-3 mb-8">
                  <History size={16} className="text-white/30" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Історія активності</h3>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5" />

                  {(() => {
                    const leadPhone = normalizePhone(selectedLead.phone || selectedLead["Телефон"]);
                    const leadTg = normalizeTg(selectedLead.telegram || selectedLead["Telegram"]);
                    
                    const filteredLeads = leads.filter(l => {
                      if (selectedLead.UUID && l.UUID && l.UUID === selectedLead.UUID) return true;
                      
                      const vid = l.visitorId || l["Visitor ID"];
                      const selVid = selectedLead.visitorId || selectedLead["Visitor ID"];
                      if (vid && selVid && vid === selVid && vid.length > 5) return true;
                      
                      const p = normalizePhone(l.phone || l["Телефон"]);
                      if (p && leadPhone && leadPhone.includes(p) && p.length >= 7) return true;
                      
                      const t = normalizeTg(l.telegram || l["Telegram"]);
                      const isValidTg = t && t.length > 2 && t !== 'direct' && t !== 'none' && t !== 'null' && t !== 'undefined';
                      const isSelectedLeadTgValid = leadTg && leadTg.length > 2 && leadTg !== 'direct' && leadTg !== 'none' && leadTg !== 'null' && leadTg !== 'undefined';
                      if (isValidTg && isSelectedLeadTgValid && leadTg.includes(t)) return true;
                      
                      return false;
                    });

                    const filteredTraffic = traffic.filter(t => {
                      const vid = t.visitorId || t["Visitor ID"];
                      const tUuid = (t as any).UUID;
                      if (tUuid && uuidToSelectionId.get(tUuid) === selectedLead._selectionId) return true;
                      if (vid && visitorToSelectionId.get(vid) === selectedLead._selectionId) return true;
                      if (selectedLead.visitorId && (t.visitorId === selectedLead.visitorId || t["Visitor ID"] === selectedLead.visitorId)) return true;
                      if (selectedLead.UUID && (t as any).UUID === selectedLead.UUID) return true;
                      
                      const matchedVisitorIds = filteredLeads.map(l => l.visitorId || l["Visitor ID"]).filter(Boolean);
                      if (vid && matchedVisitorIds.includes(vid)) return true;

                      return false;
                    });

                    const allEvents = [...filteredTraffic, ...filteredLeads] as any[];
                    allEvents.sort((a, b) => {
                      const dateA = parseSheetDate(a.date || a["Дата та час"] || a["Дата"]);
                      const dateB = parseSheetDate(b.date || b["Дата та час"] || b["Дата"]);
                      return dateB - dateA;
                    });

                    return allEvents.map((event, i) => {
                      const isLead = !!event._sheet;
                      const sData = getStatusData(event);
                      const badge = getHistoryLeadStatusBadge(sData.status);
                      const eventSheet = isLead ? getSheetName(event._sheet) : '';
                      const tariff = event.tariff || event["Тариф"] || event["Пакет"] || '';
                      const orderId = event.orderId || event["Номер замовлення"] || event["ID замовлення"] || '';
                      const amount = event.amount || event["Сума"] || event["Ціна"] || '';
                      const friendlyPath = !isLead ? getFriendlyPathName(event.path || event["Шлях"]) : '';

                      return (
                        <div key={i} className="relative pl-10 group/event">
                          <div className={`absolute left-0 top-0.5 h-8 w-8 rounded-full flex items-center justify-center z-10 border border-white/5 transition-colors ${isLead ? 'bg-[#C4A47C]/10 text-[#C4A47C]' : 'bg-white/[0.02] text-white/20'}`}>
                            {isLead ? <CreditCard size={12} /> : <MousePointer2 size={12} />}
                          </div>
                          <div>
                            <p className="text-[9px] text-white/30 font-medium mb-1 tracking-wider">{new Date(event.date || event["Дата та час"]).toLocaleString('uk-UA')}</p>
                            {isLead ? (
                              <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 mt-2 space-y-4 shadow-xl transition-all duration-300 hover:border-white/10 animate-fade-in">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                                      {badge.label}
                                    </span>
                                    {amount && (
                                      <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-white/60">
                                        💵 {amount}
                                      </span>
                                    )}
                                  </div>
                                  {eventSheet && (
                                    <span className="text-[9px] text-white/40 font-medium bg-white/[0.01] px-2 py-0.5 rounded-md border border-white/[0.02]">
                                      🎯 {eventSheet}
                                    </span>
                                  )}
                                </div>
                                
                                {(tariff || orderId) && (
                                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/[0.03]">
                                    {tariff && (
                                      <div>
                                        <span className="text-white/35 text-[9px] uppercase font-bold tracking-wider block mb-0.5">Тариф</span>
                                        <span className="font-semibold text-white/80">{tariff}</span>
                                      </div>
                                    )}
                                    {orderId && (
                                      <div>
                                        <span className="text-white/35 text-[9px] uppercase font-bold tracking-wider block mb-0.5">ID Замовлення</span>
                                        <span className="font-semibold text-white/50 font-mono truncate block max-w-[130px]" title={orderId}>{orderId}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-[#111111]/40 border border-white/[0.02] rounded-xl p-3.5 mt-2 transition-all duration-300 hover:bg-[#111111]/60">
                                <div className="flex items-center gap-3">
                                  <div className="h-6 w-6 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/30">
                                    <MousePointer2 size={11} />
                                  </div>
                                  <p className="font-medium text-xs text-white/80">{friendlyPath}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentLinkGenerator 
        isOpen={isPaymentLinkOpen} 
        onClose={() => setIsPaymentLinkOpen(false)} 
        selectedLead={selectedLead} 
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
      </div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight text-white/90">{value}</p>
        <p className="text-[9px] font-medium text-white/30 tracking-wider">{sub}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, color = "text-white/70", isCopyable = false, isTelegram = false, italic = false }: any) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (value && value !== '—') {
      navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const tgLink = isTelegram && value && value !== '—' ? `https://t.me/${value.toString().replace('@', '').trim()}` : null;
  return (
    <div className="flex items-center gap-3 group/info">
      <div className="text-white/20">{icon}</div>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase font-bold text-white/30 tracking-wider mb-0.5">{label}</p>
          {tgLink ? (
            <a href={tgLink} target="_blank" rel="noopener noreferrer" className={`text-xs font-medium ${color} hover:underline truncate`}>{value}</a>
          ) : (
            <p className={`text-xs font-medium ${color} truncate ${italic ? 'italic' : ''}`}>{value}</p>
          )}
        </div>
        {isCopyable && value && value !== '—' && (
          <button onClick={handleCopy} className="opacity-0 group-hover/info:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg">
            {copied ? <Check size={14} className="text-[#C4A47C]" /> : <Copy size={14} className="text-white/30 hover:text-white" />}
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] uppercase font-bold text-white/30 tracking-wider ml-1">{label}</p>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/[0.02] border border-white/5 rounded-xl py-2 px-3 focus:outline-none focus:border-[#C4A47C] text-[10px] font-bold uppercase tracking-wider text-white/70 appearance-none cursor-pointer hover:bg-white/[0.04] transition-colors min-w-[140px]"
      >
        {options.map((o: any) => (
          <option key={o.v} value={o.v} className="bg-[#111]">{o.l}</option>
        ))}
      </select>
    </div>
  );
}

// Memoized Lead Row for better performance
const LeadRow = memo(({ lead, onClick }: { lead: any, onClick: () => void }) => {
  return (
    <tr 
      className="hover:bg-white/[0.02] transition-colors cursor-pointer group border-l-2 border-transparent hover:border-[#C4A47C]"
      onClick={onClick}
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-white/10 flex items-center justify-center text-white/80 font-bold text-sm shadow-inner overflow-hidden">
              {(lead.name || lead["Ім'я"])?.[0] || <User size={16} className="text-white/40" />}
            </div>
            {lead._isDuplicate && (
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#C4A47C] border-2 border-[#0A0A0A] flex items-center justify-center" title="Повтор">
                <span className="text-[6px] font-black text-black">!</span>
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-white/90">{lead.name || lead["Ім'я"] || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-1">
                {lead._tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/40 uppercase font-black tracking-tighter">{tag}</span>
                ))}
                <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">{lead._selectionId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-white/70 tracking-wide">{lead.phone || lead["Телефон"] || '—'}</p>
          <p className="text-[10px] text-[#C4A47C]/80 font-medium tracking-wide">{lead.telegram || lead["Telegram"] || '—'}</p>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="space-y-2">
          <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusColor(lead._computedStatus)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {lead._computedStatus}
          </p>
          <div className="inline-block px-2 py-0.5 rounded pl-0 text-[9px] font-bold uppercase tracking-wider text-white/30">
            {lead._tariff || 'FREE'}
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider truncate max-w-[120px]">{lead._niche || '—'}</p>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-4">
          {(lead.comment || lead["Коментар"]) && (
            <div className="h-5 w-5 rounded-full bg-[#C4A47C]/10 flex items-center justify-center text-[#C4A47C]">
                <Activity size={10} className="animate-pulse" />
            </div>
          )}
          <div className="h-8 w-8 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-[#C4A47C] group-hover:text-black transition-all">
            <ChevronRight size={14} />
          </div>
        </div>
      </td>
    </tr>
  );
});

LeadRow.displayName = 'LeadRow';

function getStatusColor(status: string) {
  switch (status) {
    case 'Оплачено': return 'text-[#C4A47C]';
    case 'Купив(-ла) трипвайєр': return 'text-emerald-400';
    case 'Відхилено': return 'text-rose-500';
    default: return 'text-white/40';
  }
}
