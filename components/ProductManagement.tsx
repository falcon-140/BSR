
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { TrashIcon, PencilIcon, DownloadIcon } from './Icons';
import { exportToCsv } from '../helpers/csv';


const EditProductModal: React.FC<{
    product: Product;
    onClose: () => void;
    onSave: (product: Product) => void;
}> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState(product);

    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProduct = {
            ...formData,
            retailPrice: parseFloat(String(formData.retailPrice)),
            wholesalePrice: parseFloat(String(formData.wholesalePrice)),
            count: parseInt(String(formData.count), 10),
        }
        onSave(updatedProduct);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Edit Product</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="design" value={formData.design} onChange={handleChange} placeholder="Design" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="retailId" value={formData.retailId} onChange={handleChange} placeholder="Retail ID" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="wholesaleId" value={formData.wholesaleId} onChange={handleChange} placeholder="Wholesale ID" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="count" type="number" value={formData.count} onChange={handleChange} placeholder="Stock Count" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="wholesalePrice" type="number" step="0.01" value={formData.wholesalePrice} onChange={handleChange} placeholder="Wholesale Price" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="retailPrice" type="number" step="0.01" value={formData.retailPrice} onChange={handleChange} placeholder="Retail Price" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [newProduct, setNewProduct] = useState({
    design: '',
    retailId: '',
    wholesaleId: '',
    retailPrice: '',
    wholesalePrice: '',
    category: '',
    imageUrl: '',
    count: '',
  });
  const [isEditing, setIsEditing] = useState<Product | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newProduct.design ||
      !newProduct.retailId ||
      !newProduct.wholesaleId ||
      !newProduct.retailPrice ||
      !newProduct.wholesalePrice ||
      !newProduct.category ||
      !newProduct.count
    ) {
      alert('Please fill out all fields except Image URL.');
      return;
    }

    onAddProduct({
        design: newProduct.design,
        retailId: newProduct.retailId,
        wholesaleId: newProduct.wholesaleId,
        retailPrice: parseFloat(newProduct.retailPrice),
        wholesalePrice: parseFloat(newProduct.wholesalePrice),
        category: newProduct.category,
        imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${newProduct.design.replace(/\s+/g, '-')}/400/300`,
        count: parseInt(newProduct.count, 10),
    });

    setNewProduct({
      design: '',
      retailId: '',
      wholesaleId: '',
      retailPrice: '',
      wholesalePrice: '',
      category: '',
      imageUrl: '',
      count: '',
    });
  };

  const handleExport = () => {
    exportToCsv("products.csv", products);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {isEditing && <EditProductModal product={isEditing} onClose={() => setIsEditing(null)} onSave={onUpdateProduct} />}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-600 pb-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Product Database</h2>
            <button onClick={handleExport} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                <DownloadIcon className="h-4 w-4" />
                Export to CSV
            </button>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Design</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Retail ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock Count</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Retail Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.design}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.retailId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">{product.count}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.retailPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                    <button onClick={() => setIsEditing(product)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="design" value={newProduct.design} onChange={handleInputChange} placeholder="Design" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="retailId" value={newProduct.retailId} onChange={handleInputChange} placeholder="Retail ID" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="wholesaleId" value={newProduct.wholesaleId} onChange={handleInputChange} placeholder="Wholesale ID" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Category" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="count" type="number" value={newProduct.count} onChange={handleInputChange} placeholder="Initial Stock Count" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="wholesalePrice" type="number" step="0.01" value={newProduct.wholesalePrice} onChange={handleInputChange} placeholder="Wholesale Price" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="retailPrice" type="number" step="0.01" value={newProduct.retailPrice} onChange={handleInputChange} placeholder="Retail Price" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
          <input name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} placeholder="Image URL (Optional)" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;
