

import React, { useState, useMemo, useEffect } from 'react';
import SalesTerminal from './components/ProductList';
import Cart from './components/Cart';
import ProductManagement from './components/ProductManagement';
import PurchaseManagement from './components/PurchaseManagement';
import BarcodeGenerator from './components/BarcodeGenerator';
import SoldItems from './components/SoldItems';
import Invoices from './components/Invoices';
import FinanceDashboard from './components/FinanceDashboard';
import CustomerManagement from './components/CustomerManagement';
import InventoryDashboard from './components/InventoryDashboard';
import ReceiptOptionsModal from './components/ReceiptOptionsModal';
import { CartItem, Product, SoldItem, Invoice, PurchaseInvoice, Payment, SavePurchasePayload, PurchaseItem, CreditNote, ReturnedItem, Customer, StockAdjustment } from './types';
import { PRODUCT_DATABASE, TAX_RATE } from './constants';
import { DollarSignIcon, BoxIcon, QrCodeIcon, ReceiptIcon, ClipboardListIcon, ChartBarIcon, TruckIcon, UsersIcon, ArchiveIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';

type View = 'billing' | 'products' | 'barcodes' | 'soldItems' | 'invoices' | 'finance' | 'purchases' | 'customers' | 'inventory';
type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('billing');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useLocalStorage<Product[]>('products', PRODUCT_DATABASE);
  const [soldItems, setSoldItems] = useLocalStorage<SoldItem[]>('soldItems', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [purchaseInvoices, setPurchaseInvoices] = useLocalStorage<PurchaseInvoice[]>('purchaseInvoices', []);
  const [creditNotes, setCreditNotes] = useLocalStorage<CreditNote[]>('creditNotes', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [stockAdjustments, setStockAdjustments] = useLocalStorage<StockAdjustment[]>('stockAdjustments', []);
  
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [receiptOptionsInvoice, setReceiptOptionsInvoice] = useState<Invoice | null>(null);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            root.classList.toggle('dark', mediaQuery.matches);
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const handleAddProduct = (product: Product) => {
    setError(null);
    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    
    if (product.count <= currentQtyInCart) {
      setError(`Not enough stock for '${product.design}'. Only ${product.count} available.`);
      return;
    }

    setCartItems(prevItems => {
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleAddProductByRetailId = (retailId: string) => {
    const product = products.find(p => p.retailId.toLowerCase() === retailId.toLowerCase());

    if (!product) {
      setError(`Product with code '${retailId}' not found.`);
      return;
    }
    handleAddProduct(product);
  };
  
  const handleAddNewProduct = (newProductData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
      const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
      const newProduct: Product = { ...newProductData, id: newId };
      return [...prevProducts, newProduct];
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setError(null);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.count) {
      setError(`Not enough stock for '${product.design}'. Only ${product.count} available.`);
      setCartItems(prevItems => prevItems.map(item => item.id === productId ? { ...item, quantity: product.count } : item));
      return;
    }

    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const processTransaction = (payments: Payment[]) => {
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const invoiceId = `INV-${Date.now()}`;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const status = totalPaid === 0 ? 'UNPAID' : (totalPaid < total ? 'PARTIALLY PAID' : 'PAID');

    // 1. Update product stock (DECREASE)
    setProducts(prevProducts => {
      const newProducts = [...prevProducts];
      cartItems.forEach(cartItem => {
        const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
          newProducts[productIndex].count -= cartItem.quantity;
        }
      });
      return newProducts;
    });

    // 2. Add to sold items log
    const newSoldItems: SoldItem[] = cartItems.map(item => ({
      id: `${Date.now()}-${item.id}`,
      productId: item.id,
      design: item.design,
      retailId: item.retailId,
      quantity: item.quantity,
      soldPrice: item.retailPrice,
      date: new Date(),
      invoiceId: invoiceId,
    }));
    setSoldItems(prev => [...prev, ...newSoldItems]);
    
    // 3. Create invoice
    const wholesaleTotal = cartItems.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);
    const profit = total - wholesaleTotal;
    const selectedCustomer = customers.find(c => c.id === parseInt(selectedCustomerId, 10));

    const newInvoice: Invoice = {
      id: invoiceId,
      items: cartItems.map(item => ({ ...item, returnedQuantity: 0 })), // Initialize returned quantity
      subtotal,
      discount,
      discountAmount,
      tax,
      total,
      wholesaleTotal,
      profit,
      payments,
      date: new Date(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // 4. Clear cart and reset state
    setCartItems([]);
    setError(null);
    setDiscount(0);
    setSelectedCustomerId('');
    alert(`Transaction completed. Invoice ${newInvoice.id} created as ${status}.`);

    if (status === 'PAID') {
        setReceiptOptionsInvoice(newInvoice);
    }
  };

  const handleDeleteSalesInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this sales invoice? This will restore the stock counts for all items on this invoice.')) {
        const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToDelete) return;

        // 1. Restore stock
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            invoiceToDelete.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.id);
                if (productIndex !== -1) {
                    updatedProducts[productIndex].count += item.quantity;
                }
            });
            return updatedProducts;
        });

        // 2. Remove sold items log
        setSoldItems(prevItems => prevItems.filter(item => item.invoiceId !== invoiceId));

        // 3. Remove invoice
        setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));
    }
  };

  const handleSavePurchaseInvoice = (payload: SavePurchasePayload) => {
    const allInvoiceItems: PurchaseItem[] = [];
    
    setProducts(prevProducts => {
        let updatedProducts = [...prevProducts];
        let nextId = updatedProducts.length > 0 ? Math.max(...updatedProducts.map(p => p.id)) + 1 : 1;

        // 1. Create new products
        payload.newItems.forEach(newItem => {
            const newProduct: Product = {
                id: nextId,
                design: newItem.design,
                wholesaleId: newItem.wholesaleId,
                retailId: newItem.retailId,
                retailPrice: newItem.retailPrice,
                wholesalePrice: newItem.purchasePrice, // Base wholesale price is the first purchase price
                category: newItem.category,
                imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${newItem.design.replace(/\s+/g, '-')}/400/300`,
                count: newItem.quantity,
            };
            updatedProducts.push(newProduct);
            allInvoiceItems.push({
                productId: nextId,
                design: newProduct.design,
                quantity: newItem.quantity,
                purchasePrice: newItem.purchasePrice,
            });
            nextId++;
        });

        // 2. Update existing product stock
        payload.existingItems.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex].count += item.quantity;
                allInvoiceItems.push({
                    productId: item.productId,
                    design: updatedProducts[productIndex].design,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                });
            }
        });

        return updatedProducts;
    });

    // 3. Create and save the purchase invoice
    const newPurchaseInvoice: PurchaseInvoice = {
        id: `PUR-${Date.now()}`,
        supplier: payload.supplier,
        items: allInvoiceItems,
        total: payload.total,
        payments: payload.payments,
        date: new Date(),
    };
    setPurchaseInvoices(prev => [newPurchaseInvoice, ...prev]);

    alert(`Purchase invoice ${newPurchaseInvoice.id} from ${payload.supplier} has been saved. New products created and stock updated.`);
  };

  const handleDeletePurchaseInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase invoice? This will reduce the stock counts for all items on this invoice.')) {
        const invoiceToDelete = purchaseInvoices.find(inv => inv.id === invoiceId);
        if (!invoiceToDelete) return;

        // 1. Reduce stock
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            invoiceToDelete.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    updatedProducts[productIndex].count = Math.max(0, updatedProducts[productIndex].count - item.quantity);
                }
            });
            return updatedProducts;
        });
        
        // 2. Remove purchase invoice
        setPurchaseInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));
    }
  };
  
  const handleProcessReturn = (invoiceId: string, returnedItems: ReturnedItem[], reason: string) => {
      // 1. Create a credit note
      const creditNoteId = `CN-${Date.now()}`;
      const totalRefund = returnedItems.reduce((acc, item) => acc + item.refundAmount, 0);
      const newCreditNote: CreditNote = {
          id: creditNoteId,
          originalInvoiceId: invoiceId,
          items: returnedItems,
          totalRefund,
          date: new Date(),
          reason,
      };
      setCreditNotes(prev => [newCreditNote, ...prev]);

      // 2. Update stock (INCREASE)
      setProducts(prevProducts => {
          const updatedProducts = [...prevProducts];
          returnedItems.forEach(item => {
              const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
              if (productIndex !== -1) {
                  updatedProducts[productIndex].count += item.quantity;
              }
          });
          return updatedProducts;
      });

      // 3. Update the original invoice to track returns
      setInvoices(prevInvoices => {
          return prevInvoices.map(inv => {
              if (inv.id === invoiceId) {
                  const updatedItems = inv.items.map(item => {
                      const returned = returnedItems.find(r => r.productId === item.id);
                      if (returned) {
                          return {
                              ...item,
                              returnedQuantity: (item.returnedQuantity || 0) + returned.quantity,
                          };
                      }
                      return item;
                  });
                  return {
                      ...inv,
                      items: updatedItems,
                      creditNoteIds: [...(inv.creditNoteIds || []), creditNoteId],
                  };
              }
              return inv;
          });
      });
      alert(`Return processed. Credit Note ${creditNoteId} created for $${totalRefund.toFixed(2)}.`);
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id'>) => {
    setCustomers(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
        const newCustomer: Customer = { ...customerData, id: newId };
        return [...prev, newCustomer];
    });
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };
  
  const handleDeleteCustomer = (customerId: number) => {
    if(window.confirm('Are you sure you want to delete this customer?')) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  const handleStockAdjustment = (productId: number, quantity: number, reason: string) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newAdjustment: StockAdjustment = {
          id: `ADJ-${Date.now()}`,
          productId: productId,
          productDesign: product.design,
          quantity: quantity,
          reason: reason,
          date: new Date(),
      };
      setStockAdjustments(prev => [newAdjustment, ...prev]);

      setProducts(prevProducts => prevProducts.map(p => 
          p.id === productId ? { ...p, count: p.count + quantity } : p
      ));

      alert(`Stock for ${product.design} adjusted by ${quantity}.`);
  };

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.retailPrice * item.quantity, 0), [cartItems]);
  const discountAmount = useMemo(() => subtotal * (discount / 100), [subtotal, discount]);
  const taxableAmount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  const tax = useMemo(() => taxableAmount * TAX_RATE, [taxableAmount]);
  const total = useMemo(() => taxableAmount + tax, [taxableAmount, tax]);

  const renderView = () => {
    switch (activeView) {
      case 'billing':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <SalesTerminal
                productDatabase={products}
                onAddProduct={handleAddProduct}
                onAddProductByRetailId={handleAddProductByRetailId}
                error={error}
                clearError={() => setError(null)}
              />
            </div>
            <div className="lg:col-span-1">
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveFromCart}
                onProcessTransaction={processTransaction}
                subtotal={subtotal}
                tax={tax}
                total={total}
                discount={discount}
                setDiscount={setDiscount}
                discountAmount={discountAmount}
              />
            </div>
          </div>
        );
      case 'products':
        return <ProductManagement 
                  products={products} 
                  onAddProduct={handleAddNewProduct} 
                  onUpdateProduct={handleUpdateProduct} 
                  onDeleteProduct={handleDeleteProduct} 
                />;
      case 'barcodes':
        return <BarcodeGenerator products={products} />;
      case 'soldItems':
        return <SoldItems items={soldItems} invoices={invoices} />;
      case 'invoices':
        return <Invoices invoices={invoices} onDeleteInvoice={handleDeleteSalesInvoice} onProcessReturn={handleProcessReturn} />;
      case 'finance':
        return <FinanceDashboard invoices={invoices} purchaseInvoices={purchaseInvoices} creditNotes={creditNotes} stockAdjustments={stockAdjustments} />;
      case 'purchases':
        return <PurchaseManagement products={products} purchaseInvoices={purchaseInvoices} onSaveInvoice={handleSavePurchaseInvoice} onDeleteInvoice={handleDeletePurchaseInvoice} />;
      case 'customers':
        return <CustomerManagement customers={customers} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'inventory':
        return <InventoryDashboard products={products} adjustments={stockAdjustments} onStockAdjustment={handleStockAdjustment} />;
      default:
        return <div>Select a view</div>;
    }
  };
  
// FIX: Updated the type of the `icon` prop to be more specific (`React.ReactElement<React.SVGProps<SVGSVGElement>>`).
// This allows TypeScript to correctly infer that `className` is a valid prop
// when using `React.cloneElement`, resolving the type error.
  const NavButton = ({ view, label, icon }: { view: View, label: string, icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 group ${
        activeView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {React.cloneElement(icon, { className: `h-6 w-6 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${activeView === view ? 'text-white' : 'text-gray-500 dark:text-gray-400'}` })}
      <span className="ml-3">{label}</span>
    </button>
  );

  const ThemeButton = ({ newTheme, label, icon }: {newTheme: Theme, label: string, icon: React.ReactNode}) => (
    <button
        onClick={() => setTheme(newTheme)}
        className={`flex-1 flex flex-col items-center p-2 rounded-md transition-colors ${theme === newTheme ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        aria-label={`Switch to ${label} mode`}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <nav className="w-56 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 tracking-wider">Vintage POS</h1>
        </div>
        <div className="flex-grow overflow-y-auto py-2">
            <NavButton view="billing" label="Billing" icon={<DollarSignIcon />} />
            <NavButton view="products" label="Products" icon={<BoxIcon />} />
            <NavButton view="inventory" label="Inventory" icon={<ArchiveIcon />} />
            <NavButton view="customers" label="Customers" icon={<UsersIcon />} />
            <NavButton view="purchases" label="Purchases" icon={<TruckIcon />} />
            <NavButton view="invoices" label="Invoices" icon={<ReceiptIcon />} />
            <NavButton view="soldItems" label="Sold Items" icon={<ClipboardListIcon />} />
            <NavButton view="barcodes" label="Barcodes" icon={<QrCodeIcon />} />
            <NavButton view="finance" label="Finance" icon={<ChartBarIcon />} />
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1.5 flex items-center justify-center space-x-1">
                <ThemeButton newTheme="light" label="Light" icon={<SunIcon className="h-5 w-5"/>}/>
                <ThemeButton newTheme="dark" label="Dark" icon={<MoonIcon className="h-5 w-5"/>}/>
                <ThemeButton newTheme="system" label="System" icon={<ComputerDesktopIcon className="h-5 w-5"/>}/>
            </div>
        </div>
      </nav>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-8">
                {renderView()}
            </div>
        </main>
      </div>

      {receiptOptionsInvoice && (
        <ReceiptOptionsModal 
            invoice={receiptOptionsInvoice} 
            onClose={() => setReceiptOptionsInvoice(null)}
        />
      )}
    </div>
  );
};

export default App;