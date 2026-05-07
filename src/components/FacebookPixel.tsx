"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

const FB_PIXEL_IDS = ["1230047148487254", "1497146881743265"];

export const FacebookPixel = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      FB_PIXEL_IDS.forEach(id => {
        (window as any).fbq("track", "PageView", {}, { pixelId: id });
      });
    }
  }, []);

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

export const trackFBEvent = (eventName: string, params?: any) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    const standardEvents = ["AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration", "Contact", "CustomizeProduct", "Donate", "FindLocation", "InitiateCheckout", "Lead", "Purchase", "Schedule", "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent"];
    const isStandard = standardEvents.includes(eventName);
    
    FB_PIXEL_IDS.forEach(id => {
      if (isStandard) {
        (window as any).fbq("track", eventName, params, { pixelId: id });
      } else {
        (window as any).fbq("trackCustom", eventName, params, { pixelId: id });
      }
    });
  }
};
