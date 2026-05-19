import { cookies } from 'next/headers';
import { verifyToken } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { Settings, User, Shield, Key, Bell, Database, Check } from 'lucide-react';
import DeveloperResetButton from '@/components/admin/DeveloperResetButton';

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
    <div className="min-h-screen bg-[#09090B] text-white p-0 font-sans selection:bg-[#C4A47C]/30 animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block border-l-2 border-[#C4A47C] pl-4 mb-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-headline">
            Налаштування
          </h1>
        </div>
        <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold">Victoria MC CRM Settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details */}
        <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-[#C4A47C] w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/85">Обліковий запис</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-1">Користувач</span>
              <span className="text-sm font-bold text-white/90">{decoded.username}</span>
            </div>
            
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-1">Роль</span>
              <span className="text-sm font-bold text-[#C4A47C] uppercase tracking-wider">{decoded.role}</span>
            </div>

            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <span className="text-white/30 text-[8px] uppercase font-bold tracking-wider block mb-1">Рівень доступу</span>
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
          {/* Security Config */}
          <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="text-[#C4A47C] w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/85">Безпека та Авторизація</h2>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <div>
                  <h3 className="text-xs font-bold text-white/95 mb-0.5">Двофакторна автентифікація (2FA)</h3>
                  <p className="text-[10px] text-white/40">Додатковий захист вашого облікового запису</p>
                </div>
                <div className="w-10 h-6 bg-white/5 border border-white/10 rounded-full p-0.5 cursor-pointer flex items-center justify-start transition-all">
                  <div className="w-4.5 h-4.5 bg-white/40 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <div>
                  <h3 className="text-xs font-bold text-white/95 mb-0.5">Логування дій користувачів</h3>
                  <p className="text-[10px] text-white/40">Зберігати повну історію зміни статусів та коментарів</p>
                </div>
                <div className="w-10 h-6 bg-[#C4A47C]/20 border border-[#C4A47C]/40 rounded-full p-0.5 cursor-pointer flex items-center justify-end transition-all">
                  <div className="w-4.5 h-4.5 bg-[#C4A47C] rounded-full" />
                </div>
              </div>

              {decoded.role === 'DEVELOPER' && (
                <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl border-dashed border-[#C4A47C]/20">
                  <div>
                    <h3 className="text-xs font-bold text-white/95 mb-0.5">Інтерактивні підказки</h3>
                    <p className="text-[10px] text-white/40">Скинути проходження туру та запустити його заново для тестування</p>
                  </div>
                  <DeveloperResetButton />
                </div>
              )}
            </div>
          </div>

          {/* Integrations config */}
          <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Database className="text-[#C4A47C] w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/85">Інтеграції та Бази даних</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between h-36">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Google Sheets API</span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Активно</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">Синхронізація лідів, статусів та трипваєрів в реальному часі.</p>
                </div>
                <div className="text-[9px] text-[#C4A47C] font-semibold tracking-wider uppercase cursor-pointer hover:underline flex items-center gap-1">
                  Тест з'єднання →
                </div>
              </div>

              <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between h-36">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">WayForPay Merchant</span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Активно</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">Генерація посилань на оплату та автоматичний трекінг статусів транзакцій.</p>
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
