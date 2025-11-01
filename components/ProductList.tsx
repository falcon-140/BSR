
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { BarcodeIcon, SearchIcon } from './Icons';

interface SalesTerminalProps {
  productDatabase: Product[];
  onAddProduct: (product: Product) => void;
  onAddProductByRetailId: (retailId: string) => void;
  error: string | null;
  clearError: () => void;
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ productDatabase, onAddProduct, onAddProductByRetailId, error, clearError }) => {
  const [productCode, setProductCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = productDatabase.filter(p => 
      p.design.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, productDatabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productCode.trim() === '') return;
    
    onAddProductByRetailId(productCode.trim());
    setProductCode('');
    inputRef.current?.focus(); // Re-focus for next scan
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductCode(e.target.value);
    if (error) {
        clearError();
    }
  }

  const handleSearchResultClick = (product: Product) => {
    onAddProduct(product);
    setSearchTerm('');
    setSearchResults([]);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Sales Terminal</h2>
        {/* Barcode Scanner */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product-id" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Scan or Enter Product Code (Retail ID)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BarcodeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                ref={inputRef}
                type="text"
                id="product-id"
                value={productCode}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-lg p-3"
                placeholder="e.g., R-TS-CW, R-JN-DN..."
                autoComplete="off"
                aria-invalid={!!error}
                aria-describedby="product-id-error"
              />
            </div>
            {error && <p id="product-id-error" className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Add to Bill by Code
          </button>
        </form>

        <div className="my-6 text-center text-gray-500 dark:text-gray-400 font-semibold">OR</div>

        {/* Product Search */}
        <div className="space-y-4 relative">
            <div>
                 <label htmlFor="product-search" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Search by Product Design
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="product-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-10 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-lg p-3"
                        placeholder="e.g., T-Shirt, Wallet..."
                        autoComplete="off"
                    />
                </div>
            </div>
            {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(product => (
                        <li 
                            key={product.id}
                            onClick={() => handleSearchResultClick(product)}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{product.design}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Retail ID: {product.retailId} | Stock: {product.count}</p>
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">${product.retailPrice.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
