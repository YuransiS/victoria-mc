'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  extractCookies,
  extractMarketingAttribution,
  MarketingAttribution,
  getVisitorUUID,
  getBwCid,
  setCookie,
  ATTRIBUTION_STORAGE_KEY,
  VISITOR_UUID_KEY,
  BW_CID_KEY
} from '@/lib/enrichment';

export interface UtmTags {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  fbclid?: string;
  gclid?: string;
  fbp?: string;
  fbc?: string;
  visitor_uuid?: string;
  bw_cid?: string;
}

export interface AnalyticsData {
  visitorId: string;
  firstUtms: UtmTags;
  lastUtms: UtmTags;
  journey: string[];
}

const AnalyticsInner = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Visitor ID & bw_cid (UUID v4 and canonical cid)
    const visitorUuid = getVisitorUUID();
    const bwCid = getBwCid(visitorUuid);

    // 2. Extract full marketing attribution (UTM + Ads + Cookies + Clicks)
    const attribution = extractMarketingAttribution(
      searchParams,
      typeof document !== 'undefined' ? document.cookie : '',
      pathname,
      typeof window !== 'undefined' ? window.location.href : ''
    );
    attribution.visitor_uuid = visitorUuid;
    attribution.bw_cid = bwCid;

    const offerParam = searchParams.get('offer');
    const vParam = searchParams.get('v');
    const checkOffer = (val: string | null) => {
      if (!val) return null;
      const clean = val.toLowerCase().trim();
      if (clean.includes("3") || clean === "v3" || clean === "offer3") return "offer3";
      if (clean.includes("2") || clean === "v2" || clean === "offer2") return "offer2";
      if (clean.includes("1") || clean === "v1" || clean === "offer1") return "offer1";
      return null;
    };
    const detectedOffer = checkOffer(offerParam) || checkOffer(vParam);
    if (detectedOffer) {
      const currentContent = attribution.utm_content || '';
      if (!currentContent) {
        attribution.utm_content = detectedOffer;
      } else if (!currentContent.includes(detectedOffer)) {
        attribution.utm_content = `${currentContent}_${detectedOffer}`;
      }
    }

    const hasAnyAttribution = !!(
      attribution.utm_source ||
      attribution.utm_medium ||
      attribution.utm_campaign ||
      attribution.utm_content ||
      attribution.utm_term ||
      attribution.campaign_id ||
      attribution.adset_id ||
      attribution.ad_id ||
      attribution.fbclid ||
      attribution.gclid
    );

    // Dual-Storage: localStorage + 30-day Cookie (SameSite=Lax)
    const attrJson = JSON.stringify(attribution);
    if (hasAnyAttribution) {
      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, attrJson);
      localStorage.setItem('last_utms', attrJson);
      localStorage.setItem('last_marketing_attribution', attrJson);
      setCookie(ATTRIBUTION_STORAGE_KEY, attrJson, 30);
      
      if (!localStorage.getItem('first_utms')) {
        localStorage.setItem('first_utms', attrJson);
        localStorage.setItem('first_marketing_attribution', attrJson);
      }
    }

    // 3. Journey navigation log
    const journeyRaw = localStorage.getItem('journey');
    let journey: { path: string; timestamp: string }[] = journeyRaw ? JSON.parse(journeyRaw) : [];
    
    // Limit journey size to avoid localStorage bloat (keep last 50 steps)
    if (journey.length > 50) {
      journey = journey.slice(-50);
    }

    journey.push({
      path: pathname,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('journey', JSON.stringify(journey));

    // 4. User Identity for Cross-Page Tracking
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');
    const uuid = localStorage.getItem('lead_uuid');

    // 4.5 SendPulse Contact ID
    const spContactIdParam = searchParams.get('sp_contact_id');
    if (spContactIdParam) {
      localStorage.setItem('sp_contact_id', spContactIdParam);
    }
    const spContactId = localStorage.getItem('sp_contact_id') || undefined;

    // Load active attribution fallback from dual storage
    let finalAttribution = attribution;
    if (!hasAnyAttribution) {
      try {
        const stored =
          localStorage.getItem(ATTRIBUTION_STORAGE_KEY) ||
          localStorage.getItem('last_marketing_attribution') ||
          localStorage.getItem('last_utms');
        if (stored) {
          finalAttribution = { ...JSON.parse(stored), visitor_uuid: visitorUuid, bw_cid: bwCid, page_path: pathname, page_url: window.location.href };
        }
      } catch (_) {}
    }

    // 5. Log to Backend Telemetry (Enrichment Protocol v2.0 - Cold Session)
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_uuid: visitorUuid,
        visitorId: visitorUuid,
        bw_cid: bwCid,
        is_cold: true,
        uuid,
        path: pathname,
        fullUrl: typeof window !== 'undefined' ? window.location.href : '',
        name: savedName,
        phone: savedPhone,
        social: savedSocial,
        sp_contact_id: spContactId,
        status: 'Клик',
        amount: 0.00,
        currency: 'UAH',
        product_type: 'lead',
        marketing: finalAttribution,
        utms: finalAttribution
      })
    }).catch(() => {});
  }, [searchParams, pathname]);

  return null;
};

export const Analytics = () => {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
};
