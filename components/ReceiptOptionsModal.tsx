
import React from 'react';
import { Invoice } from '../types';
import { printReceipt } from '../helpers/receipt';
import { PrinterIcon, MailIcon, MessageIcon, XIcon } from './Icons';

interface ReceiptOptionsModalProps {
    invoice: Invoice;
    onClose: () => void;
}

const ReceiptOptionsModal: React.FC<ReceiptOptionsModalProps> = ({ invoice, onClose }) => {
    
    const handlePrint = () => {
        printReceipt(invoice);
        onClose();
    };

    const handleSendEmail = () => {
        alert("Email functionality is not yet implemented.");
        // In a real app, you would open a new modal to enter an email address
        // or use the customer's saved email if available.
    };
    
    const handleSendText = () => {
        alert("Text message functionality is not yet implemented.");
        // In a real app, you would open a modal to enter a phone number
        // or use the customer's saved number if available.
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Transaction Successful</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">How would the customer like their receipt for Invoice #{invoice.id}?</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={handlePrint} 
                        className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                        <PrinterIcon className="h-6 w-6" />
                        <span className="text-lg">Print Receipt</span>
                    </button>
                    <button 
                        onClick={handleSendEmail}
                        className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                        <MailIcon className="h-6 w-6" />
                        <span className="text-lg">Send to Email</span>
                    </button>
                     <button 
                        onClick={handleSendText}
                        className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                        <MessageIcon className="h-6 w-6" />
                        <span className="text-lg">Send as Text</span>
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold">
                        No Receipt Needed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptOptionsModal;
