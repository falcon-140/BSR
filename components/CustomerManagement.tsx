
import React, { useState } from 'react';
import { Customer } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface EditCustomerModalProps {
    customer: Customer;
    onClose: () => void;
    onSave: (customer: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customer, onClose, onSave }) => {
    const [formData, setFormData] = useState(customer);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Edit Customer</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface CustomerManagementProps {
    customers: Customer[];
    onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (customerId: number) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) => {
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name) {
            alert('Customer name is required.');
            return;
        }
        onAddCustomer(newCustomer);
        setNewCustomer({ name: '', phone: '', email: '' });
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {editingCustomer && <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSave={onUpdateCustomer} />}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Customer List</h2>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {customers.map(customer => (
                                <tr key={customer.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{customer.phone}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                                    <td className="px-4 py-3 text-sm space-x-2">
                                        <button onClick={() => setEditingCustomer(customer)} className="text-blue-600 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"><PencilIcon className="h-5 w-5" /></button>
                                        <button onClick={() => onDeleteCustomer(customer.id)} className="text-red-600 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-4">Add New Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={newCustomer.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" required />
                    <input name="phone" value={newCustomer.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    <input name="email" type="email" value={newCustomer.email} onChange={handleInputChange} placeholder="Email Address" className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 rounded" />
                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Add Customer</button>
                </form>
            </div>
        </div>
    );
};

export default CustomerManagement;
