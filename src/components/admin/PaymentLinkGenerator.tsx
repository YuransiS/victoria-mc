'use client';

import React, { useState } from 'react';
import { CreditCard, Link as LinkIcon, Loader2, Copy, Check, Plus, X } from 'lucide-react';

const PREDEFINED_PACKAGES = [
  { name: 'Бронь місця на курс', amount: 2000, currency: 'UAH' },
  { name: 'Курс: Самостійний', amount: 390, currency: 'USD' },
  { name: 'Курс: Груповий', amount: 490, currency: 'USD' },
  { name: 'Курс: Індивідуальний', amount: 1490, currency: 'USD' },
];

export default function PaymentLinkGenerator({ isOpen, onClose, selectedLead }: any) {
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('Оплата послуг');
  const [customAmount, setCustomAmount] = useState('');
  const [customCurrency, setCustomCurrency] = useState('UAH');

  React.useEffect(() => {
    if (isOpen) {
      setInvoiceUrl('');
      setCopied(false);
      setIsCustom(false);
      setCustomAmount('');
      setCustomName('Оплата послуг');
      setCustomCurrency('UAH');
    }
  }, [isOpen, selectedLead]);

  if (!isOpen) return null;

  const generateLink = async (name: string, amount: number, currency: string = 'UAH') => {
    setLoading(true);
    setInvoiceUrl('');
    try {
      const res = await fetch('/api/admin/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tariffName: name,
          amount: amount,
          currency: currency,
          customerName: selectedLead?.name || selectedLead?.["Ім'я"] || '',
          customerPhone: selectedLead?.phone || selectedLead?.["Телефон"] || '',
          uuid: selectedLead?.uuid || '',
        })
      });
      const data = await res.json();
      if (data.url) {
        setInvoiceUrl(data.url);
      } else {
        alert('Помилка: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Помилка генерації посилання');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#C4A47C]/10 flex items-center justify-center text-[#C4A47C]">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white/90">Генератор Оплат</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">WayForPay Інвойси</p>
          </div>
        </div>

        {!invoiceUrl ? (
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Predefined */}
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-3">Швидкі посилання</h3>
              <div className="grid grid-cols-1 gap-2">
                {PREDEFINED_PACKAGES.map((pkg, i) => (
                  <button
                    key={i}
                    onClick={() => generateLink(pkg.name, pkg.amount, pkg.currency)}
                    disabled={loading}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-[#C4A47C]/30 transition-all text-left disabled:opacity-50"
                  >
                    <span className="text-xs font-bold text-white/80">{pkg.name}</span>
                    <span className="text-xs font-black text-[#C4A47C]">{pkg.amount} {pkg.currency === 'USD' ? '$' : '₴'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink-0 mx-4 text-white/20 text-[10px] uppercase font-bold tracking-widest">АБО</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Custom */}
            <div>
              <button 
                onClick={() => setIsCustom(!isCustom)}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/50 hover:text-[#C4A47C] transition-colors mb-4"
              >
                <Plus size={12} /> Власна сума
              </button>

              {isCustom && (
                <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Назва платежу</label>
                    <input 
                      type="text" 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C4A47C]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Сума</label>
                      <input 
                        type="number" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="500"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C4A47C]"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Валюта</label>
                      <select 
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C4A47C] appearance-none"
                      >
                        <option value="UAH">UAH (₴)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        if(!customAmount || isNaN(Number(customAmount))) return alert("Введіть коректну суму");
                        generateLink(customName, Number(customAmount), customCurrency);
                    }}
                    disabled={loading || !customAmount}
                    className="w-full mt-2 bg-[#C4A47C] text-black text-[10px] font-bold uppercase tracking-widest rounded-lg py-3 hover:bg-[#D4B48C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Згенерувати'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">Посилання Готове!</h3>
            <p className="text-xs text-white/40 mb-8 max-w-[80%]">Відправте це посилання клієнту. При переході він потрапить на безпечну сторінку оплаты WayForPay.</p>
            
            <div className="w-full relative group">
              <input 
                type="text" 
                readOnly 
                value={invoiceUrl} 
                className="w-full bg-white/[0.02] border border-[#C4A47C]/50 rounded-xl py-4 pl-4 pr-12 text-xs text-white/80 focus:outline-none selection:bg-[#C4A47C]/30"
              />
              <button 
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-[#C4A47C]" />}
              </button>
            </div>
            
            <button 
              onClick={() => {
                  setInvoiceUrl('');
                  setCopied(false);
              }}
              className="mt-8 text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-white transition-colors"
            >
              Створити ще одне
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
