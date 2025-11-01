
import React, { useState, useMemo } from 'react';
import { CartItem as CartItemType, Payment, PaymentType } from '../types';
import CartItem from './CartItem';
import { CashIcon, CreditCardIcon, UpiIcon } from './Icons';

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onProcessTransaction: (payments: Payment[]) => void;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  setDiscount: (discount: number) => void;
  discountAmount: number;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemoveItem, onProcessTransaction, subtotal, tax, total, discount, setDiscount, discountAmount }) => {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({ cash: 0, card: 0, upi: 0 });

  const totalPaid = useMemo(() => paymentAmounts.cash + paymentAmounts.card + paymentAmounts.upi, [paymentAmounts]);
  const amountDue = useMemo(() => total - totalPaid, [total, totalPaid]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDiscount(value);
    } else if (e.target.value === '') {
      setDiscount(0);
    }
  };
  
  const handlePaymentAmountChange = (method: PaymentType, value: string) => {
    const amount = parseFloat(value) || 0;
    setPaymentAmounts(prev => ({ ...prev, [method]: amount }));
  };

  const setFullAmount = (method: PaymentType) => {
    const otherPayments = Object.entries(paymentAmounts)
        .filter(([key]) => key !== method)
        .reduce((sum, [, value]) => sum + value, 0);
    const remaining = total - otherPayments;
    setPaymentAmounts(prev => ({ ...prev, [method]: Math.max(0, remaining) }));
  }

  const handleFinalizeTransaction = () => {
    const payments: Payment[] = Object.entries(paymentAmounts)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({ method: method as PaymentType, amount }));
    
    onProcessTransaction(payments);
    setIsPaying(false);
    setPaymentAmounts({ cash: 0, card: 0, upi: 0 });
  };

  const resetAndClosePayer = () => {
    setIsPaying(false);
    setPaymentAmounts({ cash: 0, card: 0, upi: 0 });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 border-b dark:border-gray-600 pb-4">Current Bill</h2>
      
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your cart is empty.</p>
        ) : (
          items.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              onUpdateQuantity={onUpdateQuantity} 
              onRemoveItem={onRemoveItem} 
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 border-t dark:border-gray-600 pt-6 space-y-3">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
            <label htmlFor="discount" className="flex items-center">
              Discount (%):
            </label>
            <input
              type="number"
              id="discount"
              value={discount === 0 ? '' : discount}
              onChange={handleDiscountChange}
              className="w-20 text-right font-medium rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-1"
              placeholder="0"
            />
          </div>

          {discount > 0 && (
             <div className="flex justify-between text-green-600">
                <span>Discount Applied:</span>
                <span className="font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Tax ({TAX_RATE * 100}%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white border-t dark:border-gray-600 pt-3 mt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t dark:border-gray-600">
            {isPaying ? (
              <div className="space-y-4">
                 <h3 className="text-lg text-center font-semibold text-gray-700 dark:text-gray-200">Process Payment</h3>
                 <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    {(['cash', 'card', 'upi'] as PaymentType[]).map(method => (
                        <div key={method} className="flex items-center">
                            <label className="w-16 capitalize font-medium text-gray-600 dark:text-gray-300">{method}:</label>
                            <input type="number"
                                value={paymentAmounts[method] === 0 ? '' : paymentAmounts[method]}
                                onChange={(e) => handlePaymentAmountChange(method, e.target.value)}
                                className="flex-grow p-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="0.00"
                            />
                            <button onClick={() => setFullAmount(method)} className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                                Full
                            </button>
                        </div>
                    ))}
                 </div>
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                    <p className="font-medium text-blue-800 dark:text-blue-300">Amount Due</p>
                    <p className={`text-2xl font-bold ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${amountDue.toFixed(2)}
                    </p>
                 </div>
                 <button onClick={handleFinalizeTransaction} disabled={amountDue > 0.001} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                   Finalize Transaction
                 </button>
                 <button onClick={resetAndClosePayer} className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md transition-colors duration-300">
                   Cancel
                 </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onProcessTransaction([])}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg text-lg"
                >
                    Save as Unpaid
                </button>
                <button
                    onClick={() => setIsPaying(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg text-lg"
                >
                    Checkout (Paid)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Define TAX_RATE inside the component file if it's not imported
const TAX_RATE = 0.10;

export default Cart;
