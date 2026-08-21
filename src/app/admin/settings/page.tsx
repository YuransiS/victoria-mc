import { cookies } from 'next/headers';
import { verifyToken } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { Settings, User, Shield, Key, Bell, Database, Check } from 'lucide-react';
import DeveloperResetButton from '@/components/admin/DeveloperResetButton';
import ThemeSettingsSection from '@/components/admin/ThemeSettingsSection';

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  if (decoded.role === 'SALES') {
    redirect('/admin/leads');
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text p-0 font-sans selection:bg-[#C4A47C]/30 animate-fade-in transition-colors duration-300">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block border-l-2 border-[#C4A47C] pl-4 mb-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-admin-text font-headline">
            Налаштування
          </h1>
        </div>
        <p className="text-admin-text-dim text-xs uppercase tracking-[0.3em] font-bold">Victoria MC Settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details */}
        <div className="bg-admin-surface border border-admin-border p-8 rounded-3xl space-y-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-[#C4A47C] w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-admin-text-muted">Обліковий запис</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-admin-input-bg border border-admin-border rounded-2xl transition-colors duration-300">
              <span className="text-admin-text-dim text-[8px] uppercase font-bold tracking-wider block mb-1">Користувач</span>
              <span className="text-sm font-bold text-admin-text">{decoded.username}</span>
            </div>
            
            <div className="p-4 bg-admin-input-bg border border-admin-border rounded-2xl transition-colors duration-300">
              <span className="text-admin-text-dim text-[8px] uppercase font-bold tracking-wider block mb-1">Роль</span>
              <span className="text-sm font-bold text-[#C4A47C] uppercase tracking-wider">{decoded.role}</span>
            </div>

            <div className="p-4 bg-admin-input-bg border border-admin-border rounded-2xl transition-colors duration-300">
              <span className="text-admin-text-dim text-[8px] uppercase font-bold tracking-wider block mb-1">Рівень доступу</span>
              <span className="text-xs font-semibold text-emerald-400">
                {decoded.role === 'DEVELOPER' || decoded.role === 'OP' 
                  ? 'Повний адміністративний доступ' 
                  : 'Обмежений доступ (тільки ліди)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Theme Settings Widget */}
          <ThemeSettingsSection />

          {/* Security Config */}
          <div className="bg-admin-surface border border-admin-border p-8 rounded-3xl space-y-6 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <Shield className="text-[#C4A47C] w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-admin-text-muted">Безпека та Авторизація</h2>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-admin-input-bg border border-admin-border rounded-2xl transition-colors duration-300">
                <div>
                  <h3 className="text-xs font-bold text-admin-text mb-0.5">Двофакторна автентифікація (2FA)</h3>
                  <p className="text-[10px] text-admin-text-dim">Додатковий захист вашого облікового запису</p>
                </div>
                <div className="w-10 h-6 bg-admin-active-bg border border-admin-border rounded-full p-0.5 cursor-pointer flex items-center justify-start transition-all">
                  <div className="w-4.5 h-4.5 bg-admin-text-dim rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-admin-input-bg border border-admin-border rounded-2xl transition-colors duration-300">
                <div>
                  <h3 className="text-xs font-bold text-admin-text mb-0.5">Логування дій користувачів</h3>
                  <p className="text-[10px] text-admin-text-dim">Зберігати повну історію зміни статусів та коментарів</p>
                </div>
                <div className="w-10 h-6 bg-[#C4A47C]/20 border border-[#C4A47C]/40 rounded-full p-0.5 cursor-pointer flex items-center justify-end transition-all">
                  <div className="w-4.5 h-4.5 bg-[#C4A47C] rounded-full" />
                </div>
              </div>

              {decoded.role === 'DEVELOPER' && (
                <div className="flex items-center justify-between p-4 bg-admin-input-bg border border-admin-border rounded-2xl border-dashed border-[#C4A47C]/20 transition-colors duration-300">
                  <div>
                    <h3 className="text-xs font-bold text-admin-text mb-0.5">Інтерактивні підказки</h3>
                    <p className="text-[10px] text-admin-text-dim">Скинути проходження туру та запустити його заново для тестування</p>
                  </div>
                  <DeveloperResetButton />
                </div>
              )}
            </div>
          </div>

          {/* Integrations config */}
          <div className="bg-admin-surface border border-admin-border p-8 rounded-3xl space-y-6 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <Database className="text-[#C4A47C] w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-admin-text-muted">Інтеграції та Бази даних</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-admin-input-bg border border-admin-border rounded-2xl flex flex-col justify-between h-36 transition-colors duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">Google Sheets API</span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Активно</span>
                  </div>
                  <p className="text-[10px] text-admin-text-dim leading-relaxed">Синхронізація лідів, статусів та трипваєрів в реальному часі.</p>
                </div>
                <div className="text-[9px] text-[#C4A47C] font-semibold tracking-wider uppercase cursor-pointer hover:underline flex items-center gap-1">
                  Тест з'єднання →
                </div>
              </div>

              <div className="p-5 bg-admin-input-bg border border-admin-border rounded-2xl flex flex-col justify-between h-36 transition-colors duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">WayForPay Merchant</span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Активно</span>
                  </div>
                  <p className="text-[10px] text-admin-text-dim leading-relaxed">Генерація посилань на оплату та автоматичний трекінг статусів транзакцій.</p>
                </div>
                <div className="text-[9px] text-[#C4A47C] font-semibold tracking-wider uppercase cursor-pointer hover:underline flex items-center gap-1">
                  Налаштувати Merchant ID →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
