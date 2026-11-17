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

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium de 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa EcoPost especial." },
  { id: 2, name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano, sazonadas con sal marina y pimentón ahumado." },
  { id: 3, name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
  { id: 4, name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
  { id: 5, name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "agotado", description: "Bizcocho tibio de chocolate relleno de fudge derretido, servido con helado de vainilla." },
  { id: 6, name: "Aros de Cebolla Crujientes", category: "Entradas", price: 5.50, stock: "disponible", description: "Aros de cebolla rebozados en panko, servidos con alioli de ajo asado." },
  { id: 7, name: "Alitas BBQ Glaseadas", category: "Entradas", price: 8.00, stock: "disponible", description: "6 alitas bañadas en salsa BBQ artesanal ahumada." },
  { id: 8, name: "Agua Mineral sin Gas", category: "Bebidas", price: 2.00, stock: "disponible", description: "Agua purificada de manantial 500ml." },
];
