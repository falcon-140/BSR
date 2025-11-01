
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { BarcodeIcon } from './Icons';

// Declare JsBarcode for TypeScript since it's loaded from a script tag
declare var JsBarcode: any;

interface BarcodeGeneratorProps {
  products: Product[];
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [printCount, setPrintCount] = useState<number>(1);
  const barcodeRef = useRef<SVGSVGElement>(null);
  
  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId, 10));

  useEffect(() => {
    if (selectedProduct && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, selectedProduct.retailId, {
          format: "CODE128",
          displayValue: true,
          fontSize: 18,
          margin: 10,
          background: '#ffffff', // Ensure barcode background is white for scanning
        });
      } catch (e) {
        console.error("JsBarcode error:", e);
      }
    }
  }, [selectedProduct]);

  const handlePrint = () => {
    const barcodeNode = document.getElementById('barcode-preview');
    if (!barcodeNode) return;
    
    let printContents = '';
    for (let i = 0; i < printCount; i++) {
        printContents += `<div style="padding: 10px; page-break-inside: avoid;">${barcodeNode.innerHTML}</div>`;
    }

    const printWindow = window.open('', '_blank');
    if(printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcodes</title>
                    <style>
                        @media print {
                            body { 
                                display: flex; 
                                flex-wrap: wrap; 
                                justify-content: start; 
                                align-items: start;
                                margin: 10px;
                            }
                        }
                    </style>
                </head>
                <body>${printContents}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:border dark:border-gray-700 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 border-b dark:border-gray-600 pb-4">Generate Product Barcode</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a Product
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3"
            >
              <option value="">-- Choose a product --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.design} (Retail ID: {product.retailId})
                </option>
              ))}
            </select>
        </div>
        <div>
            <label htmlFor="print-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Print Count
            </label>
            <input 
                type="number"
                id="print-count"
                value={printCount}
                onChange={(e) => setPrintCount(Math.max(1, parseInt(e.target.value, 10)))}
                min="1"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3"
            />
        </div>
      </div>

      {selectedProduct ? (
        <div id="printable-barcode">
          <div id="barcode-preview" className="text-center p-6 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white">
            <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.design}</h3>
            <p className="text-gray-600 mb-4">${selectedProduct.retailPrice.toFixed(2)}</p>
            <div className="flex justify-center">
              <svg ref={barcodeRef}></svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-10 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-lg">
            <BarcodeIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Select a product to generate its barcode.</p>
        </div>
      )}

      {selectedProduct && (
        <div className="mt-8 text-center">
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Print {printCount} Barcode(s)
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
