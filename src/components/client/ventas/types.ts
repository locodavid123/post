export interface SaleItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  table: string;
  subtotal?: number;
  tip?: number;
  total: number;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  cashReceived?: number;
  change?: number;
  time?: string;
  date?: string;
  status: "Completado" | "Cancelado";
  waiter?: string;
  saleType?: string;
  guestCount?: number;
  items?: SaleItem[];
  itemsCount?: number;
}

export const MONTH_OPTIONS = [
  "Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.",
  "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."
];

export const getIsoDate = (daysOffset: number = 0, hour: number = 12, minute: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const INITIAL_SALES: Sale[] = [];
