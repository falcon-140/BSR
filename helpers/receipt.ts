
import { Invoice } from "../types";

export function printReceipt(invoice: Invoice) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const receiptContent = `
            <html>
            <head>
                <title>Receipt - ${invoice.id}</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <style>
                    body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; background-color: #f7f7f7; }
                    .receipt-container { 
                        max-width: 320px; 
                        margin: auto; 
                        padding: 20px; 
                        background-color: white;
                        border: 1px solid #eee;
                        box-shadow: 0 0 10px rgba(0,0,0,0.05);
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    .logo svg {
                        width: 100px;
                        height: auto;
                        fill: #333;
                    }
                    h2, p { text-align: center; margin: 5px 0; }
                    h2 { font-size: 1.2em; }
                    .header p { font-size: 0.8em; color: #555; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em; }
                    th, td { padding: 6px 2px; }
                    .item-line td { border-bottom: 1px dashed #ccc; }
                    .text-right { text-align: right; }
                    .totals-table { margin-top: 15px; }
                    .totals-table td { padding: 3px 2px; }
                    .total-line { border-top: 2px solid #333; padding-top: 5px; font-weight: bold; font-size: 1.1em; }
                    .footer { margin-top: 20px; text-align: center; font-size: 0.8em; color: #555; }
                    .barcode { display: flex; justify-content: center; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="logo">
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="M480 256c0 123.4-100.6 224-224 224S32 379.4 32 256 132.6 32 256 32s224 100.6 224 224zm-224 72c-48.6 0-88-39.4-88-88s39.4-88 88-88 88 39.4 88 88-39.4 88-88 88zm0-116c-15.5 0-28 12.5-28 28s12.5 28 28 28 28-12.5 28-28-12.5-28-28-28z"/>
                        </svg>
                    </div>
                    <div class="header">
                        <h2>Vintage Retail Solutions</h2>
                        <p>123 Classic Ave, Old Town, 54321</p>
                        <p>Date: ${new Date(invoice.date).toLocaleString()}</p>
                        <p>Invoice #: ${invoice.id}</p>
                        ${invoice.customerName ? `<p>Customer: ${invoice.customerName}</p>` : ''}
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr class="item-line">
                                    <td>${item.design}</td>
                                    <td>${item.quantity}</td>
                                    <td class="text-right">$${(item.retailPrice * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <table class="totals-table">
                        <tr><td>Subtotal:</td><td class="text-right">$${invoice.subtotal.toFixed(2)}</td></tr>
                        ${invoice.discountAmount > 0 ? `<tr><td>Discount:</td><td class="text-right">-$${invoice.discountAmount.toFixed(2)}</td></tr>` : ''}
                        <tr><td>Tax:</td><td class="text-right">$${invoice.tax.toFixed(2)}</td></tr>
                        <tr class="total-line"><td>TOTAL:</td><td class="text-right">$${invoice.total.toFixed(2)}</td></tr>
                        <tr><td>Amount Paid:</td><td class="text-right">$${totalPaid.toFixed(2)}</td></tr>
                        <tr class="total-line"><td>Amount Due:</td><td class="text-right">$${(invoice.total - totalPaid).toFixed(2)}</td></tr>
                    </table>

                    <div class="barcode">
                        <svg id="barcode"></svg>
                    </div>

                    <div class="footer">
                        <p>Thank you for your purchase!</p>
                    </div>
                </div>
                <script>
                    JsBarcode("#barcode", "${invoice.id}", {
                        format: "CODE128",
                        height: 50,
                        displayValue: false,
                        margin: 10
                    });
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
    }
}
