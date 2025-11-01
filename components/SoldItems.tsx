
import React, { useMemo } from 'react';
import { SoldItem, Invoice } from '../types';
import { DownloadIcon } from './Icons';
import { exportToCsv } from '../helpers/csv';

interface SoldItemsProps {
  items: SoldItem[];
  invoices: Invoice[];
}

const getPaymentStatus = (invoice?: Invoice) => {
    if (!invoice) return 'N/A';
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid === 0) return 'Unpaid';
    if (totalPaid < invoice.total) return 'Partial';
    return 'Paid';
}

const SoldItems: React.FC<SoldItemsProps> = ({ items, invoices }) => {
  const sortedItems = useMemo(() => 
    [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [items]
  );
  
  const invoiceMap = useMemo(() => 
    new Map(invoices.map(invoice => [invoice.id, invoice])),
    [invoices]
  );

  const handleExport = () => {
    const dataToExport = sortedItems.map(item => ({
        date: new Date(item.date).toLocaleString(),
        design: item.design,
        retailId: item.retailId,
        quantity: item.quantity,
        unitPrice: item.soldPrice,
        total: item.quantity * item.soldPrice,
        invoiceId: item.invoiceId,
        paymentStatus: getPaymentStatus(invoiceMap.get(item.invoiceId)),
    }));
    exportToCsv('sold_items.csv', dataToExport);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 border-b dark:border-gray-600 pb-4">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Sold Items Log</h2>
        <button onClick={handleExport} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
            <DownloadIcon className="h-4 w-4" />
            Export to CSV
        </button>
      </div>
      <div className="max-h-[700px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Design</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Retail ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedItems.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">No items have been sold yet.</td>
                </tr>
            ) : (
                sortedItems.map(item => {
                  const invoice = invoiceMap.get(item.invoiceId);
                  const paymentStatus = getPaymentStatus(invoice);
                  return (
                    <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.design}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.retailId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.soldPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">${(item.quantity * item.soldPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{paymentStatus}</td>
                    </tr>
                  )
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SoldItems;
