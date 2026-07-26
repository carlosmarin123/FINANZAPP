import { Currency } from '../types';

export function getCurrencySymbol(currency: Currency = 'BOB'): string {
  const symbolMap: Record<Currency, string> = {
    BOB: 'Bs.',
    USD: '$',
  };
  return symbolMap[currency] || 'Bs.';
}

export function formatCurrency(amount: number, currency: Currency = 'BOB'): string {
  const localeMap: Record<Currency, string> = {
    BOB: 'es-BO',
    USD: 'en-US',
  };

  const symbol = getCurrencySymbol(currency);
  const locale = localeMap[currency] || 'es-BO';

  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    const sign = amount < 0 ? '-' : '';
    if (currency === 'BOB') {
      return `${sign}${symbol} ${formatted}`;
    }
    return `${sign}${symbol}${formatted}`;
  } catch {
    return `${amount < 0 ? '-' : ''}${symbol} ${Math.abs(amount).toFixed(2)}`;
  }
}

export function formatDateSpanish(dateString: string, short = false): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  if (short) {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getMonthName(yearMonth: string): string {
  // yearMonth format 'YYYY-MM'
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}
