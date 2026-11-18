export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  stock: "disponible" | "agotado";
  description: string;
}

export interface Category {
  key: string;
  name: string;
  icon: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  { name: "Hamburguesas", key: "Hamburguesas", icon: "🍔" },
  { name: "Entradas", key: "Entradas", icon: "🍟" },
  { name: "Bebidas", key: "Bebidas", icon: "🍺" },
  { name: "Postres", key: "Postres", icon: "🍰" },
];

export const INITIAL_PRODUCTS: Product[] = [];
