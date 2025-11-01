
import React, { useState, useMemo } from 'react';
import { Invoice, Payment, ReturnedItem, CartItem } from '../types';
import { CashIcon, CreditCardIcon, UpiIcon, TrashIcon, PrinterIcon, DollarSignIcon } from './Icons';
import { printReceipt } from '../helpers/receipt';

const getPaymentDetails = (invoice: Invoice) => {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid === 0) {
        return { text: 'UNPAID', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: null };
    }
    
    if (totalPaid < invoice.total) {
        return { text: 'PARTIALLY PAID', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', icon: null };
    }

    // Fully paid
    if (invoice.payments.length === 1) {
        const method = invoice.payments[0].method;
        switch (method) {
            case 'cash':
                return { text: 'PAID (Cash)', classes: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: <CashIcon className="h-4 w-4" /> };
            case 'card':
                return { text: 'PAID (Card)', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: <CreditCardIcon className="h-4 w-4" /> };
            case 'upi':
                return { text: 'PAID (UPI)', classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: <UpiIcon className="h-4 w-4" /> };
        }
    }
    
    return { text: 'PAID (Split)', classes: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: <DollarSignIcon className="h-4 w-4"/> };
}

const PaymentIcon: React.FC<{payment: Payment, className?: string}> = ({payment, className}) => {
    switch(payment.method) {
        case 'cash': return <CashIcon className={className} />;
        case 'card': return <CreditCardIcon className={className} />;
        case 'upi': return <UpiIcon className={className} />;
        default: return null;
    }
}

const ReturnModal: React.FC<{
    invoice: Invoice;
    onClose: () => void;
    onProcessReturn: (invoiceId: string, returnedItems: ReturnedItem[], reason: string) => void;
}> = ({ invoice, onClose, onProcessReturn }) => {
    const [itemsToReturn, setItemsToReturn] = useState<Map<number, number>>(new Map());
    const [reason, setReason] = useState('');

    const handleQuantityChange = (item: CartItem, quantity: number) => {
        const maxReturnable = item.quantity - (item.returnedQuantity || 0);
        const newQty = Math.max(0, Math.min(quantity, maxReturnable));
        
        const newMap = new Map(itemsToReturn);
        if (newQty > 0) {
            newMap.set(item.id, newQty);
        } else {
            newMap.delete(item.id);
        }
        setItemsToReturn(newMap);
    };

    const totalRefund = useMemo(() => {
        let total = 0;
        if (invoice.subtotal > 0) {
            for (const [productId, quantity] of itemsToReturn.entries()) {
                const item = invoice.items.find(i => i.id === productId);
                if (item) {
                    const proportionOfSubtotal = (item.retailPrice * item.quantity) / invoice.subtotal;
                    const itemTotal = item.retailPrice * item.quantity;
                    const itemDiscount = invoice.discountAmount * proportionOfSubtotal;
                    const itemTax = (itemTotal - itemDiscount) * (invoice.tax / (invoice.subtotal - invoice.discountAmount));
                    const pricePerUnit = (itemTotal - itemDiscount + itemTax) / item.quantity;
                    total += pricePerUnit * quantity;
                }
            }
        }
        return total;
    }, [itemsToReturn, invoice]);

    const handleSubmit = () => {
        if (itemsToReturn.size === 0) {
            alert("Please select at least one item to return.");
            return;
        }
        if (!reason) {
            alert("Please provide a reason for the return.");
            return;
        }

        const returnedItems: ReturnedItem[] = Array.from(itemsToReturn.entries()).map(([productId, quantity]) => {
            const item = invoice.items.find(i => i.id === productId)!;
            let pricePerUnit = item.retailPrice;
            if (invoice.subtotal > 0) {
                const proportionOfSubtotal = (item.retailPrice * item.quantity) / invoice.subtotal;
                const itemTotal = item.retailPrice * item.quantity;
                const itemDiscount = invoice.discountAmount * proportionOfSubtotal;
                const itemTax = (itemTotal - itemDiscount) * (invoice.tax / (invoice.subtotal - invoice.discountAmount));
                pricePerUnit = (itemTotal - itemDiscount + itemTax) / item.quantity;
            }
            return {
                productId,
                design: item.design,
                quantity,
                refundAmount: pricePerUnit * quantity,
            };
        });
        
        onProcessReturn(invoice.id, returnedItems, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl space-y-4">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Process Return for Invoice {invoice.id}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {invoice.items.map(item => {
                        const maxReturnable = item.quantity - (item.returnedQuantity || 0);
                        if (maxReturnable <= 0) return null;
                        
                        return (
                            <div key={item.id} className="grid grid-cols-3 items-center gap-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <div>
                                    <p className="font-semibold">{item.design}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{maxReturnable} of {item.quantity} available to return</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor={`return-qty-${item.id}`} className="text-sm">Return Qty:</label>
                                    <input
                                        id={`return-qty-${item.id}`}
                                        type="number"
                                        min="0"
                                        max={maxReturnable}
                                        value={itemsToReturn.get(item.id) || ''}
                                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10) || 0)}
                                        className="w-20 p-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for return (e.g., damaged, wrong size)" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                <div className="text-right font-bold text-xl">
                    Total Refund: ${totalRefund.toFixed(2)}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Confirm Return</button>
                </div>
            </div>
        </div>
    );
};

