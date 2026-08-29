"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const FB_PIXEL_IDS = ["1230047148487254"];

export const FacebookPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (typeof window !== "undefined" && (window as any).fbq) {
      FB_PIXEL_IDS.forEach(id => {
        (window as any).fbq("track", "PageView", {}, { pixelId: id });
      });
      console.log("[Meta Pixel] Tracked PageView on route change:", pathname);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${FB_PIXEL_IDS.map(id => `fbq('init', '${id}');`).join('\n')}
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {FB_PIXEL_IDS.map(id => (
          <img
            key={id}
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
          />
        ))}
      </noscript>
    </>
  );
};

export const trackFBEvent = (
  eventName: string,
  params?: any,
  options?: { eventID?: string; pixelId?: string } | string
) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    const standardEvents = [
      "AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
      "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout",
      "Lead", "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication",
      "Subscribe", "ViewContent"
    ];
    const isStandard = standardEvents.includes(eventName);
    const eventID = typeof options === "string" ? options : options?.eventID;

    FB_PIXEL_IDS.forEach(id => {
      const trackOptions: Record<string, any> = { pixelId: id };
      if (eventID) {
        trackOptions.eventID = eventID;
      }

      if (isStandard) {
        (window as any).fbq("track", eventName, params, trackOptions);
      } else {
        (window as any).fbq("trackCustom", eventName, params, trackOptions);
      }
    });
  }
};
