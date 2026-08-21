'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { getClientMarketingAttribution, normalizePhone, normalizeCurrency, normalizeAmount, resolveProductType } from '@/lib/enrichment';

export default function CheckoutClient({ payload }: { payload: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'declined' | 'approved'>('idle');
  const router = useRouter();

  useEffect(() => {
    // Optional: Send an analytics event that the user opened the checkout page
    console.log('Checkout page opened for:', payload.n, payload.t);
  }, [payload]);

  const handlePay = async () => {
    setIsLoading(true);
    setStatus('idle');
    try {
      const marketingAttr = getClientMarketingAttribution({
        page_path: '/checkout',
        page_url: window.location.href
      });
      const finalCurrency = normalizeCurrency(payload.c);
      const floatAmount = normalizeAmount(payload.a);
      const normalizedPhoneVal = normalizePhone(payload.p);
      const prodType = resolveProductType({ tariffName: payload.t, amount: floatAmount, pagePath: '/checkout' });

      // 1. Get fresh signature and orderReference from our API
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: floatAmount,
          currency: finalCurrency,
          product_type: prodType,
          tariffName: payload.t,
          customerName: payload.n,
          customerPhone: normalizedPhoneVal || payload.p,
          ...marketingAttr,
          marketing: marketingAttr,
          visitor_id: marketingAttr.visitor_uuid || localStorage.getItem('visitor_id') || '',
          // If they redirect, go to /price/thanks or /price/fail
          successUrl: `${window.location.origin}/price/thanks`,
          failUrl: `${window.location.origin}/checkout/fail` // Custom fail page or back here
        }),
      });

      const paymentData = await res.json();
      console.log('DEBUG: Payment Data from Server:', paymentData);
      
      // Save TG Message ID to local storage with timestamp for later use
      if (paymentData.tgMsgId) {
        console.log('DEBUG: Storing TG Msg ID:', paymentData.tgMsgId);
        const tgData = {
          id: paymentData.tgMsgId.toString(),
          timestamp: Date.now()
        };
        localStorage.setItem('tg_msg_id_data', JSON.stringify(tgData));
      } else {
        console.warn('DEBUG: No tgMsgId received from server!');
      }

      if (paymentData.error) {
        alert('Помилка створення платежу. Спробуйте пізніше.');
        setIsLoading(false);
        return;
      }

      // 2. Initialize WayForPay widget
      // @ts-ignore
      const wayforpay = new window.Wayforpay();
      
      wayforpay.run(
        paymentData,
        function (response: any) {
          // on approved
          console.log('Payment approved:', response);
          setStatus('approved');
          setIsLoading(false);
          router.push('/price/thanks');
        },
        function (response: any) {
          // on declined
          console.error('Payment declined:', response);
          setStatus('declined');
          setIsLoading(false);
        },
        function (response: any) {
          // on pending
          console.log('Payment pending:', response);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      {/* WayForPay Widget Script */}
      <Script src="https://secure.wayforpay.com/server/pay-widget.js" strategy="lazyOnload" />

      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150px] bg-red-600/20 blur-[100px] pointer-events-none" />
        
        <h1 className="text-white text-2xl font-bold mb-2 text-center relative z-10">Оформлення замовлення</h1>
        <p className="text-white/50 text-center mb-8 relative z-10">Перевірте деталі та перейдіть до оплати</p>

        <div className="w-full bg-black/40 rounded-xl p-4 mb-8 space-y-4 relative z-10 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-white/40 text-sm">Послуга</span>
            <span className="text-white text-right font-medium max-w-[200px]">{payload.t}</span>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-sm">Клієнт</span>
            <span className="text-white font-medium">{payload.n || 'Не вказано'}</span>
          </div>
          {payload.p && (
            <>
              <div className="w-full h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm">Телефон</span>
                <span className="text-white font-medium">{payload.p}</span>
              </div>
            </>
          )}
          <div className="w-full h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-sm">До сплати</span>
            <span className="text-red-500 font-bold text-xl">{payload.a} {payload.c}</span>
          </div>
        </div>

        {status === 'declined' && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center text-sm">
            Оплату відхилено банком або сталася помилка. Спробуйте іншу картку або повторіть спробу.
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : status === 'declined' ? (
            'СПРОБУВАТИ ЩЕ РАЗ'
          ) : (
            'ПЕРЕЙТИ ДО ОПЛАТИ'
          )}
        </button>

        {/* Small hidden debug hint for testing */}
        {typeof window !== 'undefined' && localStorage.getItem('tg_msg_id_data') && (
          <div className="mt-2 text-[8px] text-white/10 uppercase tracking-tighter">
            TG ID Stored
          </div>
        )}
        
        <div className="mt-6 flex items-center gap-2 justify-center opacity-50 relative z-10">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-white text-xs">Безпечний платіж WayForPay</span>
        </div>
      </div>
    </div>
  );
}
