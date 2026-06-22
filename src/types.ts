export interface Product {
  id: string;
  name: string;
  brand: string;
  size: number | string;
  condition: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  stock: number;
  createdAt?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  size?: number | string;
  qty: number;
}

export interface Order {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: CartItem[];
  totalPrice: number;
  orderDate: number;
  status: 'pending' | 'confirmed' | 'shipped';
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
