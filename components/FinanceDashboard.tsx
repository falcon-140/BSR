
import React, { useMemo } from 'react';
import { Invoice, PurchaseInvoice, CreditNote, StockAdjustment } from '../types';
import { DollarSignIcon, BoxIcon, TruckIcon } from './Icons';

interface FinanceDashboardProps {
  invoices: Invoice[];
  purchaseInvoices: PurchaseInvoice[];
  creditNotes: CreditNote[];
  stockAdjustments: StockAdjustment[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
    return (
        <div className={`p-6 rounded-lg shadow-lg flex items-center space-x-4 ${color}`}>
            <div className="flex-shrink-0">{icon}</div>
            <div>
                <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    );
};

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ invoices, purchaseInvoices, creditNotes, stockAdjustments }) => {
  const financialSummary = useMemo(() => {
    const totalRefunds = creditNotes.reduce((acc, cn) => acc + cn.totalRefund, 0);

    // Sales Data
    const paidInvoices = invoices.filter(inv => inv.total > 0 && inv.payments.reduce((sum, p) => sum + p.amount, 0) >= inv.total);
    const partiallyPaidInvoices = invoices.filter(inv => {
        const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        return totalPaid > 0 && totalPaid < inv.total;
    });
    const unpaidInvoices = invoices.filter(inv => inv.payments.length === 0);
    
    const grossRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalRevenue = grossRevenue - totalRefunds;

    const totalWholesaleCost = invoices.reduce((acc, inv) => acc + inv.wholesaleTotal, 0);
    // Adjust wholesale cost for returned items
    const returnedItemsWholesaleCost = creditNotes.reduce((acc, cn) => {
        const originalInvoice = invoices.find(inv => inv.id === cn.originalInvoiceId);
        if (!originalInvoice) return acc;

        const returnedCost = cn.items.reduce((itemAcc, returnedItem) => {
            const originalItem = originalInvoice.items.find(i => i.id === returnedItem.productId);
            if(originalItem) {
                const costPerUnit = originalItem.wholesalePrice;
                return itemAcc + (costPerUnit * returnedItem.quantity);
            }
            return itemAcc;
        }, 0);

        return acc + returnedCost;
    }, 0);
    
    // Calculate cost of stock adjustments (only reductions are a loss)
    const stockAdjustmentCost = stockAdjustments.reduce((acc, adj) => {
        if (adj.quantity < 0) {
            // Find the product to get its wholesale price
            const product = invoices.flatMap(i => i.items).find(item => item.id === adj.productId);
            if (product) {
                return acc + (product.wholesalePrice * Math.abs(adj.quantity));
            }
        }
        return acc;
    }, 0);


    const adjustedCostOfGoods = (totalWholesaleCost - returnedItemsWholesaleCost) + stockAdjustmentCost;
    const grossProfit = totalRevenue - adjustedCostOfGoods;

    const totalItemsSold = invoices.reduce((acc, inv) => acc + inv.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    const outstandingReceivables = [...partiallyPaidInvoices, ...unpaidInvoices].reduce((acc, inv) => {
        const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        return acc + (inv.total - totalPaid);
    }, 0);
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Purchase Data
    const paidPurchases = purchaseInvoices.filter(p => p.total > 0 && p.payments.reduce((sum, payment) => sum + payment.amount, 0) >= p.total);
    const partiallyPaidPurchases = purchaseInvoices.filter(p => {
        const totalPaid = p.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return totalPaid > 0 && totalPaid < p.total;
    });
    const unpaidPurchases = purchaseInvoices.filter(p => p.payments.length === 0);

    const totalPurchases = purchaseInvoices.reduce((acc, p) => acc + p.total, 0);
    const totalOwedToSuppliers = [...partiallyPaidPurchases, ...unpaidPurchases].reduce((acc, p) => {
        const totalPaid = p.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return acc + (p.total - totalPaid);
    }, 0);

    return {
      totalRevenue,
      totalWholesaleCost: adjustedCostOfGoods,
      grossProfit,
      totalItemsSold,
      paidInvoicesCount: paidInvoices.length,
      unpaidInvoicesCount: unpaidInvoices.length + partiallyPaidInvoices.length,
      potentialRevenue: outstandingReceivables,
      profitMargin,
      totalPurchases,
      paidPurchasesCount: paidPurchases.length,
      unpaidPurchasesCount: unpaidPurchases.length + partiallyPaidPurchases.length,
      totalOwedToSuppliers,
    };
  }, [invoices, purchaseInvoices, creditNotes, stockAdjustments]);
  
  const { totalRevenue, totalWholesaleCost, grossProfit, totalItemsSold, paidInvoicesCount, unpaidInvoicesCount, potentialRevenue, profitMargin, totalPurchases, paidPurchasesCount, unpaidPurchasesCount, totalOwedToSuppliers } = financialSummary;

  const chartData = {
    revenue: totalRevenue,
    cost: totalWholesaleCost,
    profit: grossProfit,
  };
  const maxChartValue = Math.max(chartData.revenue, 1); // Avoid division by zero if revenue is 0

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Finance Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Net Revenue (After Returns)" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSignIcon className="h-10 w-10 text-green-700 dark:text-green-300"/>} color="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200" />
        <StatCard title="Gross Profit" value={`$${grossProfit.toFixed(2)}`} icon={<DollarSignIcon className="h-10 w-10 text-blue-700 dark:text-blue-300"/>} color="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200" />
        <StatCard title="Total Purchases" value={`$${totalPurchases.toFixed(2)}`} icon={<TruckIcon className="h-10 w-10 text-orange-700 dark:text-orange-300"/>} color="bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200" />
        <StatCard title="Total Items Sold" value={totalItemsSold.toString()} icon={<BoxIcon className="h-10 w-10 text-indigo-700 dark:text-indigo-300"/>} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profitability Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Profitability Breakdown (After Returns & Adjustments)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Net Revenue</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${chartData.revenue.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div className="bg-green-500 h-6 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Adjusted Cost of Goods Sold</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${chartData.cost.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div className="bg-red-500 h-6 rounded-full" style={{ width: `${(chartData.cost / maxChartValue) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Gross Profit</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${chartData.profit.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div className="bg-blue-500 h-6 rounded-full" style={{ width: `${(chartData.profit / maxChartValue) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Summary</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Profit Margin</span>
                    <span className="font-bold text-xl text-gray-800 dark:text-gray-200">{profitMargin.toFixed(2)}%</span>
                </div>
                <div className="border-t dark:border-gray-700 my-2"></div>
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                    <span className="font-medium text-green-700 dark:text-green-300">Paid Sales Invoices</span>
                    <span className="font-bold text-lg text-green-800 dark:text-green-200">{paidInvoicesCount}</span>
                </div>
                 <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">Receivables (Unpaid)</span>
                    <span className="font-bold text-lg text-yellow-800 dark:text-yellow-200">{unpaidInvoicesCount} (${potentialRevenue.toFixed(2)})</span>
                </div>
                <div className="border-t dark:border-gray-700 my-2"></div>
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                    <span className="font-medium text-blue-700 dark:text-blue-300">Paid Purchase Invoices</span>
                    <span className="font-bold text-lg text-blue-800 dark:text-blue-200">{paidPurchasesCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md">
                    <span className="font-medium text-red-700 dark:text-red-300">Payables (Unpaid)</span>
                    <span className="font-bold text-lg text-red-800 dark:text-red-200">{unpaidPurchasesCount} (${totalOwedToSuppliers.toFixed(2)})</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
