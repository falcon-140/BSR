
import React, { useState, useMemo } from 'react';
import { Product, StockAdjustment } from '../types';

const LOW_STOCK_THRESHOLD = 10;

interface InventoryDashboardProps {
    products: Product[];
    adjustments: StockAdjustment[];
    onStockAdjustment: (productId: number, quantity: number, reason: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ products, adjustments, onStockAdjustment }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('remove');
    const [quantity, setQuantity] = useState<number>(1);
    const [reason, setReason] = useState<string>('');

    const lowStockProducts = useMemo(() => 
        products.filter(p => p.count <= LOW_STOCK_THRESHOLD).sort((a, b) => a.count - b.count),
        [products]
    );
    
    const sortedAdjustments = useMemo(() => 
        [...adjustments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [adjustments]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !reason || quantity <= 0) {
            alert("Please select a product, enter a quantity, and provide a reason.");
            return;
        }
        const adjQuantity = adjustmentType === 'add' ? quantity : -quantity;
        onStockAdjustment(parseInt(selectedProductId, 10), adjQuantity, reason);

        // Reset form
        setSelectedProductId('');
        setQuantity(1);
        setReason('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Low Stock Alerts</h2>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Remaining Stock</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                                    <tr key={p.id} className={p.count === 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                        <td className="px-4 py-3 text-sm font-medium">{p.design}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.category}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-red-600">{p.count}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No products are low on stock.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Adjustment History</h2>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedAdjustments.map(adj => (
                                    <tr key={adj.id}>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(adj.date).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{adj.productDesign}</td>
                                        <td className={`px-4 py-3 text-sm font-bold ${adj.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{adj.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Manual Stock Adjustment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Product</label>
                        <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded mt-1" required>
                            <option value="">-- Select Product --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.design}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Action</label>
                        <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value as any)} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded mt-1">
                            <option value="remove">Remove from Stock</option>
                            <option value="add">Add to Stock</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Quantity</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded mt-1" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Reason</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Damaged, Stock Count" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded mt-1" required/>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Apply Adjustment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InventoryDashboard;
