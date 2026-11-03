/**
 * Currency utilities for Indian Rupee (INR) representation and minor-unit safe calculations.
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  // Use Indian number formatting (lakhs & crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRExact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatLitres(litres: number): string {
  if (isNaN(litres) || litres === null || litres === undefined) return '0.0 L';
  return `${litres.toFixed(1)} L`;
}

/**
 * Safe minor-unit money arithmetic (calculating in paise to prevent IEEE-754 precision drift)
 */
export function multiplyMinor(units: number, rate: number): number {
  const paisePerUnit = Math.round(rate * 100);
  const totalPaise = Math.round(units * paisePerUnit);
  return totalPaise / 100;
}
