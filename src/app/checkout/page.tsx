import { redirect } from 'next/navigation';
import crypto from 'crypto';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ p?: string, sig?: string }> }) {
  const { p, sig } = await searchParams;

  if (!p || !sig) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-2xl font-bold mb-4">Помилка посилання</h1>
        <p className="text-white/50 text-center max-w-md">Посилання недійсне або його термін дії минув. Зверніться до вашого менеджера.</p>
      </div>
    );
  }

  const secretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim() || 'default_secret';

  const expectedSig = crypto
    .createHmac('sha256', secretKey)
    .update(p)
    .digest('hex');

  if (sig !== expectedSig) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-2xl font-bold mb-4">Доступ заборонено</h1>
        <p className="text-white/50 text-center max-w-md">Підпис посилання не збігається. Можливо, посилання було змінено.</p>
      </div>
    );
  }

  let payload;
  try {
    const decoded = Buffer.from(p, 'base64').toString('utf8');
    payload = JSON.parse(decoded);
  } catch (err) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-2xl font-bold mb-4">Помилка даних</h1>
        <p className="text-white/50">Неможливо прочитати дані посилання.</p>
      </div>
    );
  }

  return (
    <CheckoutClient payload={payload} />
  );
}
