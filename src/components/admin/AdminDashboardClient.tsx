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
import { logoutAction } from '@/actions/auth';
import OnboardingTour from '@/components/admin/OnboardingTour';

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

interface AdminDashboardClientProps {
  role: 'OP' | 'SALES' | 'DEVELOPER';
  username: string;
  defaultTab?: 'kanban' | 'table' | 'analytics';
  hideAnalytics?: boolean;
  onlyView?: 'analytics' | 'leads';
}

export default function AdminDashboardClient({ role, username, defaultTab, hideAnalytics = false, onlyView }: AdminDashboardClientProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [globalUsers, setGlobalUsers] = useState<any[]>([]);
  const [globalActions, setGlobalActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isSales = role === 'SALES';
  const shouldHideAnalytics = hideAnalytics || isSales || onlyView === 'leads';

  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'analytics'>(
    onlyView === 'analytics' 
      ? 'analytics' 
      : (onlyView === 'leads' ? 'table' : (defaultTab || (shouldHideAnalytics ? 'kanban' : 'table')))
  );
  
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

  // Read query params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    
    if (onlyView === 'leads') {
      const viewParam = params.get('view');
      setActiveTab(viewParam === 'kanban' ? 'kanban' : 'table');
    } else if (onlyView === 'analytics') {
      setActiveTab('analytics');
    }
    
    const searchParam = params.get('search');
    if (searchParam) setSearch(searchParam);
    
    const statusParam = params.get('status');
    if (statusParam) setFilterStatus(statusParam);
    
    const sourceParam = params.get('source');
    if (sourceParam) setFilterSource(sourceParam);
    
    const nicheParam = params.get('niche');
    if (nicheParam) setFilterNiche(nicheParam);
  }, [onlyView]);

  // Sync state back to URL query parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    
    if (onlyView === 'leads') {
      params.set('view', activeTab === 'kanban' ? 'kanban' : 'table');
    }
    if (search) params.set('search', search);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterSource !== 'all') params.set('source', filterSource);
    if (filterNiche !== 'all') params.set('niche', filterNiche);
    
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    
    if (window.location.search !== `?${queryString}` && (window.location.search || queryString)) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab, search, filterStatus, filterSource, filterNiche, onlyView]);

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
    let bookingUAH = 0;

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
    const isBookingPrice = amountVal === 1000 || amountVal === 2000;

    // Determine if currency is USD based on signs, standard USD prices, or low threshold
    const isUSD = amountStr.includes('$') || 
                  amountStr.toLowerCase().includes('usd') || 
                  [9, 39, 390, 399, 490, 505, 911, 1490].includes(amountVal) ||
                  (amountVal > 0 && amountVal < 100);

    if (isFreeSheet) {
      status = 'Заявка';
      weight = 3;
    } else if ((isBookingPrice || statusRaw.includes('бронь') || statusRaw.includes('заброньовано')) && isPaid) {
      status = 'Оплачено';
      weight = 5;
      revenueUAH = 0; // Standard prepayment bookings must only be in bookingUAH, not revenueUAH
      bookingUAH = amountVal || 1000;
    } else if ((isTripwirePrice || statusRaw.includes('трипвайєр') || statusRaw.includes('тріпваєр') || statusRaw.includes('трипвайер')) && isPaid) {
      status = 'Купив(-ла) трипвайєр';
      weight = 4;
      revenueUSD = amountVal || (amountRaw.includes('39') ? 39 : 9);
      if (revenueUSD === 9) revenueUAH = 370;
      else if (revenueUSD === 39) revenueUAH = 1600;
      else revenueUAH = Math.round(revenueUSD * 41.0);
    } else if (isPaid && amountVal >= 100) {
      status = 'Оплачено';
      weight = 5;
      if (tariffRaw.includes('ІНДИВІДУАЛЬНИЙ')) {
        revenueUSD = 911;
        revenueUAH = Math.round(911 * 41.0);
      } else if (tariffRaw.includes('ГРУПОВИЙ')) {
        revenueUSD = 505;
        revenueUAH = Math.round(505 * 41.0);
      } else if (tariffRaw.includes('САМОСТІЙНИЙ')) {
        revenueUSD = 399;
        revenueUAH = Math.round(399 * 41.0);
      } else {
        if (!isUSD) {
          if (amountVal === 1000 || amountVal === 2000) {
            revenueUAH = 0;
            bookingUAH = amountVal;
          } else {
            revenueUAH = amountVal;
          }
        } else {
          revenueUSD = amountVal;
          if (revenueUSD === 9) revenueUAH = 370;
          else if (revenueUSD === 39) revenueUAH = 1600;
          else revenueUAH = Math.round(amountVal * 41.0);
        }
      }
    } else if (isPaid && (amountVal > 0 || isTripwirePrice)) {
      status = 'Купив(-ла) трипвайєр';
      weight = 4;
      revenueUSD = amountVal || (amountRaw.includes('39') ? 39 : 9);
      if (revenueUSD === 9) revenueUAH = 370;
      else if (revenueUSD === 39) revenueUAH = 1600;
      else revenueUAH = Math.round(revenueUSD * 41.0);
    } else if (isFailed || statusRaw.includes('відхилено') || statusRaw.includes('скасовано')) {
      status = 'Відхилено';
      weight = 0;
    } else if (isExpired) {
      status = 'Минув термін';
      weight = 0;
    } else if (isPaid) {
      status = 'Оплачено';
      weight = 5;
      if (!isUSD) {
        if (amountVal === 1000 || amountVal === 2000) {
          revenueUAH = 0;
          bookingUAH = amountVal;
        } else {
          revenueUAH = amountVal;
        }
      } else {
        revenueUSD = amountVal;
        if (revenueUSD === 9) revenueUAH = 370;
        else if (revenueUSD === 39) revenueUAH = 1600;
        else revenueUAH = Math.round(amountVal * 41.0);
      }
    }

    return { status, weight, revenueUAH, revenueUSD, bookingUAH, tariff: tariffRaw, niche: String(lead.niche || lead["Ніша"] || lead["Niche"] || '') };
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
    // DSU helper class for transitive component clustering
    class DSU {
      parent: number[];
      constructor(size: number) {
        this.parent = Array.from({ length: size }, (_, i) => i);
      }
      find(i: number): number {
        let root = i;
        while (this.parent[root] !== root) {
          root = this.parent[root];
        }
        let curr = i;
        while (curr !== root) {
          const nxt = this.parent[curr];
          this.parent[curr] = root;
          curr = nxt;
        }
        return root;
      }
      union(i: number, j: number) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
          this.parent[rootI] = rootJ;
        }
      }
    }

    const dsu = new DSU(leads.length);
    const phoneMap = new Map<string, number>();
    const tgMap = new Map<string, number>();
    const uuidMap = new Map<string, number>();
    const visitorMap = new Map<string, number>();

    // Prepare normalized data for fast index connection
    const normalizedData = leads.map((l, index) => {
      const phone = normalizePhone(l.phone || l["Телефон"]);
      const tg = normalizeTg(l.telegram || l["Telegram"] || l["Телеграм"]);
      const cleanUUID = (l.UUID || '').toString().trim();
      const cleanVisitor = (l.visitorId || l["Visitor ID"] || '').toString().trim();

      const isValidPhone = phone.length >= 7;
      const isValidTg = tg && 
                        tg.length > 2 && 
                        tg !== 'direct' && 
                        tg !== 'none' && 
                        tg !== 'null' && 
                        tg !== 'undefined';
      const isValidVisitor = cleanVisitor.length > 5 && 
                             !cleanVisitor.toLowerCase().includes('null') && 
                             !cleanVisitor.toLowerCase().includes('undefined');

      return {
        phone,
        tg,
        cleanUUID,
        cleanVisitor,
        isValidPhone,
        isValidTg,
        isValidVisitor
      };
    });

    // Connect matching indices in DSU
    leads.forEach((l, i) => {
      const data = normalizedData[i];

      if (data.cleanUUID) {
        if (uuidMap.has(data.cleanUUID)) {
          dsu.union(i, uuidMap.get(data.cleanUUID)!);
        } else {
          uuidMap.set(data.cleanUUID, i);
        }
      }
      if (data.isValidPhone) {
        if (phoneMap.has(data.phone)) {
          dsu.union(i, phoneMap.get(data.phone)!);
        } else {
          phoneMap.set(data.phone, i);
        }
      }
      if (data.isValidTg) {
        if (tgMap.has(data.tg)) {
          dsu.union(i, tgMap.get(data.tg)!);
        } else {
          tgMap.set(data.tg, i);
        }
      }
      if (data.isValidVisitor) {
        if (visitorMap.has(data.cleanVisitor)) {
          dsu.union(i, visitorMap.get(data.cleanVisitor)!);
        } else {
          visitorMap.set(data.cleanVisitor, i);
        }
      }
    });

    // Group indices by root component
    const groups = new Map<number, number[]>();
    for (let i = 0; i < leads.length; i++) {
      const root = dsu.find(i);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root)!.push(i);
    }

    // Enhance individual raw leads first for property calculation
    const rawEnhanced = leads.map((l, i) => {
      const sData = getStatusData(l);
      const leadDate = parseSheetDate(l.date || l["Дата та час"] || l["Дата"]);
      const data = normalizedData[i];

      return {
        ...l,
        _computedStatus: sData.status,
        _computedWeight: sData.weight,
        _revenueUAH: sData.revenueUAH,
        _revenueUSD: sData.revenueUSD,
        _bookingUAH: sData.bookingUAH || 0,
        _tariff: sData.tariff,
        _niche: sData.niche,
        _leadDate: leadDate,
        _cleanPhone: data.phone,
        _cleanTg: data.tg,
        _cleanUUID: data.cleanUUID,
        _cleanVisitor: data.cleanVisitor
      };
    });

    const map = new Map<string, any>();

    // Merge each transitive component cluster
    groups.forEach((indices, rootIndex) => {
      const clusterItems = indices.map(idx => rawEnhanced[idx]);

      // State Selection: sort to select the primary record
      // Prefer highest weight (e.g. Paid/Tripwire over unpaid), then most recent date
      const sortedCluster = [...clusterItems].sort((a, b) => {
        if (b._computedWeight !== a._computedWeight) {
          return b._computedWeight - a._computedWeight;
        }
        return b._leadDate - a._leadDate;
      });

      const primary = sortedCluster[0];

      // Deduplication indicators
      const isDuplicate = clusterItems.length > 1;
      const tags = isDuplicate ? ['Повтор'] : [];

      const allSheets = [...new Set(clusterItems.map(item => getSheetName(item._sheet)))];
      const allVisitorIds = [...new Set(clusterItems.map(item => item._cleanVisitor).filter(Boolean))];
      const allUUIDs = [...new Set(clusterItems.map(item => item._cleanUUID).filter(Boolean))];

      const uniquePhones = [...new Set(clusterItems.map(item => item._cleanPhone).filter(Boolean))];
      const uniqueTgs = [...new Set(clusterItems.map(item => item._cleanTg).filter(Boolean))];

      const mergedPhone = uniquePhones.join(', ');
      const mergedTg = uniqueTgs.join(', ');

      const comment = clusterItems.map(item => item.comment || item["Коментар"]).filter(Boolean).join(' | ');

      // Sum revenues strictly from paid (successful) records in the cluster (weight >= 4)
      let revenueUAH = 0;
      let revenueUSD = 0;
      let bookingUAH = 0;

      clusterItems.forEach(item => {
        if (item._computedWeight >= 4) {
          revenueUAH += item._revenueUAH || 0;
          revenueUSD += item._revenueUSD || 0;
          bookingUAH += item._bookingUAH || 0;
        }
      });

      // Selection identifier: prioritize stable clean UUID
      let identifier = '';
      if (primary._cleanUUID) {
        identifier = primary._cleanUUID;
      } else if (primary._cleanPhone) {
        identifier = `phone-${primary._cleanPhone}`;
      } else if (primary._cleanTg) {
        identifier = `tg-${primary._cleanTg}`;
      } else if (primary._cleanVisitor) {
        identifier = `visitor-${primary._cleanVisitor}`;
      } else {
        identifier = `cluster-${rootIndex}`;
      }

      // Max latest action across cluster
      const latestAction = Math.max(...clusterItems.map(item => item._leadDate));

      const mergedLead = {
        ...primary,
        _selectionId: identifier,
        _isDuplicate: isDuplicate,
        _tags: tags,
        _allSheets: allSheets,
        _latestAction: latestAction,
        _allVisitorIds: allVisitorIds,
        _allUUIDs: allUUIDs,
        phone: mergedPhone || primary.phone || primary["Телефон"],
        telegram: mergedTg || primary.telegram || primary["Telegram"],
        comment: comment,
        _revenueUAH: revenueUAH,
        _revenueUSD: revenueUSD,
        _bookingUAH: bookingUAH
      };

      map.set(identifier, mergedLead);
    });

    // Populate global comments
    globalUsers.forEach(u => {
      if (u.UUID && u.Comment && map.has(u.UUID)) {
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

    // Final tag assignment based on sheet types
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
      acc.bookings += lead._bookingUAH || 0;
      return acc;
    }, { uah: 0, usd: 0, bookings: 0 });
  }, [processedLeads]);

  const allNiches = useMemo(() => {
    return [...new Set(processedLeads.map(l => l._niche).filter(Boolean))];
  }, [processedLeads]);

  const allSources = useMemo(() => {
    return [...new Set(processedLeads.flatMap(l => l._allSheets))];
  }, [processedLeads]);

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
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
    <div className="min-h-screen bg-[#09090B] text-white p-0 font-sans selection:bg-[#C4A47C]/30">
      {/* Header & Controls */}
      <div className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8 animate-fade-in">
        <div>
          <div className="inline-block border-l-2 border-[#C4A47C] pl-4 mb-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-headline">
              {onlyView === 'analytics' ? 'Аналітика' : (isSales ? 'Base of Leads' : 'Admin Portal')}
            </h1>
          </div>
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold">Victoria MC CRM</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-end gap-3">
          {onlyView !== 'analytics' && (
            <>
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
            </>
          )}

          {onlyView === 'analytics' && (
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-white/80 hover:text-white transition-all rounded-xl px-5 h-[46px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95"
            >
              <Loader2 size={14} className={loading ? 'animate-spin text-[#C4A47C]' : ''} />
              Оновити дані
            </button>
          )}
        </div>
      </div>

      {/* Premium Stats Grid */}
      {onlyView !== 'analytics' && (
        <div id="admin-metrics-grid" className={`grid grid-cols-1 ${isSales ? 'max-w-md' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mb-12`}>
          <StatCard 
            icon={<Users className="text-[#C4A47C]" />}
            label="Унікальних лідів"
            value={processedLeads.length}
            sub={`Всього ${leads.length} записів`}
          />
          {!isSales && (
            <>
              <StatCard 
                icon={<CreditCard className="text-[#3B82F6]" />}
                label="Бронювання (UAH)"
                value={`${revenueStats.bookings.toLocaleString()} ₴`}
                sub="Тільки передоплати / броні"
              />
              <StatCard 
                icon={<DollarSign className="text-emerald-400" />}
                label="Дохід у валюті (USD)"
                value={`$${revenueStats.usd.toLocaleString()}`}
                sub="Тільки валютні надходження (без UAH)"
              />
            </>
          )}
        </div>
      )}

      {/* View Switcher / Tabs */}
      {onlyView === 'leads' ? (
        <div id="admin-view-switcher" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-[#111] p-1 rounded-2xl w-fit border border-white/5">
            <button onClick={() => setActiveTab('kanban')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'kanban' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <LayoutGrid size={14} /> Канбан
            </button>
            <button onClick={() => setActiveTab('table')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'table' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <List size={14} /> Таблиця
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsPaymentLinkOpen(true)} className="bg-gradient-to-r from-[#C4A47C] to-[#E5C9A3] hover:from-[#B0936C] hover:to-[#C4A47C] text-black transition-all duration-300 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C4A47C]/10 active:scale-95">
              <CreditCard size={14} /> Створити посилання
            </button>
            <button onClick={fetchData} disabled={loading} className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-white/80 hover:text-white transition-all rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95">
              <Loader2 size={14} className={loading ? 'animate-spin text-[#C4A47C]' : ''} />
              Оновити дані
            </button>
          </div>
        </div>
      ) : onlyView !== 'analytics' ? (
        <div id="admin-view-switcher" className="flex items-center gap-2 mb-8 bg-[#111] p-1 rounded-2xl w-fit border border-white/5">
          <button onClick={() => setActiveTab('kanban')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'kanban' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <LayoutGrid size={14} /> Канбан
          </button>
          <button onClick={() => setActiveTab('table')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'table' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <List size={14} /> Таблиця
          </button>
          {!shouldHideAnalytics && (
            <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-[#C4A47C] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <BarChart3 size={14} /> Аналітика
            </button>
          )}
        </div>
      ) : null}

      {activeTab === 'analytics' && !shouldHideAnalytics && (
        <AnalyticsDashboard leads={processedLeads} traffic={traffic} globalActions={globalActions} />
      )}

      {activeTab === 'kanban' && (
        <KanbanBoard leads={finalLeads} globalUsers={globalUsers} updateLeadStatus={updateLeadKanbanStatus} onLeadClick={setSelectedVisitorId} />
      )}

      {activeTab === 'table' && (
        <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="font-black uppercase tracking-widest text-[10px] text-white/30">Client Database</h2>
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

      <OnboardingTour activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as any)} />
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
