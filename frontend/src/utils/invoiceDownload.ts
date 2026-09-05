import { Invoice } from '@/types';
import { showToast } from '@/stores/toast.store';

/**
 * Generates an ultra-crisp, professional, self-contained HTML document for an invoice.
 * Formatted for standard A4 printing and offline archiving.
 */
export function generateInvoiceHtml(invoice: Invoice): string {
  const currency = invoice.currency || '₹';
  const formatMoney = (amount: number = 0) =>
    `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const billTo = invoice.billTo || {
    name: invoice.customerName || 'Valued Customer',
    company: invoice.customerName || '',
    address: 'Corporate Headquarters',
    city: 'Commercial District',
    state: '',
    country: 'India',
    postalCode: '',
    taxId: 'UNREGISTERED',
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    paid: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    partially_paid: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    pending: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    overdue: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    draft: { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
    cancelled: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
  };

  const currentStatus = (invoice.status || 'pending').toLowerCase();
  const badgeStyle = statusColors[currentStatus] || statusColors.pending;

  const itemsRows = (invoice.items || [])
    .map((item, index) => {
      return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${index + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
          ${item.productName || 'Line Item'}
          ${item.sku ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">SKU: ${item.sku}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #334155;">${item.quantity || 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; color: #334155;">${formatMoney(item.unitPrice)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formatMoney(item.lineTotal || item.quantity * item.unitPrice)}</td>
      </tr>
    `;
    })
    .join('');

  const paymentsRows =
    (invoice.payments || []).length > 0
      ? `
    <div style="margin-top: 24px;">
      <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 8px 0;">Payment Transactions Recorded</h4>
      <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
        <thead>
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: left;">
            <th style="padding: 8px 12px;">Ref #</th>
            <th style="padding: 8px 12px;">Date</th>
            <th style="padding: 8px 12px;">Method</th>
            <th style="padding: 8px 12px;">Status</th>
            <th style="padding: 8px 12px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.payments
            .map(
              (p) => `
            <tr style="border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155;">
              <td style="padding: 8px 12px; font-family: monospace;">${p.reference || p.id}</td>
              <td style="padding: 8px 12px;">${p.paymentDate || 'N/A'}</td>
              <td style="padding: 8px 12px; text-transform: capitalize;">${(p.method || 'Bank Transfer').replace('_', ' ')}</td>
              <td style="padding: 8px 12px;"><span style="color: #059669; font-weight: 600;">● Completed</span></td>
              <td style="padding: 8px 12px; text-align: right; font-family: monospace; font-weight: 600;">${formatMoney(p.amount)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: ${badgeStyle.bg};
      color: ${badgeStyle.text};
      border: 1px solid ${badgeStyle.border};
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Action Bar for viewing in browser -->
    <div class="no-print" style="margin-bottom: 20px; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; color: #475569; font-weight: 500;">
        Tax Invoice: <strong>${invoice.invoiceNumber}</strong>
      </span>
      <div>
        <button onclick="window.print()" style="cursor: pointer; background: #2563eb; color: #ffffff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-right: 8px;">
          🖨️ Print / Save as PDF
        </button>
        <button onclick="window.close()" style="cursor: pointer; background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 12px;">
          Close
        </button>
      </div>
    </div>

    <!-- Header / Brand & Invoice Meta -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top; width: 55%;">
          <div style="font-size: 24px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.02em;">
            DealFlow<span style="color: #0284c7;">360</span>
          </div>
          <div style="font-size: 11px; color: #0369a1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px;">
            Autonomous Enterprise Deal Execution Platform
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 8px; line-height: 1.4;">
            <strong>DealFlow360 Enterprise Solutions Pvt. Ltd.</strong><br>
            404 Innovation Tower, Cyber City Industrial Zone<br>
            Mumbai, Maharashtra 400051, India<br>
            GSTIN: 27AABCA1234F1Z9 · PAN: AABCA1234F<br>
            Email: billing@dealflow360.com · Web: dealflow360.internal
          </div>
        </td>
        <td style="vertical-align: top; width: 45%; text-align: right;">
          <div style="font-size: 22px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
            TAX INVOICE
          </div>
          <div style="margin-top: 4px;">
            <span class="status-badge">${invoice.status || 'PENDING'}</span>
          </div>
          <div style="font-size: 13px; color: #334155; margin-top: 8px; line-height: 1.5;">
            Invoice No: <strong style="font-family: monospace; color: #0f172a;">${invoice.invoiceNumber}</strong><br>
            Issue Date: <strong>${invoice.issueDate || 'N/A'}</strong><br>
            Payment Due Date: <strong style="color: #dc2626;">${invoice.dueDate || 'N/A'}</strong><br>
            Payment Terms: <strong>${invoice.paymentTerms || 'NET 30'}</strong><br>
            ${invoice.quotationNumber ? `Quote Ref: <span style="font-family: monospace;">${invoice.quotationNumber}</span><br>` : ''}
            ${invoice.fulfillmentNumber ? `Fulfillment Ref: <span style="font-family: monospace;">${invoice.fulfillmentNumber}</span>` : ''}
          </div>
        </td>
      </tr>
    </table>

    <div style="height: 1px; background: #e2e8f0; margin: 16px 0 20px 0;"></div>

    <!-- Bill To / Customer Details -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="width: 50%; vertical-align: top; background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px;">
            Billed To
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
            ${billTo.company || invoice.customerName || 'Valued Client'}
          </div>
          <div style="font-size: 12px; color: #334155; line-height: 1.4; margin-top: 4px;">
            ${billTo.name && billTo.name !== billTo.company ? `Attn: ${billTo.name}<br>` : ''}
            ${billTo.address ? `${billTo.address}<br>` : ''}
            ${[billTo.city, billTo.state, billTo.postalCode].filter(Boolean).join(', ')}${billTo.country ? `<br>${billTo.country}` : ''}
            ${invoice.customerEmail ? `<br>Email: ${invoice.customerEmail}` : ''}
            ${billTo.taxId ? `<br>GSTIN/Tax ID: <strong style="font-family: monospace;">${billTo.taxId}</strong>` : ''}
          </div>
        </td>
        <td style="width: 5%;"></td>
        <td style="width: 45%; vertical-align: top; background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px;">
            Payment & Bank Instructions
          </div>
          <div style="font-size: 12px; color: #334155; line-height: 1.4;">
            Bank Name: <strong>HDFC Bank Ltd.</strong><br>
            Account Name: <strong>DealFlow360 Enterprise Solutions</strong><br>
            Account No: <strong style="font-family: monospace;">50200084920194</strong><br>
            IFSC Code: <strong style="font-family: monospace;">HDFC0000240</strong><br>
            UPI ID: <strong style="font-family: monospace;">billing@dealflow360</strong><br>
            Remittance Note: Quote <strong>${invoice.invoiceNumber}</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #0f172a; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
          <th style="padding: 10px 12px; text-align: left; width: 5%;">#</th>
          <th style="padding: 10px 12px; text-align: left; width: 45%;">Item & Description</th>
          <th style="padding: 10px 12px; text-align: center; width: 10%;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; width: 20%;">Unit Price</th>
          <th style="padding: 10px 12px; text-align: right; width: 20%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Financial Totals Summary -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 20px;">
          ${invoice.notes ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #475569; margin-bottom: 12px;">
              <strong style="color: #0f172a;">Special Notes / Terms:</strong><br>
              ${invoice.notes}
            </div>
          ` : ''}
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            * All hardware products include 12-month standard OEM replacement warranty.<br>
            * Interest @ 18% per annum will be charged on overdue payments beyond due date.<br>
            * Subject to Mumbai jurisdiction. Computer-generated tax invoice.
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 10px; color: #475569;">Subtotal:</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">${formatMoney(invoice.subtotal)}</td>
            </tr>
            ${(invoice.discount || 0) > 0 ? `
              <tr>
                <td style="padding: 6px 10px; color: #059669;">Volume Discount:</td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace; color: #059669;">-${formatMoney(invoice.discount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 10px; color: #475569;">Applicable GST (18%):</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">${formatMoney(invoice.tax)}</td>
            </tr>
            ${(invoice.shipping || 0) > 0 ? `
              <tr>
                <td style="padding: 6px 10px; color: #475569;">Freight & Shipping:</td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace;">${formatMoney(invoice.shipping)}</td>
              </tr>
            ` : ''}
            <tr style="border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a;">
              <td style="padding: 10px; font-weight: 800; font-size: 15px; color: #0f172a;">Grand Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 16px; font-family: monospace; color: #1e3a8a;">${formatMoney(invoice.total)}</td>
            </tr>
            ${(invoice.amountPaid || 0) > 0 ? `
              <tr>
                <td style="padding: 6px 10px; color: #059669; font-weight: 600;">Amount Paid:</td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace; color: #059669; font-weight: 600;">-${formatMoney(invoice.amountPaid)}</td>
              </tr>
            ` : ''}
            <tr style="background: #fef2f2;">
              <td style="padding: 8px 10px; font-weight: 700; color: #dc2626; border-radius: 4px 0 0 4px;">Balance Due:</td>
              <td style="padding: 8px 10px; text-align: right; font-weight: 800; font-size: 15px; font-family: monospace; color: #dc2626; border-radius: 0 4px 4px 0;">${formatMoney(invoice.balanceDue)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${paymentsRows}

    <!-- Signatory Footer -->
    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end;">
      <div style="font-size: 11px; color: #94a3b8;">
        Generated automatically by DealFlow360 Enterprise ERP Engine.<br>
        Document ID: ${invoice.id || invoice.invoiceNumber} · Authenticated Non-Repudiation Seal
      </div>
      <div style="text-align: center; width: 220px;">
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 30px;">
          For DealFlow360 Enterprises Pvt. Ltd.
        </div>
        <div style="border-bottom: 1px solid #475569; width: 100%;"></div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Authorized Finance Signatory
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers native browser print/save-as-PDF for the given invoice using a dedicated hidden iframe.
 */
export function downloadInvoicePdf(invoice: Invoice): void {
  try {
    const htmlContent = generateInvoiceHtml(invoice);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.srcdoc = htmlContent;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          showToast(`Invoice ${invoice.invoiceNumber} print/PDF dialog opened`, 'green');
        } catch {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 60000);
        }
      }, 300);
    };
  } catch (error) {
    console.error('Failed to print invoice PDF:', error);
    showToast('Failed to generate invoice PDF. Downloading HTML copy instead.', 'amber');
    downloadInvoiceHtml(invoice);
  }
}

