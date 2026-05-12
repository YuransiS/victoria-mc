'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

export interface UtmTags {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
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

    // 2. UTM Tags
    const utms: UtmTags = {};
    const utmKeys: (keyof UtmTags)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    let hasUtms = false;
    utmKeys.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        utms[key] = value;
        hasUtms = true;
      }
    });

    if (hasUtms) {
      localStorage.setItem('last_utms', JSON.stringify(utms));
      
      if (!localStorage.getItem('first_utms')) {
        localStorage.setItem('first_utms', JSON.stringify(utms));
      }
    }

    // 3. Journey
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

    // 4. Log to Backend (Anonymous & Real-time)
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        path: pathname,
        utms: hasUtms ? utms : JSON.parse(localStorage.getItem('last_utms') || '{}')
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
