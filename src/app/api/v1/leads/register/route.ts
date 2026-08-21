import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { statusMapper } from '@/lib/statusMapper';
import { 
  normalizePhone, 
  normalizeEmail, 
  normalizeTelegram, 
  normalizeCurrency, 
  normalizeAmount, 
  resolveProductType, 
  extractMarketingAttribution 
} from '@/lib/enrichment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_slug, api_key, lead, marketing, metadata } = body;

    const isValidUuid = (uuid: string) => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
    };

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

    // Intercept raw clicks ('Клик' or 'КликФормы') and insert directly into traffic_clicks
    const leadStatus = lead.status;
    if (leadStatus === 'Клик' || leadStatus === 'КликФормы') {
      const m = extractMarketingAttribution(marketing || body);
      const rawVisitorUuid = m.visitor_uuid || metadata?.visitor_uuid || lead?.visitor_uuid || null;
      const visitor_uuid = rawVisitorUuid && isValidUuid(rawVisitorUuid) ? rawVisitorUuid : null;

      const canonicalCurrency = normalizeCurrency(lead.currency || metadata?.currency);
      const floatAmount = normalizeAmount(lead.amount || 0);

      const { data: clickData, error: clickError } = await supabaseAdmin
        .from('traffic_clicks')
        .insert({
          project_id: projectId,
          visitor_uuid,
          status: leadStatus,
          utm_source: m.utm_source,
          utm_medium: m.utm_medium,
          utm_campaign: m.utm_campaign,
          utm_content: m.utm_content,
          utm_term: m.utm_term,
          page_path: m.page_path,
          page_url: m.page_url,
          metadata: {
            ...(metadata || {}),
            currency: canonicalCurrency,
            product_type: 'lead',
            amount: floatAmount
          },
          created_at: createdAtIso
        })
        .select('id')
        .single();

      if (clickError) {
        throw new Error(`Failed to insert traffic click: ${clickError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Click registered successfully.',
        customer_id: null,
        order_id: clickData.id
      });
    }

    // 3. Выделение и нормализация контактных данных лида (Enrichment Protocol v2.0)
    const name = lead.name ? String(lead.name).trim() : null;
    const phone = normalizePhone(lead.phone);
    const email = normalizeEmail(lead.email);
    const cleanTg = normalizeTelegram(lead.telegram);
    const telegram = cleanTg ? `@${cleanTg}` : null;

    if (!phone && !email && !telegram) {
      return NextResponse.json(
        { error: 'At least one contact identifier (phone, email, or telegram) must be provided.' },
        { status: 400 }
      );
    }

    // 4. Поиск существующего профиля клиента строго внутри этого проекта
    let customerId: string | null = null;
    
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

    // 6. Подготовка маркетинговых полей (Enrichment Protocol v2.0)
    const m = extractMarketingAttribution(marketing || body);
    const rawVisitorUuid = m.visitor_uuid || metadata?.visitor_uuid || lead?.visitor_uuid || null;
    const visitor_uuid = rawVisitorUuid && isValidUuid(rawVisitorUuid) ? rawVisitorUuid : null;

    // Currency, Amount, Product Type Normalization
    const canonicalCurrency = normalizeCurrency(lead.currency || metadata?.currency);
    const floatAmount = normalizeAmount(lead.amount);
    const canonicalStatus = statusMapper.normalize(lead.status);

    const resolvedProdType = resolveProductType({
      productType: lead.product_type || metadata?.product_type,
      tariffName: lead.product_name || metadata?.product_name,
      pagePath: m.page_path,
      amount: floatAmount
    });

    const meta = {
      ...(metadata || {}),
      currency: canonicalCurrency,
      product_type: resolvedProdType,
      product_name: lead.product_name || metadata?.product_name || 'Victoria Course/Lead',
      payment_system: metadata?.payment_system || 'wayforpay'
    };

    // 7. Создание или обновление лид-события/заказа
    let orderIdToReturn = null;
    let existingOrder = null;

    if (lead.order_id) {
      const { data: ord, error: selectErr } = await supabaseAdmin
        .from('unified_orders')
        .select('id')
        .eq('project_id', projectId)
        .eq('order_id', lead.order_id)
        .limit(1)
        .maybeSingle();

      if (!selectErr && ord) {
        existingOrder = ord;
      }
    }

    if (existingOrder) {
      // Update existing order status, amount, and metadata
      const { data: updatedOrder, error: orderError } = await supabaseAdmin
        .from('unified_orders')
        .update({
          amount: floatAmount,
          status: canonicalStatus,
          utm_source: m.utm_source || undefined,
          utm_medium: m.utm_medium || undefined,
          utm_campaign: m.utm_campaign || undefined,
          utm_content: m.utm_content || undefined,
          utm_term: m.utm_term || undefined,
          campaign_id: m.campaign_id || undefined,
          adset_id: m.adset_id || undefined,
          ad_id: m.ad_id || undefined,
          fbclid: m.fbclid || undefined,
          gclid: m.gclid || undefined,
          fbp: m.fbp || undefined,
          fbc: m.fbc || undefined,
          page_path: m.page_path || undefined,
          page_url: m.page_url || undefined,
          visitor_uuid: visitor_uuid || undefined,
          metadata: meta
        })
        .eq('id', existingOrder.id)
        .select('id')
        .single();

      if (orderError) {
        throw new Error(`Failed to update order: ${orderError.message}`);
      }
      orderIdToReturn = updatedOrder.id;
      console.log(`Successfully updated existing order ${lead.order_id} (UUID: ${orderIdToReturn})`);
    } else {
      // Insert new order
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('unified_orders')
        .insert({
          customer_id: customerId,
          project_id: projectId,
          amount: floatAmount,
          status: canonicalStatus,
          order_id: lead.order_id || null,
          utm_source: m.utm_source,
          utm_medium: m.utm_medium,
          utm_campaign: m.utm_campaign,
          utm_content: m.utm_content,
          utm_term: m.utm_term,
          campaign_id: m.campaign_id,
          adset_id: m.adset_id,
          ad_id: m.ad_id,
          fbclid: m.fbclid,
          gclid: m.gclid,
          fbp: m.fbp,
          fbc: m.fbc,
          ip_address: m.ip_address || (marketing as any)?.ip_address || null,
          user_agent: m.user_agent || (marketing as any)?.user_agent || null,
          page_path: m.page_path,
          page_url: m.page_url,
          visitor_uuid,
          metadata: meta,
          created_at: createdAtIso
        })
        .select('id')
        .single();

      if (orderError) {
        throw new Error(`Failed to log order: ${orderError.message}`);
      }
      orderIdToReturn = newOrder.id;
    }

    return NextResponse.json({
      success: true,
      message: 'Lead registered successfully.',
      customer_id: customerId,
      order_id: orderIdToReturn
    });

  } catch (error: any) {
    console.error('API Gateway Lead Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