/**
 * Downloads a standalone, self-contained HTML invoice file locally to the user's disk.
 */
export function downloadInvoiceHtml(invoice: Invoice): void {
  try {
    const htmlContent = generateInvoiceHtml(invoice);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber || 'invoice'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Invoice ${invoice.invoiceNumber}.html saved locally`, 'green');
  } catch (err) {
    console.error('Failed to download invoice HTML:', err);
    showToast('Failed to download invoice file locally', 'red');
  }
}

/**
 * Downloads the invoice structured data as a JSON file locally to the user's disk.
 */
export function downloadInvoiceJson(invoice: Invoice): void {
  try {
    const jsonStr = JSON.stringify(invoice, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber || 'invoice'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Invoice ${invoice.invoiceNumber}.json saved locally`, 'green');
  } catch (err) {
    console.error('Failed to export invoice JSON:', err);
    showToast('Failed to export invoice JSON', 'red');
  }
}

/**
 * Downloads one or more invoices as an RFC-4180 compliant CSV file locally to the user's disk.
 */
export function downloadInvoiceCsv(invoices: Invoice | Invoice[]): void {
  try {
    const list = Array.isArray(invoices) ? invoices : [invoices];
    if (list.length === 0) {
      showToast('No invoices to export', 'amber');
      return;
    }

    const headers = [
      'Invoice Number',
      'Customer Name',
      'Customer Email',
      'Issue Date',
      'Due Date',
      'Status',
      'Payment Terms',
      'Subtotal',
      'Discount',
      'Tax',
      'Total Amount',
      'Amount Paid',
      'Balance Due',
      'Quotation Ref',
      'Fulfillment Ref',
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = list.map((inv) =>
      [
        escapeCsv(inv.invoiceNumber),
        escapeCsv(inv.customerName),
        escapeCsv(inv.customerEmail),
        escapeCsv(inv.issueDate),
        escapeCsv(inv.dueDate),
        escapeCsv(inv.status),
        escapeCsv(inv.paymentTerms),
        escapeCsv(inv.subtotal),
        escapeCsv(inv.discount),
        escapeCsv(inv.tax),
        escapeCsv(inv.total),
        escapeCsv(inv.amountPaid),
        escapeCsv(inv.balanceDue),
        escapeCsv(inv.quotationNumber || inv.quotationId),
        escapeCsv(inv.fulfillmentNumber || inv.fulfillmentId),
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const filename =
      list.length === 1
        ? `${list[0].invoiceNumber || 'invoice'}.csv`
        : `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`${filename} saved locally`, 'green');
  } catch (err) {
    console.error('Failed to export invoices CSV:', err);
    showToast('Failed to export invoices to CSV', 'red');
  }
}

/**
 * Universal invoice download function supporting PDF (print/save dialog), standalone HTML, JSON, or CSV.
 */
export function downloadInvoice(
  invoice: Invoice,
  format: 'pdf' | 'html' | 'json' | 'csv' = 'pdf'
): void {
  switch (format) {
    case 'pdf':
      downloadInvoicePdf(invoice);
      break;
    case 'html':
      downloadInvoiceHtml(invoice);
      break;
    case 'json':
      downloadInvoiceJson(invoice);
      break;
    case 'csv':
      downloadInvoiceCsv(invoice);
      break;
    default:
      downloadInvoicePdf(invoice);
  }
}
