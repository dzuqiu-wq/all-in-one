"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Trash2,
  Download,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import AdBanner from "@/components/AdBanner";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";
import {
  type InvoiceData,
  type InvoiceItem,
  type InvoiceTotals,
  type Currency,
  DEFAULT_INVOICE,
  CURRENCY_SYMBOLS,
} from "@/lib/invoice-generator/types";
import {
  calculateInvoiceTotals,
  calculateLineTotal,
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
  validateInvoice,
} from "@/lib/invoice-generator/invoiceCalculator";

interface InvoiceGeneratorClientProps {
  locale: string;
}

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

export default function InvoiceGeneratorClient({ locale }: InvoiceGeneratorClientProps) {
  const t = useTranslations("tools.invoiceGenerator");
  const homeHref = useLocalizedHref("/");

  const [invoice, setInvoice] = useState<InvoiceData>(() => ({
    ...DEFAULT_INVOICE,
    invoiceNumber: generateInvoiceNumber(),
  }));
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate totals in real-time
  const totals = useMemo(() => calculateInvoiceTotals(invoice), [invoice]);

  // Currency locale for formatting
  const currencyLocale = useMemo(() => {
    const locales: Record<Currency, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      CNY: 'zh-CN',
      JPY: 'ja-JP',
    };
    return locales[invoice.currency];
  }, [invoice.currency]);

  // Update invoice field
  const updateField = useCallback(<K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K]
  ) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  // Add new line item
  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  }, []);

  // Remove line item
  const removeItem = useCallback((id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, []);

  // Update line item
  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  // Generate PDF
  const handleGeneratePDF = useCallback(async () => {
    const validationErrors = validateInvoice(invoice);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!previewRef.current) return;

    setIsGenerating(true);
    setErrors([]);

    try {
      // Capture the invoice preview as canvas
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate A4 dimensions at 72 DPI
      const imgWidth = 210; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate filename
      const filename = `${invoice.invoiceNumber || 'invoice'}.pdf`;

      // Trigger download
      pdf.save(filename);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'PDF generation failed']);
    } finally {
      setIsGenerating(false);
    }
  }, [invoice]);

  // Reset form
  const handleReset = useCallback(() => {
    setInvoice({
      ...DEFAULT_INVOICE,
      invoiceNumber: generateInvoiceNumber(),
      items: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
    });
    setErrors([]);
    setShowSuccess(false);
  }, []);

  const symbol = CURRENCY_SYMBOLS[invoice.currency];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-6 py-section">
        {/* Back Link */}
        <Link href={homeHref} className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4">{t("title")}</h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">{t("description")}</p>
        </div>

        <div className="mb-8">
          <AdBanner slot="invoice-top" format="auto" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">{t("invoiceDetails")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("invoiceNumber")}</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("currency")}</label>
                  <select
                    value={invoice.currency}
                    onChange={(e) => updateField('currency', e.target.value as Currency)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("issueDate")}</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => updateField('issueDate', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("dueDate")}</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateField('dueDate', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">{t("from")}</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("companyName")}</label>
                  <input
                    type="text"
                    value={invoice.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("address")}</label>
                  <textarea
                    value={invoice.companyAddress}
                    onChange={(e) => updateField('companyAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("city")}</label>
                    <input
                      type="text"
                      value={invoice.companyCity}
                      onChange={(e) => updateField('companyCity', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("country")}</label>
                    <input
                      type="text"
                      value={invoice.companyCountry}
                      onChange={(e) => updateField('companyCountry', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("email")}</label>
                    <input
                      type="email"
                      value={invoice.companyEmail}
                      onChange={(e) => updateField('companyEmail', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("phone")}</label>
                    <input
                      type="tel"
                      value={invoice.companyPhone}
                      onChange={(e) => updateField('companyPhone', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">{t("billTo")}</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("clientName")}</label>
                  <input
                    type="text"
                    value={invoice.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("address")}</label>
                  <textarea
                    value={invoice.clientAddress}
                    onChange={(e) => updateField('clientAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("city")}</label>
                    <input
                      type="text"
                      value={invoice.clientCity}
                      onChange={(e) => updateField('clientCity', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm text-muted mb-1">{t("country")}</label>
                    <input
                      type="text"
                      value={invoice.clientCountry}
                      onChange={(e) => updateField('clientCountry', e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("email")}</label>
                  <input
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="surface-card rounded-xl p-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-sm font-sans font-medium text-ink">{t("items")}</h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 text-body-sm bg-primary text-on-primary rounded-md hover:bg-primary-active transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t("addItem")}
                </button>
              </div>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-body-xs text-muted font-medium">
                  <div className="col-span-5">{t("description")}</div>
                  <div className="col-span-2 text-right">{t("qty")}</div>
                  <div className="col-span-2 text-right">{t("price")}</div>
                  <div className="col-span-2 text-right">{t("total")}</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder={t("itemDescription")}
                      className="col-span-5 px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                      className="col-span-2 px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink text-right focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="col-span-2 px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink text-right focus:outline-none focus:border-primary"
                    />
                    <div className="col-span-2 text-right text-body-sm font-medium text-ink">
                      {symbol}{calculateLineTotal(item.quantity, item.unitPrice).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={invoice.items.length === 1}
                      className="col-span-1 p-2 text-muted hover:text-error disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Settings */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">{t("financialSettings")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("taxRate")} (%)</label>
                  <input
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-muted mb-1">{t("discount")} ({symbol})</label>
                  <input
                    type="number"
                    value={invoice.discountAmount}
                    onChange={(e) => updateField('discountAmount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-body-sm text-muted mb-1">{t("paymentTerms")}</label>
                <input
                  type="text"
                  value={invoice.paymentTerms}
                  onChange={(e) => updateField('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="mt-4">
                <label className="block text-body-sm text-muted mb-1">{t("notes")}</label>
                <textarea
                  value={invoice.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">{t("preview")}</h3>

              {/* A4 Invoice Preview */}
              <div
                ref={previewRef}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '595px', // A4 width at 72 DPI
                  aspectRatio: '210/297', // A4 ratio
                  margin: '0 auto',
                }}
              >
                <div className="p-8 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-2xl font-bold text-ink mb-1">INVOICE</h1>
                      <p className="text-sm text-muted">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-ink">{invoice.companyName || 'Your Company'}</p>
                      <p className="text-xs text-muted whitespace-pre-line">{[
                        invoice.companyAddress,
                        [invoice.companyCity, invoice.companyCountry].filter(Boolean).join(', '),
                      ].filter(Boolean).join('\n')}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between mb-6 text-sm">
                    <div>
                      <p className="text-muted">{t("issueDate")}: {formatDate(invoice.issueDate, currencyLocale)}</p>
                      <p className="text-muted">{t("dueDate")}: {formatDate(invoice.dueDate, currencyLocale)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted">{t("billTo")}:</p>
                      <p className="font-medium text-ink">{invoice.clientName || 'Client Name'}</p>
                      <p className="text-xs text-muted whitespace-pre-line">{[
                        invoice.clientAddress,
                        [invoice.clientCity, invoice.clientCountry].filter(Boolean).join(', '),
                      ].filter(Boolean).join('\n')}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="flex-1">
                    <table className="w-full text-sm mb-6">
                      <thead>
                        <tr className="border-b-2 border-ink">
                          <th className="text-left py-2 font-medium">{t("description")}</th>
                          <th className="text-right py-2 font-medium">{t("qty")}</th>
                          <th className="text-right py-2 font-medium">{t("price")}</th>
                          <th className="text-right py-2 font-medium">{t("total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="border-b border-hairline">
                            <td className="py-2 text-ink">{item.description || '-'}</td>
                            <td className="py-2 text-right text-ink">{item.quantity}</td>
                            <td className="py-2 text-right text-ink">{symbol}{item.unitPrice.toFixed(2)}</td>
                            <td className="py-2 text-right text-ink font-medium">
                              {symbol}{calculateLineTotal(item.quantity, item.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-muted">{t("subtotal")}:</span>
                        <span className="text-ink">{symbol}{totals.subtotal.toFixed(2)}</span>
                      </div>
                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between py-1 text-sm">
                          <span className="text-muted">{t("discount")}:</span>
                          <span className="text-success">-{symbol}{totals.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {invoice.taxRate > 0 && (
                        <div className="flex justify-between py-1 text-sm">
                          <span className="text-muted">{t("tax")} ({invoice.taxRate}%):</span>
                          <span className="text-ink">{symbol}{totals.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-t-2 border-ink mt-2 font-bold">
                        <span className="text-ink">{t("total")}:</span>
                        <span className="text-primary">{symbol}{totals.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  {(invoice.notes || invoice.paymentTerms) && (
                    <div className="mt-6 pt-4 border-t border-hairline text-sm">
                      {invoice.paymentTerms && (
                        <p className="text-muted mb-2"><strong>{t("paymentTerms")}:</strong> {invoice.paymentTerms}</p>
                      )}
                      {invoice.notes && (
                        <p className="text-muted"><strong>{t("notes")}:</strong> {invoice.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {errors.length > 0 && (
                <div className="surface-card border border-error/30 rounded-lg p-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans font-medium text-ink mb-1">{t("errorTitle")}</h5>
                      <ul className="text-body-sm text-body list-disc list-inside">
                        {errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {showSuccess && (
                <div className="surface-card border border-success/30 rounded-lg p-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-body-sm font-medium text-ink">{t("pdfGenerated")}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className={`w-full py-3 text-body-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
                  isGenerating
                    ? 'bg-surface-soft text-muted cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary-active'
                }`}
              >
                <Download className="w-4 h-4" />
                {isGenerating ? t("generating") : t("generatePDF")}
              </button>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors"
              >
                {t("reset")}
              </button>
            </div>

            <AdBanner slot="invoice-bottom" format="rectangle" className="mx-auto max-w-[336px]" />
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">{t("faqTitle")}</h2>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
            ].map((item, idx) => (
              <details key={idx} className="group surface-card rounded-lg p-lg">
                <summary className="cursor-pointer text-title-sm font-sans font-medium text-ink hover:text-primary transition-colors">
                  {item.q}
                </summary>
                <p className="mt-3 text-body-md text-body leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}