
import React from 'react';
import { Product } from '../types';
import { CartIcon } from './Icons';

interface ProductItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onAddToCart }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col">
      <img src={product.imageUrl} alt={product.design} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.design}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="text-xl font-bold text-gray-900 mt-2">${product.retailPrice.toFixed(2)}</p>
        <div className="mt-auto pt-4">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <CartIcon className="w-5 h-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
