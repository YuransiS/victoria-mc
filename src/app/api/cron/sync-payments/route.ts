import { NextResponse } from 'next/server';
import { syncWayForPayTransactions } from '@/lib/wayforpay-sync';

/**
 * Common verification helper for CRON_SECRET.
 */
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // If no secret configured in env, allow internal execution or warn
    return true;
  }

  const authHeader = req.headers.get('authorization');
  const xCronSecret = req.headers.get('x-cron-secret');
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');

  if (authHeader === `Bearer ${cronSecret}`) return true;
  if (xCronSecret === cronSecret) return true;
  if (secretParam === cronSecret) return true;

  return false;
}

/**
 * Handler for WayForPay payment reconciliation cron.
 * Supports Vercel Cron (GET) and manual/automated webhook triggers (POST).
 */
async function handleSync(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const dryRunParam = searchParams.get('dryRun') === 'true';

    const daysBack = daysParam ? parseInt(daysParam, 10) : 3;
    const startDate = startParam || undefined;
    const endDate = endParam || undefined;

    console.log(`[API /api/cron/sync-payments] Invoked with daysBack=${daysBack}, start=${startDate || 'none'}, end=${endDate || 'none'}, dryRun=${dryRunParam}`);

    const result = await syncWayForPayTransactions({
      daysBack,
      startDate,
      endDate,
      dryRun: dryRunParam,
    });

    return NextResponse.json({
      status: result.success ? 'success' : 'partial_success',
      ...result,
    });
  } catch (error: any) {
    console.error('[API /api/cron/sync-payments] Unhandled exception:', error);
    return NextResponse.json(
      {
        status: 'error',
        success: false,
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}
