import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_slug, api_key, lead, marketing, metadata } = body;

    // 1. Валидация базовых полей запроса
    if (!project_slug || !api_key || !lead) {
      return NextResponse.json(
        { error: 'Missing required parameters: project_slug, api_key, and lead are mandatory.' },
        { status: 400 }
      );
    }

    // 2. Аутентификация проекта в реестре
    const { data: project, error: authError } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .eq('slug', project_slug)
      .eq('api_key_hash', api_key)
      .maybeSingle();

    if (authError || !project) {
      return NextResponse.json(
        { error: 'Authentication failed. Invalid project_slug or api_key.' },
        { status: 401 }
      );
    }

    const projectId = project.id;

    const customCreatedAt = lead?.created_at || metadata?.created_at || null;
    const createdAtIso = customCreatedAt ? new Date(customCreatedAt).toISOString() : new Date().toISOString();

    // 3. Выделение и нормализация контактных данных лида
    const name = lead.name || null;
    let phone = lead.phone ? String(lead.phone).trim() : null;
    let email = lead.email ? String(lead.email).trim().toLowerCase() : null;
    let telegram = lead.telegram ? String(lead.telegram).trim() : null;

    phone = phone ? phone.replace(/\s+/g, '') : null;
    email = email || null;
    telegram = telegram || null;

    if (!phone && !email && !telegram) {
      return NextResponse.json(
        { error: 'At least one contact identifier (phone, email, or telegram) must be provided.' },
        { status: 400 }
      );
    }

    // 4. Поиск существующего профиля клиента строго внутри этого проекта
    let customerId: string | null = null;
    
    // Формируем условия поиска
    let searchFilter = `project_id.eq.${projectId}`;
    const orConditions: string[] = [];
    if (phone) orConditions.push(`phone.eq.${phone}`);
    if (email) orConditions.push(`email.eq.${email}`);
    if (telegram) orConditions.push(`telegram.ilike.${telegram}`);

    if (orConditions.length > 0) {
      const { data: existingCustomer, error: searchError } = await supabaseAdmin
        .from('unified_customers')
        .select('id')
        .eq('project_id', projectId)
        .or(orConditions.join(','))
        .limit(1)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching customer:', searchError);
      } else if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    // 5. Создание или обновление профиля клиента
    if (!customerId) {
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('unified_customers')
        .insert({
          project_id: projectId,
          name,
          phone,
          email,
          telegram,
          created_at: createdAtIso,
          updated_at: createdAtIso
        })
        .select('id')
        .single();

      if (createError) {
        throw new Error(`Failed to create unified customer: ${createError.message}`);
      }
      customerId = newCustomer.id;
    } else {
      // Обновляем профиль при поступлении более свежих данных
      const { error: updateError } = await supabaseAdmin
        .from('unified_customers')
        .update({
          name: name || undefined,
          phone: phone || undefined,
          email: email || undefined,
          telegram: telegram || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (updateError) {
        console.error('Warning: Failed to update customer profile:', updateError);
      }
    }

    // 6. Подготовка маркетинговых полей
    const m = marketing || {};
    const utm_source = m.utm_source || null;
    const utm_medium = m.utm_medium || null;
    const utm_campaign = m.utm_campaign || null;
    const utm_content = m.utm_content || null;
    const utm_term = m.utm_term || null;
    const campaign_id = m.campaign_id || null;
    const adset_id = m.adset_id || null;
    const ad_id = m.ad_id || null;
    const fbclid = m.fbclid || null;
    const gclid = m.gclid || null;
    const fbp = m.fbp || null;
    const fbc = m.fbc || null;
    const ip_address = m.ip_address || null;
    const user_agent = m.user_agent || null;
    const page_path = m.page_path || null;
    const page_url = m.page_url || null;
    const visitor_uuid = m.visitor_uuid || null;

    // 7. Создание нового лид-события/заказа (всегда новая строка!)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('unified_orders')
      .insert({
        customer_id: customerId,
        project_id: projectId,
        amount: lead.amount || 0.00,
        status: lead.status || 'new',
        order_id: lead.order_id || null,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        campaign_id,
        adset_id,
        ad_id,
        fbclid,
        gclid,
        fbp,
        fbc,
        ip_address,
        user_agent,
        page_path,
        page_url,
        visitor_uuid,
        metadata: metadata || {},
        created_at: createdAtIso
      })
      .select('id')
      .single();

    if (orderError) {
      throw new Error(`Failed to log order: ${orderError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Lead registered successfully.',
      customer_id: customerId,
      order_id: order.id
    });

  } catch (error: any) {
    console.error('API Gateway Lead Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
