import { describe, it, expect } from "vitest";
import {
  calculateSubtotal,
  calculateTip,
  calculateTotal,
  validateCashPayment,
  calculateAverages,
} from "./billing";

describe("Cálculos de Facturación y POS (Billing Utils)", () => {
  describe("calculateSubtotal", () => {
    it("debe retornar 0 si no hay productos", () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it("debe calcular el subtotal correctamente con un solo producto", () => {
      expect(calculateSubtotal([{ price: 12.5, quantity: 2 }])).toBe(25.0);
    });

    it("debe calcular el subtotal correctamente con múltiples productos y decimales", () => {
      const items = [
        { price: 12.5, quantity: 2 }, // 25.00
        { price: 2.5, quantity: 3 },  // 7.50
        { price: 4.99, quantity: 1 }, // 4.99
      ];
      // 25 + 7.5 + 4.99 = 37.49
      expect(calculateSubtotal(items)).toBe(37.49);
    });
  });

  describe("calculateTip", () => {
    it("debe retornar 0 si includeTip es false", () => {
      expect(calculateTip(100, false, 10, "0")).toBe(0);
    });

    it("debe retornar 0 si el subtotal es 0 o negativo", () => {
      expect(calculateTip(0, true, 10, "0")).toBe(0);
      expect(calculateTip(-50, true, 10, "0")).toBe(0);
    });

    it("debe calcular porcentajes estándar de propina (5%, 10%, 15%)", () => {
      expect(calculateTip(100, true, 5, "0")).toBe(5.0);
      expect(calculateTip(100, true, 10, "0")).toBe(10.0);
      expect(calculateTip(100, true, 15, "0")).toBe(15.0);
      // Redondeo correcto con decimales: 32.50 * 10% = 3.25
      expect(calculateTip(32.5, true, 10, "0")).toBe(3.25);
    });

    it("debe manejar montos personalizados de propina", () => {
      expect(calculateTip(50, true, "custom", "7.50")).toBe(7.5);
      expect(calculateTip(50, true, "custom", 12)).toBe(12.0);
      // Texto inválido o vacío retorna 0
      expect(calculateTip(50, true, "custom", "abc")).toBe(0);
      expect(calculateTip(50, true, "custom", "-5")).toBe(0);
    });
  });

  describe("calculateTotal", () => {
    it("debe sumar subtotal y propina con precisión de dos decimales", () => {
      expect(calculateTotal(32.5, 3.25)).toBe(35.75);
      expect(calculateTotal(10.99, 1.1)).toBe(12.09);
    });
  });

  describe("validateCashPayment", () => {
    const total = 35.75;

    it("debe validar pago exacto", () => {
      const res = validateCashPayment(total, "35.75");
      expect(res.isInsufficient).toBe(false);
      expect(res.change).toBe(0);
      expect(res.missing).toBe(0);
      expect(res.numCash).toBe(35.75);
    });

    it("debe calcular el cambio correctamente cuando el cliente paga de más", () => {
      const res = validateCashPayment(total, "50.00");
      expect(res.isInsufficient).toBe(false);
      expect(res.change).toBe(14.25);
      expect(res.missing).toBe(0);
      expect(res.numCash).toBe(50);
    });

    it("debe alertar cuando el dinero es insuficiente y calcular el faltante", () => {
      const res = validateCashPayment(total, "20.00");
      expect(res.isInsufficient).toBe(true);
      expect(res.change).toBe(0);
      expect(res.missing).toBe(15.75);
    });

    it("debe tratar entrada vacía como insuficiente", () => {
      const res = validateCashPayment(total, "");
      expect(res.isInsufficient).toBe(true);
      expect(res.missing).toBe(35.75);
    });
  });

  describe("calculateAverages", () => {
    it("debe calcular el promedio por venta y por comensal correctamente", () => {
      const { avgPerSale, avgPerGuest } = calculateAverages(500, 5, 10);
      expect(avgPerSale).toBe(100.0);
      expect(avgPerGuest).toBe(50.0);
    });

    it("debe retornar 0 si la cantidad de ventas o comensales es cero", () => {
      const { avgPerSale, avgPerGuest } = calculateAverages(0, 0, 0);
      expect(avgPerSale).toBe(0);
      expect(avgPerGuest).toBe(0);
    });
  });
});
