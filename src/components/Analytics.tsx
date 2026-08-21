'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { extractCookies, extractMarketingAttribution, MarketingAttribution } from '@/lib/enrichment';

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
    // 1. Visitor ID
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);
    }

    // 2. Extract full marketing attribution (UTM + Ads + Cookies + Clicks)
    const attribution = extractMarketingAttribution(
      searchParams,
      typeof document !== 'undefined' ? document.cookie : '',
      pathname,
      typeof window !== 'undefined' ? window.location.href : ''
    );

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

    if (hasAnyAttribution) {
      localStorage.setItem('last_utms', JSON.stringify(attribution));
      localStorage.setItem('last_marketing_attribution', JSON.stringify(attribution));
      
      if (!localStorage.getItem('first_utms')) {
        localStorage.setItem('first_utms', JSON.stringify(attribution));
        localStorage.setItem('first_marketing_attribution', JSON.stringify(attribution));
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

    // Load active attribution fallback
    let finalAttribution = attribution;
    if (!hasAnyAttribution) {
      try {
        const stored = localStorage.getItem('last_marketing_attribution') || localStorage.getItem('last_utms');
        if (stored) {
          finalAttribution = { ...JSON.parse(stored), page_path: pathname, page_url: window.location.href };
        }
      } catch (_) {}
    }

    // 5. Log to Backend Telemetry (Enrichment Protocol v2.0)
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
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
