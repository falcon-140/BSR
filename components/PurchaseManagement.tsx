
import React, { useState, useMemo } from 'react';
import { Product, PurchaseInvoice, Payment, PaymentType, SavePurchasePayload, NewProductPurchase, ExistingProductPurchase } from '../types';
import { CashIcon, CreditCardIcon, PlusIcon, TrashIcon, UpiIcon, DollarSignIcon } from './Icons';

type InvoiceItemData = (NewProductPurchase | ExistingProductPurchase) & { 
    // Common properties for display and keying
    key: string; 
    design: string; 
};


const getPaymentDetails = (invoice: PurchaseInvoice) => {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid === 0) {
        return { text: 'UNPAID', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: null };
    }
    if (totalPaid < invoice.total) {
        return { text: 'PARTIALLY PAID', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', icon: null };
    }
    if (invoice.payments.length === 1) {
        const method = invoice.payments[0].method;
        switch(method) {
            case 'cash': return { text: 'PAID (Cash)', classes: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: <CashIcon className="h-4 w-4" /> };
            case 'card': return { text: 'PAID (Card)', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: <CreditCardIcon className="h-4 w-4" /> };
            case 'upi': return { text: 'PAID (UPI)', classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: <UpiIcon className="h-4 w-4" /> };
        }
    }
    return { text: 'PAID (Split)', classes: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: <DollarSignIcon className="h-4 w-4"/> };
}

interface PurchaseManagementProps {
    products: Product[];
    purchaseInvoices: PurchaseInvoice[];
    onSaveInvoice: (payload: SavePurchasePayload) => void;
    onDeleteInvoice: (invoiceId: string) => void;
}

interface PurchaseInvoiceItemProps {
    invoice: PurchaseInvoice;
    onDelete: (invoiceId: string) => void;
}

