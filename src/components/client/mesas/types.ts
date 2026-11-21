export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
  createdAt?: string;
}

export interface OrderRound {
  id: string;
  orderNumber?: number;
  createdAt: string;
  status?: string;
  total?: number;
  items: OrderItem[];
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  waiter?: string;
  comment?: string;
  guestCount?: number;
  orders?: OrderItem[];
  rounds?: OrderRound[];
}

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  stock: "disponible" | "agotado";
  description: string;
}

export const WAITER_OPTIONS = ["Juan M.", "Sofia G.", "Pedro P.", "María R."];

export const INITIAL_TABLES: Table[] = [
  { id: 1, number: 1, capacity: 4, status: "free" },
  { id: 2, number: 2, capacity: 2, status: "free" },
  { id: 3, number: 3, capacity: 4, status: "free" },
  { id: 4, number: 4, capacity: 6, status: "free" },
  { id: 5, number: 5, capacity: 2, status: "free" },
  { id: 6, number: 6, capacity: 4, status: "free" },
];
