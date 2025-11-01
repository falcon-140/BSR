export type PaymentType = 'cash' | 'card' | 'upi';

export interface Payment {
  method: PaymentType;
  amount: number;
}

export interface Product {
  id: number;
  design: string;
  wholesaleId: string;
  retailId: string;
  retailPrice: number;
  wholesalePrice: number;
  category: string;
  imageUrl: string;
  count: number;
}

export interface CartItem extends Product {
  quantity: number;
  returnedQuantity?: number; // How many of this line item have been returned
}

export interface SoldItem {
  id: string;
  productId: number;
  design: string;
  retailId: string;
  quantity: number;
  soldPrice: number; // Price per item at the time of sale
  date: Date;
  invoiceId: string;
}

export interface Invoice {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
  wholesaleTotal: number;
  profit: number;
  payments: Payment[];
  date: Date;
  creditNoteIds?: string[]; // IDs of credit notes applied to this invoice
  customerId?: number;
  customerName?: string;
}

export interface PurchaseItem {
  productId: number;
  design: string;
  quantity: number;
  purchasePrice: number; // This is the wholesale price per item for this specific purchase
}

export interface PurchaseInvoice {
  id: string;
  supplier: string;
  items: PurchaseItem[];
  total: number;
  payments: Payment[];
  date: Date;
}

// For creating new products directly from purchase invoice
export interface NewProductPurchase {
  design: string;
  wholesaleId: string;
  retailId: string;
  retailPrice: number;
  category: string;
  imageUrl: string;
  quantity: number;
  purchasePrice: number; // This is the wholesale price
}

// For adding stock to existing products from purchase invoice
export interface ExistingProductPurchase {
  productId: number;
  quantity: number;
  purchasePrice: number;
}

export interface SavePurchasePayload {
    supplier: string;
    newItems: NewProductPurchase[];
    existingItems: ExistingProductPurchase[];
    total: number;
    payments: Payment[];
}

export interface ReturnedItem {
    productId: number;
    design: string;
    quantity: number;
    refundAmount: number; // The total amount refunded for this line item
}

export interface CreditNote {
    id: string;
    originalInvoiceId: string;
    items: ReturnedItem[];
    totalRefund: number;
    date: Date;
    reason: string;
}

export interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
}

export interface StockAdjustment {
    id: string;
    productId: number;
    productDesign: string;
    quantity: number; // Can be positive (addition) or negative (subtraction)
    reason: string;
    date: Date;
}
