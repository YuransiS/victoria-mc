import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    project_slug: 'victoria',
    project_name: 'Victoria',
    domain: 'https://victoria-mc.vercel.app',
    version: '1.0.0',
    ping_timestamp: new Date().toISOString(),
    pages_count: 7,
    pages: [
      { label: 'Майстер-клас', path: '/', type: 'free', url: 'https://victoria-mc.vercel.app/' },
      { label: 'VSL', path: '/free-lection', type: 'free', url: 'https://victoria-mc.vercel.app/free-lection' },
      { label: 'VSL-форма', path: '/free-lection/vsl-form', type: 'free', url: 'https://victoria-mc.vercel.app/free-lection/vsl-form' },
      { label: 'Розбір', path: '/rozbir', type: 'paid', url: 'https://victoria-mc.vercel.app/rozbir' },
      { label: 'Броні / Прайс', path: '/price', type: 'paid', url: 'https://victoria-mc.vercel.app/price' },
      { label: 'Практикум', path: '/practicum', type: 'paid', url: 'https://victoria-mc.vercel.app/practicum', parameters: [{ key: 'o', description: 'Оффер' }, { key: 'p', description: 'Промо' }] },
      { label: 'Анкета', path: '/anketa', type: 'quiz', url: 'https://victoria-mc.vercel.app/anketa' }
    ]
  });
}
