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

export const INITIAL_SALES: Sale[] = [
  { id: "FAC-1002", table: "Mesa 10", total: 84.00, paymentMethod: "Tarjeta", date: getIsoDate(0, 10, 15), status: "Completado", waiter: "Juan M.", guestCount: 3, saleType: "Mesas" },
  { id: "FAC-1001", table: "Mesa 2", total: 18.50, paymentMethod: "Efectivo", date: getIsoDate(0, 9, 48), status: "Completado", waiter: "Sofia G.", guestCount: 2, saleType: "Mesas" },
  { id: "FAC-1000", table: "Mesa 5", total: 42.00, paymentMethod: "Transferencia", date: getIsoDate(0, 9, 30), status: "Completado", waiter: "Juan M.", guestCount: 4, saleType: "Mesas" },
  { id: "FAC-0999", table: "Mesa 1", total: 65.00, paymentMethod: "Tarjeta", date: getIsoDate(-1, 23, 45), status: "Completado", waiter: "Sofia G.", guestCount: 2, saleType: "Mesas" },
  { id: "FAC-0998", table: "Mesa 3", total: 124.20, paymentMethod: "Tarjeta", date: getIsoDate(-1, 23, 20), status: "Completado", waiter: "Pedro P.", guestCount: 5, saleType: "Mesas" },
  { id: "FAC-0997", table: "Mesa 12", total: 38.00, paymentMethod: "Efectivo", date: getIsoDate(-1, 22, 10), status: "Completado", waiter: "María R.", guestCount: 1, saleType: "Mesas" },
];
