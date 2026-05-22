// Invoice line item
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// Invoice data structure
export interface InvoiceData {
  // Invoice number & dates
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Company info (sender)
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyEmail: string;
  companyPhone: string;

  // Client info (recipient)
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientCountry: string;
  clientEmail: string;

  // Line items
  items: InvoiceItem[];

  // Financial
  taxRate: number;        // Percentage (e.g., 10 for 10%)
  discountAmount: number; // Fixed discount amount
  currency: Currency;

  // Notes
  notes: string;
  paymentTerms: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY';

// Calculated totals
export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
}

// PDF generation options
export interface PDFOptions {
  format: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margin: number; // mm
}

// Default invoice
export const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  companyName: '',
  companyAddress: '',
  companyCity: '',
  companyCountry: '',
  companyEmail: '',
  companyPhone: '',
  clientName: '',
  clientAddress: '',
  clientCity: '',
  clientCountry: '',
  clientEmail: '',
  items: [
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }
  ],
  taxRate: 0,
  discountAmount: 0,
  currency: 'USD',
  notes: '',
  paymentTerms: 'Net 30',
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
};

// Currency locales
export const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CNY: 'zh-CN',
  JPY: 'ja-JP',
};