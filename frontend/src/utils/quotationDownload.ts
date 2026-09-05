import { CustomerQuote } from '@/types';
import { showToast } from '@/stores/toast.store';

/**
 * Generates an ultra-crisp, executive-ready HTML document for an official quotation.
 * Formatted cleanly for print / PDF generation and offline review.
 */
export function generateQuotationHtml(quote: CustomerQuote): string {
  const currency = quote.currency === 'INR' || quote.currency === '₹' ? '₹' : (quote.currency || '$');
  const formatMoney = (amount: number = 0) =>
    `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const itemsRows = (quote.items || [])
    .map((item, index) => {
      return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${index + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
          ${item.productName || 'Line Item'}
          ${item.badge ? `<span style="background: #eff6ff; color: #2563eb; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-left: 6px; border: 1px solid #bfdbfe;">${item.badge}</span>` : ''}
          ${item.description ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 3px; line-height: 1.4;">${item.description}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${item.category || 'General'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #334155; font-weight: 600;">${item.quantity || 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; color: #334155;">${formatMoney(item.unitPrice)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formatMoney(item.total)}</td>
      </tr>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quotation ${quote.quoteNumber} - DealFlow360</title>
  <style>
    @media print {
      body { margin: 0; padding: 15mm; background: #fff !important; color: #000 !important; font-size: 12pt; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      @page { margin: 12mm; size: A4; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 32px 16px;
    }
    .quote-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      padding: 40px;
      box-sizing: border-box;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      margin-bottom: 24px;
    }
    .items-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    .totals-table {
      margin-left: auto;
      width: 320px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 12px;
      font-size: 13px;
    }
    .grand-total {
      border-top: 2px solid #0f172a;
      font-size: 16px !important;
      font-weight: 800;
      color: #0284c7;
    }
  </style>
</head>
<body>
  <div class="quote-card">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div style="font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.02em;">DEALFLOW 360</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Enterprise Commercial Proposal</div>
          <div style="margin-top: 14px; font-size: 12px; color: #475569; line-height: 1.5;">
            <strong>Sales Executive:</strong> ${quote.salesRepName || 'Enterprise Accounts'}<br/>
            <strong>Support:</strong> ${quote.salesRepEmail || 'enterprise@dealflow360.com'}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="status-badge">${(quote.status || 'PROPOSAL').replace('_', ' ')}</div>
          <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 8px;">Quotation ${quote.quoteNumber}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Issue Date: <strong>${quote.issueDate}</strong></div>
          <div style="font-size: 12px; color: #e11d48; margin-top: 2px;">Valid Until: <strong>${quote.validUntil}</strong></div>
          ${quote.version > 1 ? `<div style="font-size: 11px; color: #2563eb; margin-top: 2px;">Revision Version: v${quote.version}</div>` : ''}
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 24px 0;" />

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px;">Quoted For:</div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${quote.customerName}</div>
      ${quote.customerEmail ? `<div style="font-size: 13px; color: #475569; margin-top: 2px;">Email: ${quote.customerEmail}</div>` : ''}
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Item / Service</th>
          <th>Category</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 110px;">Unit Price</th>
          <th style="text-align: right; width: 120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table class="totals-table">
      <tr>
        <td style="color: #64748b;">Subtotal</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #1e293b;">${formatMoney(quote.subtotal)}</td>
      </tr>
      ${quote.discount > 0 ? `
      <tr>
        <td style="color: #059669;">Volume Discount</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #059669;">-${formatMoney(quote.discount)}</td>
      </tr>` : ''}
      <tr>
        <td style="color: #64748b;">GST / Taxes (18%)</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #1e293b;">${formatMoney(quote.tax)}</td>
      </tr>
      ${quote.shipping ? `
      <tr>
        <td style="color: #64748b;">Shipping & Logistics</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #1e293b;">${formatMoney(quote.shipping)}</td>
      </tr>` : ''}
      <tr class="grand-total">
        <td style="padding-top: 10px;">Grand Total</td>
        <td style="padding-top: 10px; text-align: right; font-family: monospace;">${formatMoney(quote.total)}</td>
      </tr>
    </table>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 6px 0;"><strong>Terms & Conditions:</strong> ${quote.termsAndConditions || 'Payment terms: Net 30 days from dispatch. Delivery scheduled within 7 business days of written acceptance.'}</p>
      <p style="margin: 0;"><strong>Commercial Notes:</strong> ${quote.notes || 'All hardware includes manufacturer warranty and 24/7 technical onboarding.'}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a browser print dialog with the clean quotation document.
 */
export function printQuotation(quote: CustomerQuote): void {
  try {
    const html = generateQuotationHtml(quote);
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    showToast(`Prepared print view for ${quote.quoteNumber}`, 'blue');
  } catch (err) {
    console.error('Print quotation error:', err);
    window.print();
  }
}

/**
 * Downloads a standalone HTML file of the quotation locally.
 */
export function downloadQuotationHtml(quote: CustomerQuote): void {
  try {
    const html = generateQuotationHtml(quote);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation_${quote.quoteNumber || 'dealflow'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Quotation ${quote.quoteNumber} HTML exported locally`, 'green');
  } catch (err) {
    console.error('Download quotation HTML error:', err);
    showToast('Failed to export quotation HTML', 'red');
  }
}
