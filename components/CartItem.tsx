
import React from 'react';
import { CartItem as CartItemType } from '../types';
import { PlusIcon, MinusIcon, TrashIcon } from './Icons';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 flex-1">
        <img src={item.imageUrl} alt={item.design} className="w-12 h-12 object-cover rounded" />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate max-w-[120px]">{item.design}</p>
          <p className="text-gray-600 dark:text-gray-400 text-xs">${item.retailPrice.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
          <MinusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
          <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
        </button>
      </div>
       <button onClick={() => onRemoveItem(item.id)} className="ml-4 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition">
        <TrashIcon className="w-5 h-5 text-red-500"/>
      </button>
    </div>
  );
};

export default CartItem;