const PurchaseInvoiceItem: React.FC<PurchaseInvoiceItemProps> = ({ invoice, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const paymentDetails = getPaymentDetails(invoice);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none rounded-t-lg"
            >
                <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{invoice.id}</span>
                    <span className="text-gray-600 dark:text-gray-400">{invoice.supplier}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center gap-1.5 ${paymentDetails.classes}`}>
                        {paymentDetails.icon}
                        {paymentDetails.text}
                    </span>
                    <span className="font-bold text-lg text-right">${invoice.total.toFixed(2)}</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Items Purchased:</h4>
                    <ul className="space-y-2">
                        {invoice.items.map(item => (
                            <li key={item.productId} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{item.design} (Qty: {item.quantity})</span>
                                <span>@ ${item.purchasePrice.toFixed(2)} each = ${(item.purchasePrice * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                     <div className="mt-6 pt-4 border-t border-dashed dark:border-gray-600 flex justify-end">
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
}

const AddItemModal: React.FC<{ 
    products: Product[], 
    onClose: () => void, 
    onAddItem: (item: InvoiceItemData) => void 
}> = ({ products, onClose, onAddItem }) => {
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    
    // Common fields
    const [quantity, setQuantity] = useState(1);
    const [purchasePrice, setPurchasePrice] = useState(0);

    // New product fields
    const [design, setDesign] = useState('');
    const [retailId, setRetailId] = useState('');
    const [wholesaleId, setWholesaleId] = useState('');
    const [retailPrice, setRetailPrice] = useState(0);
    const [category, setCategory] = useState('');

    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        const product = products.find(p => p.id === parseInt(productId, 10));
        if (product) {
            setPurchasePrice(product.wholesalePrice);
            setDesign(product.design);
        } else {
            setPurchasePrice(0);
            setDesign('');
        }
    };

    const handleSubmit = () => {
        if (isNewProduct) {
            if (!design || !retailId || !wholesaleId || retailPrice <= 0 || !category || quantity <= 0 || purchasePrice < 0) {
                alert("Please fill all new product fields.");
                return;
            }
            onAddItem({
                key: `new-${Date.now()}`,
                design,
                retailId,
                wholesaleId,
                retailPrice,
                category,
                imageUrl: '', // Will be auto-generated in App.tsx
                quantity,
                purchasePrice,
            });
        } else {
            if (!selectedProductId || quantity <= 0 || purchasePrice < 0) {
                alert("Please select a product and enter valid quantity/price.");
                return;
            }
            const product = products.find(p => p.id === parseInt(selectedProductId, 10))!;
            onAddItem({
                key: `existing-${product.id}`,
                productId: product.id,
                design: product.design,
                quantity,
                purchasePrice,
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Add Item to Purchase</h3>
                
                <div className="flex items-center">
                    <input type="checkbox" id="isNewProduct" checked={isNewProduct} onChange={e => setIsNewProduct(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="isNewProduct" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">This is a new product</label>
                </div>

                {isNewProduct ? (
                    <div className="grid grid-cols-2 gap-4">
                        <input value={design} onChange={e => setDesign(e.target.value)} placeholder="Design Name" className="col-span-2 p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                        <input value={retailId} onChange={e => setRetailId(e.target.value)} placeholder="Retail ID" className="p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                        <input value={wholesaleId} onChange={e => setWholesaleId(e.target.value)} placeholder="Wholesale ID" className="p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                        <input type="number" value={retailPrice || ''} onChange={e => setRetailPrice(parseFloat(e.target.value))} placeholder="Retail Price" className="p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    </div>
                ) : (
                    <select value={selectedProductId} onChange={e => handleProductSelect(e.target.value)} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded">
                        <option value="">-- Select Existing Product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.design}</option>)}
                    </select>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={quantity || ''} onChange={e => setQuantity(parseInt(e.target.value, 10))} placeholder="Quantity" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" min="1" />
                    <input type="number" value={purchasePrice || ''} onChange={e => setPurchasePrice(parseFloat(e.target.value))} placeholder="Purchase Price/Item" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" step="0.01" />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Add Item</button>
                </div>
            </div>
        </div>
    )
}

const PurchaseManagement: React.FC<PurchaseManagementProps> = ({ products, purchaseInvoices, onSaveInvoice, onDeleteInvoice }) => {
    const [supplier, setSupplier] = useState('');
    const [items, setItems] = useState<InvoiceItemData[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<PaymentType>('cash');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    const handleAddItemToInvoice = (item: InvoiceItemData) => {
        // Prevent adding the same existing product twice, instead user should edit
        const existingItemIndex = items.findIndex(i => i.key === item.key);
        if(existingItemIndex > -1) {
            alert("This product is already on the invoice. Please remove it and add it again with the correct quantity if you need to make changes.");
            return;
        }
        setItems(prev => [...prev, item]);
    };

    const handleRemoveItem = (key: string) => {
        setItems(items.filter(item => item.key !== key));
    };
    
    const handleAddPayment = () => {
        if (paymentAmount <= 0) {
            alert("Please enter a payment amount greater than zero.");
            return;
        }
        setPayments([...payments, { method: paymentMethod, amount: paymentAmount }]);
        setPaymentAmount(0);
    };
    
    const handleRemovePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    }

    const invoiceTotal = useMemo(() => items.reduce((acc, item) => acc + (('purchasePrice' in item ? item.purchasePrice : 0) * item.quantity), 0), [items]);
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);

    const handleSave = () => {
        if (!supplier || items.length === 0) {
            alert("Please provide a supplier name and add at least one item.");
            return;
        }
        
        const newItems: NewProductPurchase[] = items.filter(item => 'retailId' in item) as NewProductPurchase[];
        const existingItems: ExistingProductPurchase[] = items
            .filter(item => 'productId' in item)
            .map(item => ({ 
                productId: (item as ExistingProductPurchase).productId,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
            }));

        onSaveInvoice({ supplier, newItems, existingItems, total: invoiceTotal, payments });
        
        // Reset form
        setSupplier('');
        setItems([]);
        setPayments([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {isModalOpen && <AddItemModal products={products} onClose={() => setIsModalOpen(false)} onAddItem={handleAddItemToInvoice} />}

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Purchase History</h2>
                <div className="max-h-[600px] overflow-y-auto">
                    {purchaseInvoices.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 dark:text-gray-400">No purchase invoices have been recorded yet.</p>
                    ) : (
                        purchaseInvoices.map(invoice => <PurchaseInvoiceItem key={invoice.id} invoice={invoice} onDelete={onDeleteInvoice} />)
                    )}
                </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">New Purchase Invoice</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Name</label>
                        <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded mt-1" />
                    </div>
                    
                    <div className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 space-y-3">
                         <h3 className="font-semibold text-gray-600 dark:text-gray-300">Invoice Items</h3>
                         <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-sm">
                             <PlusIcon className="h-4 w-4 mr-1" /> Add Item to Invoice
                         </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.key} className="flex justify-between items-center text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                <div>
                                    <span className="font-semibold">{item.design}</span> x {item.quantity} @ ${item.purchasePrice.toFixed(2)}
                                    {'retailId' in item && <span className="text-xs ml-2 text-green-600 dark:text-green-400">(New)</span>}
                                </div>
                                <button onClick={() => handleRemoveItem(item.key)}><TrashIcon className="h-4 w-4 text-red-500"/></button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t dark:border-gray-600 pt-4 space-y-3">
                         <div className="flex justify-between font-bold text-xl">
                             <span>Total:</span>
                             <span>${invoiceTotal.toFixed(2)}</span>
                         </div>

                        <div className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 space-y-3">
                            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Record Payments</h3>
                             <div className="grid grid-cols-2 gap-2">
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentType)} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded">
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                </select>
                                <input type="number" value={paymentAmount || ''} onChange={e => setPaymentAmount(parseFloat(e.target.value))} placeholder="Amount" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" step="0.01" />
                             </div>
                             <button onClick={handleAddPayment} className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-sm">
                                 <PlusIcon className="h-4 w-4 mr-1" /> Add Payment
                             </button>
                        </div>
                        
                        <div className="space-y-2">
                            {payments.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                    <span className="capitalize">{p.method}: ${p.amount.toFixed(2)}</span>
                                    <button onClick={() => handleRemovePayment(i)}><TrashIcon className="h-4 w-4 text-red-500"/></button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-between font-semibold text-md text-red-600">
                             <span>Amount Due:</span>
                             <span>${(invoiceTotal - totalPaid).toFixed(2)}</span>
                         </div>

                         <button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded text-lg">
                           Save Purchase Invoice
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseManagement;
