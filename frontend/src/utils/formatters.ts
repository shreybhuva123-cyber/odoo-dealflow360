// Map common currency symbols and abbreviations to valid ISO-4217 currency codes
const CURRENCY_MAP: Record<string, string> = {
  '₹': 'INR',
  'INR': 'INR',
  'RS': 'INR',
  'RS.': 'INR',
  '$': 'USD',
  'USD': 'USD',
  'US$': 'USD',
  '€': 'EUR',
  'EUR': 'EUR',
  '£': 'GBP',
  'GBP': 'GBP',
  '¥': 'JPY',
  'JPY': 'JPY',
  'C$': 'CAD',
  'CAD': 'CAD',
  'A$': 'AUD',
  'AUD': 'AUD',
  'SGD': 'SGD',
  'AED': 'AED',
};

const SYMBOL_PREFIX_MAP: Record<string, string> = {
  'INR': '₹',
  '₹': '₹',
  'USD': '$',
  '$': '$',
  'EUR': '€',
  '€': '€',
  'GBP': '£',
  '£': '£',
  'JPY': '¥',
  '¥': '¥',
};

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';

  const cleanCurrency = (currency || 'USD').trim();
  const isoCode = CURRENCY_MAP[cleanCurrency] || CURRENCY_MAP[cleanCurrency.toUpperCase()] || 'USD';
  const prefix = SYMBOL_PREFIX_MAP[cleanCurrency] || SYMBOL_PREFIX_MAP[isoCode] || '$';

  try {
    const isIndia = isoCode === 'INR';
    const locale = isIndia ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: isoCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Ultra-resilient fallback if Intl.NumberFormat rejects the currency
    const formattedNum = Math.abs(amount).toLocaleString(isoCode === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-${prefix}${formattedNum}` : `${prefix}${formattedNum}`;
  }
}


export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}
