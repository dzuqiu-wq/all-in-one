import type { InvoiceData, InvoiceTotals } from './types';

/**
 * Calculate invoice totals with precision-safe arithmetic
 */
export function calculateInvoiceTotals(invoice: InvoiceData): InvoiceTotals {
  // Calculate subtotal with precision handling
  const subtotal = invoice.items.reduce((sum, item) => {
    const lineTotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
    return Math.round((sum + lineTotal) * 100) / 100;
  }, 0);

  // Calculate tax amount
  const taxableAmount = Math.max(0, subtotal - invoice.discountAmount);
  const taxAmount = Math.round(taxableAmount * invoice.taxRate) / 100;
  const taxRounded = Math.round(taxAmount * 100) / 100;

  // Calculate grand total
  const grandTotal = Math.round((taxableAmount + taxRounded) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: taxRounded,
    discountAmount: invoice.discountAmount,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Calculate line item total
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate invoice data
 */
export function validateInvoice(invoice: InvoiceData): string[] {
  const errors: string[] = [];

  if (!invoice.companyName.trim()) {
    errors.push('Company name is required');
  }

  if (!invoice.clientName.trim()) {
    errors.push('Client name is required');
  }

  if (invoice.items.length === 0) {
    errors.push('At least one item is required');
  }

  const hasValidItem = invoice.items.some(
    item => item.description.trim() && item.unitPrice > 0
  );
  if (!hasValidItem) {
    errors.push('At least one item must have a description and price');
  }

  return errors;
}