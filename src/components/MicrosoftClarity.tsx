"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    clarity?: {
      (command: string, ...args: any[]): void;
      q?: any[];
    };
  }
}

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "ych8q0vd04";

/**
 * Universal safe invoker for Microsoft Clarity commands.
 * Handles pre-load queuing if the remote Clarity bundle is still loading.
 */
export const callClarity = (command: string, ...args: any[]) => {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.clarity === "function") {
      window.clarity(command, ...args);
    } else {
      window.clarity =
        window.clarity ||
        function () {
          (window.clarity!.q = window.clarity!.q || []).push(arguments);
        };
      window.clarity(command, ...args);
    }
  } catch (err) {
    console.warn("[Clarity] Command execution failed:", command, err);
  }
};

/**
 * Track custom event in Microsoft Clarity (e.g. Lead, Purchase, InitiateCheckout).
 */
export const trackClarityEvent = (eventName: string) => {
  if (!eventName) return;
  callClarity("event", eventName);
};

/**
 * Set custom tag key-value filter in Microsoft Clarity.
 */
export const setClarityTag = (key: string, value: string | string[]) => {
  if (!key || value === undefined || value === null || value === "") return;
  callClarity("set", key, value);
};

/**
 * Identify a user with persistent IDs in Microsoft Clarity.
 * Stitches Clarity sessions with Supabase victoria_leads and CRM visitor_uuid.
 */
export const identifyClarityUser = (
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
) => {
  if (!customId) return;
  callClarity("identify", customId, customSessionId, customPageId, friendlyName);
};

export const MicrosoftClarity = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  // SPA navigation tracking: Trigger virtual pageview and tag on client-side route changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    trackClarityEvent("pageview");
    setClarityTag("page_path", pathname);
  }, [pathname, searchParams]);

  if (!CLARITY_PROJECT_ID) return null;

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  );
};
