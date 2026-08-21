import { CanonicalStatus } from './enrichment';

export const statusMapper = {
  normalize: (rawStatus: string | null | undefined): CanonicalStatus => {
    if (!rawStatus) return 'pending';
    const s = String(rawStatus).toLowerCase().trim();

    // Direct match for canonical values
    if (s === 'closed_won') return 'closed_won';
    if (s === 'declined' || s === 'failed') return 'declined';
    if (s === 'pending') return 'pending';
    if (s === 'new') return 'new';
    if (s === 'клик') return 'Клик';
    if (s === 'кликформы' || s === 'клик_формы') return 'КликФормы';
    if (s === 'внесена предоплата' || s === 'внесена передплата' || s === 'передплата' || s === 'предоплата') {
      return 'внесена предоплата';
    }

    // Check for prepayment / partial payment
    if (s.includes('передплат') || s.includes('предоплат') || s.includes('бронь') || s.includes('booking')) {
      if (!s.includes('не') && !s.includes('fail') && !s.includes('decline')) {
        return 'внесена предоплата';
      }
    }

    // Check if status represents a successful payment
    const hasPaidIndicator = 
      s === 'closed_won' ||
      (s.includes('оплат') && !s.includes('очікує') && !s.includes('не')) ||
      s.includes('approved') ||
      s.includes('aprooved') ||
      s.includes('settled') ||
      s.includes('success') ||
      s.includes('купив') ||
      s === 'paid' ||
      s.includes('оплачен');

    const hasUnpaidNegation = 
      s.includes('не оплат') ||
      s.includes('неоплат') ||
      s.includes('не оплач') ||
      s.includes('неоплач') ||
      s.includes('очікує') ||
      /не\s*оплат/.test(s) ||
      /не\s*оплач/.test(s);

    if (hasPaidIndicator && !hasUnpaidNegation) {
      return 'closed_won';
    }

    // Check if status represents a failed/declined/refunded transaction
    const isDeclined = 
      s.includes('fail') ||
      s.includes('decline') ||
      s.includes('expire') ||
      s.includes('відхил') ||
      s.includes('відмов') ||
      s.includes('скасув') ||
      s.includes('cancel');

    if (isDeclined) {
      return 'declined';
    }

    // Check for click/view events
    if (s.includes('кликформ') || s.includes('click_form')) {
      return 'КликФормы';
    }
    if (s.includes('клик') || s.includes('click') || s.includes('visit') || s.includes('view')) {
      return 'Клик';
    }

    // Check for new lead registration
    if (s.includes('зареєстр') || s.includes('заявк') || s.includes('lead') || s === 'new') {
      return 'new';
    }

    return 'pending';
  }
};
