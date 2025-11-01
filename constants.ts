import { Product } from './types';

// This simulates a product database, perhaps originally from an Excel file.
// The 'id' is used as the scannable product code.
export const PRODUCT_DATABASE: Product[] = [
  { id: 1, design: 'Classic White T-Shirt', retailId: 'R-TS-CW', wholesaleId: 'W-TS-CW', retailPrice: 15.99, wholesalePrice: 7.50, category: 'Apparel', imageUrl: 'https://picsum.photos/seed/tshirt/400/300', count: 100 },
  { id: 2, design: 'Denim Jeans', retailId: 'R-JN-DN', wholesaleId: 'W-JN-DN', retailPrice: 49.99, wholesalePrice: 22.00, category: 'Apparel', imageUrl: 'https://picsum.photos/seed/jeans/400/300', count: 50 },
  { id: 3, design: 'Leather Wallet', retailId: 'R-AC-LW', wholesaleId: 'W-AC-LW', retailPrice: 25.00, wholesalePrice: 11.25, category: 'Accessories', imageUrl: 'https://picsum.photos/seed/wallet/400/300', count: 75 },
  { id: 4, design: 'Canvas Backpack', retailId: 'R-AC-CB', wholesaleId: 'W-AC-CB', retailPrice: 39.95, wholesalePrice: 18.00, category: 'Accessories', imageUrl: 'https://picsum.photos/seed/backpack/400/300', count: 40 },
  { id: 5, design: 'Running Sneakers', retailId: 'R-FW-RS', wholesaleId: 'W-FW-RS', retailPrice: 79.50, wholesalePrice: 35.00, category: 'Footwear', imageUrl: 'https://picsum.photos/seed/sneakers/400/300', count: 60 },
  { id: 6, design: 'Black Coffee Mug', retailId: 'R-HW-CM', wholesaleId: 'W-HW-CM', retailPrice: 8.99, wholesalePrice: 3.50, category: 'Homeware', imageUrl: 'https://picsum.photos/seed/mug/400/300', count: 120 },
  { id: 7, design: 'Designer Sunglasses', retailId: 'R-AC-DS', wholesaleId: 'W-AC-DS', retailPrice: 120.00, wholesalePrice: 55.00, category: 'Accessories', imageUrl: 'https://picsum.photos/seed/glasses/400/300', count: 25 },
  { id: 8, design: 'Wireless Headphones', retailId: 'R-EL-WH', wholesaleId: 'W-EL-WH', retailPrice: 99.99, wholesalePrice: 48.75, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/headphones/400/300', count: 30 },
  { id: 9, design: 'Hardcover Notebook', retailId: 'R-ST-HN', wholesaleId: 'W-ST-HN', retailPrice: 12.49, wholesalePrice: 5.00, category: 'Stationery', imageUrl: 'https://picsum.photos/seed/notebook/400/300', count: 150 },
];

export const TAX_RATE = 0.10; // 10% sales tax
