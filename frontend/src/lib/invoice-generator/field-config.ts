/**
 * Invoice Generator - Field Configuration
 */

export interface InvoiceField {
  key: string;
  label: string;
  labelZh: string;
  placeholder: string;
  placeholderZh: string;
  required: boolean;
  maxLength?: number;
}

export const INVOICE_FIELDS: InvoiceField[] = [
  { key: "invoiceNumber", label: "Invoice #", labelZh: "发票号", placeholder: "INV-2024-001", placeholderZh: "INV-2024-001", required: true, maxLength: 30 },
  { key: "date", label: "Date", labelZh: "日期", placeholder: "2024-01-15", placeholderZh: "2024-01-15", required: true },
  { key: "fromName", label: "From (Name)", labelZh: "开票方（名称）", placeholder: "Company Inc.", placeholderZh: "公司名称", required: true, maxLength: 50 },
  { key: "fromAddress", label: "From (Address)", labelZh: "开票方（地址）", placeholder: "123 Business St.", placeholderZh: "商务街123号", required: false, maxLength: 100 },
  { key: "toName", label: "To (Name)", labelZh: "收票方（名称）", placeholder: "Client Name", placeholderZh: "客户名称", required: true, maxLength: 50 },
  { key: "toAddress", label: "To (Address)", labelZh: "收票方（地址）", placeholder: "456 Client Ave.", placeholderZh: "客户大道456号", required: false, maxLength: 100 },
];

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function formatCurrency(amount: number, currency: string = "$"): string {
  return `${currency}${amount.toFixed(2)}`;
}