interface InvoiceItemProps {
    invoice: Invoice;
    onDelete: (invoiceId: string) => void;
    onProcessReturn: (invoiceId: string, returnedItems: ReturnedItem[], reason: string) => void;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoice, onDelete, onProcessReturn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const paymentDetails = getPaymentDetails(invoice);
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const hasReturns = (invoice.creditNoteIds?.length ?? 0) > 0;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800">
            {isReturnModalOpen && <ReturnModal invoice={invoice} onClose={() => setIsReturnModalOpen(false)} onProcessReturn={onProcessReturn} />}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none rounded-t-lg"
            >
                <div className="grid grid-cols-5 gap-4 items-center">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{invoice.id}</span>
                    <span className="text-gray-600 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center gap-1.5 ${paymentDetails.classes}`}>
                        {paymentDetails.icon}
                        {paymentDetails.text}
                    </span>
                    <span className={`text-sm font-medium ${hasReturns ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {hasReturns ? '✓ Has Returns' : 'No Returns'}
                    </span>
                    <span className="font-bold text-lg text-right">${invoice.total.toFixed(2)}</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                             <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Customer:</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{invoice.customerName || 'Walk-in Customer'}</p>
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Items Sold:</h4>
                            <ul className="space-y-2">
                                {invoice.items.map(item => (
                                    <li key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{item.design} x {item.quantity} {item.returnedQuantity && <span className="text-red-600">({item.returnedQuantity} returned)</span>}</span>
                                        <span>${(item.retailPrice * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-1">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Billing Details:</h4>
                             <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between"><span>Subtotal:</span> <span>${invoice.subtotal.toFixed(2)}</span></div>
                                {invoice.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({invoice.discount}%):</span> <span>-${invoice.discountAmount.toFixed(2)}</span></div>}
                                <div className="flex justify-between"><span>Tax:</span> <span>${invoice.tax.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-base border-t dark:border-gray-600 pt-1 mt-1 text-gray-800 dark:text-gray-200"><span>Bill Total:</span> <span>${invoice.total.toFixed(2)}</span></div>
                                <div className="flex justify-between text-green-700"><span>Amount Paid:</span> <span>${totalPaid.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-red-600"><span>Amount Due:</span> <span>${(invoice.total - totalPaid).toFixed(2)}</span></div>
                             </div>
                             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                                <h5 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Internal Details:</h5>
                                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                                    <div className="flex justify-between"><span>Total Wholesale Cost:</span> <span>-${invoice.wholesaleTotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold"><span>Profit:</span> <span>${invoice.profit.toFixed(2)}</span></div>
                                </div>
                             </div>
                        </div>
                        <div className="md:col-span-1">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Payments Received:</h4>
                            {invoice.payments.length > 0 ? (
                                <ul className="space-y-2">
                                    {invoice.payments.map((p, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <PaymentIcon payment={p} className="h-4 w-4 text-gray-600 dark:text-gray-300"/>
                                                <span className="font-medium capitalize">{p.method}</span>
                                            </div>
                                            <span className="font-semibold">${p.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No payments recorded.</p>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-3 mt-6 pt-4 border-t border-dashed dark:border-gray-600 flex justify-end space-x-4">
                        <button 
                            onClick={() => printReceipt(invoice)}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            <PrinterIcon className="h-5 w-5" />
                            Print Receipt
                        </button>
                        <button 
                            onClick={() => setIsReturnModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Process a Return
                        </button>
                        <button 
                            onClick={() => onDelete(invoice.id)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            <TrashIcon className="h-5 w-5" />
                            Delete Invoice
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface InvoicesProps {
  invoices: Invoice[];
  onDeleteInvoice: (invoiceId: string) => void;
  onProcessReturn: (invoiceId: string, returnedItems: ReturnedItem[], reason: string) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, onDeleteInvoice, onProcessReturn }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Invoice History</h2>
      <div>
        {invoices.length === 0 ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">No invoices have been created yet.</p>
        ) : (
          invoices.map(invoice => <InvoiceItem key={invoice.id} invoice={invoice} onDelete={onDeleteInvoice} onProcessReturn={onProcessReturn} />)
        )}
      </div>
    </div>
  );
};

export default Invoices;
