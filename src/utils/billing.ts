export interface OrderItemCalc {
  price: number;
  quantity: number;
}

/**
 * Calcula el subtotal de una lista de productos
 */
export function calculateSubtotal(items: OrderItemCalc[]): number {
  const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calcula la propina según sea porcentaje fijo o monto personalizado
 */
export function calculateTip(
  subtotal: number,
  includeTip: boolean,
  tipPercentage: number | "custom",
  customTipAmount: string | number
): number {
  if (!includeTip || subtotal <= 0) return 0;
  if (tipPercentage === "custom") {
    const parsed =
      typeof customTipAmount === "string" ? parseFloat(customTipAmount) : customTipAmount;
    return isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
  }
  return Math.round(((subtotal * tipPercentage) / 100) * 100) / 100;
}

/**
 * Calcula el total final con propina
 */
export function calculateTotal(subtotal: number, tip: number): number {
  return Math.round((subtotal + tip) * 100) / 100;
}

/**
 * Valida el dinero en efectivo recibido y calcula el cambio o monto faltante
 */
export function validateCashPayment(
  total: number,
  cashReceivedStr: string
): {
  numCash: number;
  isInsufficient: boolean;
  change: number;
  missing: number;
} {
  const parsed = parseFloat(cashReceivedStr);
  const numCash = isNaN(parsed) ? 0 : parsed;
  const isInsufficient = cashReceivedStr.trim() === "" || numCash < total - 0.001;
  const change = Math.max(0, Math.round((numCash - total) * 100) / 100);
  const missing = Math.max(0, Math.round((total - numCash) * 100) / 100);

  return {
    numCash,
    isInsufficient,
    change,
    missing,
  };
}

/**
 * Calcula promedios de ventas por ticket y por persona
 */
export function calculateAverages(
  totalSalesAmount: number,
  totalSalesCount: number,
  totalGuests: number
): { avgPerSale: number; avgPerGuest: number } {
  const avgPerSale =
    totalSalesCount > 0 ? Math.round((totalSalesAmount / totalSalesCount) * 100) / 100 : 0;
  const avgPerGuest =
    totalGuests > 0 ? Math.round((totalSalesAmount / totalGuests) * 100) / 100 : 0;
  return { avgPerSale, avgPerGuest };
}
