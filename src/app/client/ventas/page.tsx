"use client";

import React, { useState, useEffect } from "react";
import {
  Sale,
  MONTH_OPTIONS,
  INITIAL_SALES,
  SalesFilterHeader,
  SalesTable,
} from "@/components/client/ventas";
import { ReceiptModal, ReceiptData } from "@/components/client/mesas";
import { calculateAverages } from "@/utils/billing";

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Modal para reimpresión de recibo térmico
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Filter States
  const todayDate = new Date();
  const [filterHour, setFilterHour] = useState("Todos");
  const [filterShift, setFilterShift] = useState("Todos");
  const [filterPeriod, setFilterPeriod] = useState<"Diario" | "Mensual" | "Anual">("Diario");
  const [filterDay, setFilterDay] = useState(String(todayDate.getDate()));
  const [filterMonth, setFilterMonth] = useState(String(todayDate.getMonth())); // 0-indexed
  const [filterYear, setFilterYear] = useState(String(todayDate.getFullYear()));

  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterSaleType, setFilterSaleType] = useState("Todos");
  const [filterWaiter, setFilterWaiter] = useState("Todos");
  const [filterPayment, setFilterPayment] = useState("Todos");
  const [filterCashRegister, setFilterCashRegister] = useState("Todos");
  const [filterTable, setFilterTable] = useState("Todos");
  const [filterInvoiceType, setFilterInvoiceType] = useState("Todos");

  // Fetch businessId on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.businessId) {
          setBusinessId(data.user.businessId);
        } else {
          setBusinessId("default");
        }
      })
      .catch(() => {
        setBusinessId("default");
      });
  }, []);

  // Load sales from localStorage once businessId is resolved
  useEffect(() => {
    if (!businessId) return;

    const salesKey = `ecopost_sales_${businessId}`;

    const loadSales = () => {
      const savedSales = localStorage.getItem(salesKey);
      if (savedSales) {
        try {
          setSales(JSON.parse(savedSales));
        } catch (e) {
          console.error("Error cargando ventas guardadas:", e);
        }
      } else {
        localStorage.setItem(salesKey, JSON.stringify(INITIAL_SALES));
        setSales(INITIAL_SALES);
      }
    };

    loadSales();
    setIsLoaded(true);

    // Sincronizar ventas reales desde PostgreSQL
    fetch("/api/sales")
      .then((res) => (res.ok ? res.json() : null))
      .then((dbSales) => {
        if (Array.isArray(dbSales)) {
          const mappedSales: Sale[] = dbSales.map((s: any) => ({
            id: s.invoiceNumber || s.id,
            table: s.table,
            subtotal: s.subtotal,
            tip: s.tip,
            total: s.total,
            paymentMethod: s.paymentMethod,
            cashReceived: s.cashReceived,
            change: s.change,
            date: s.createdAt,
            status: s.status,
            waiter: s.waiter || undefined,
            saleType: s.saleType || "Mesas",
            guestCount: s.guestCount || 1,
            itemsCount: s.itemsCount || 0,
          }));
          setSales(mappedSales);
          localStorage.setItem(salesKey, JSON.stringify(mappedSales));
        }
      })
      .catch((err) => console.error("Error sincronizando ventas con PostgreSQL:", err));

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === salesKey && e.newValue) {
        try {
          setSales(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Error actualizando ventas desde storage:", err);
        }
      }
    };

    const handleFocus = () => {
      loadSales();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [businessId]);

  // Sync back to localStorage when sales are modified
  useEffect(() => {
    if (isLoaded && businessId) {
      localStorage.setItem(`ecopost_sales_${businessId}`, JSON.stringify(sales));
    }
  }, [sales, isLoaded, businessId]);

  const handleCancelSale = (id: string) => {
    if (window.confirm(`¿Estás seguro de que deseas anular la factura ${id}?`)) {
      setSales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Cancelado" as const } : s))
      );

      // Actualizar estado en PostgreSQL
      fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Cancelado" }),
      }).catch((err) => console.error("Error cancelando venta en PostgreSQL:", err));
    }
  };

  // Helpers for dates
  const isTodayDate = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isYesterdayDate = (d: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  };

  const formatSaleDate = (sale: Sale) => {
    if (sale.date) {
      const d = new Date(sale.date);
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (isTodayDate(d)) return `Hoy ${timeStr}`;
      if (isYesterdayDate(d)) return `Ayer ${timeStr}`;
      return `${d.toLocaleDateString()} ${timeStr}`;
    }
    return sale.time || "";
  };

  // Main filter function
  const filterSales = (sale: Sale) => {
    // 1. Date filters
    if (sale.date) {
      const d = new Date(sale.date);
      const sYear = d.getFullYear();
      const sMonth = d.getMonth();
      const sDay = d.getDate();

      if (filterPeriod === "Diario") {
        if (sYear !== Number(filterYear) || sMonth !== Number(filterMonth) || sDay !== Number(filterDay)) {
          return false;
        }
      } else if (filterPeriod === "Mensual") {
        if (sYear !== Number(filterYear) || sMonth !== Number(filterMonth)) {
          return false;
        }
      } else if (filterPeriod === "Anual") {
        if (sYear !== Number(filterYear)) {
          return false;
        }
      }
    } else if (sale.time) {
      const isTodayMock = !sale.time.includes("Ayer");
      const isYesterdayMock = sale.time.includes("Ayer");
      const targetIsToday =
        Number(filterDay) === todayDate.getDate() &&
        Number(filterMonth) === todayDate.getMonth() &&
        Number(filterYear) === todayDate.getFullYear();
      const targetIsYesterday =
        Number(filterDay) === new Date(new Date().setDate(todayDate.getDate() - 1)).getDate() &&
        Number(filterMonth) === todayDate.getMonth() &&
        Number(filterYear) === todayDate.getFullYear();

      if (filterPeriod === "Diario") {
        if (targetIsToday && !isTodayMock) return false;
        if (targetIsYesterday && !isYesterdayMock) return false;
        if (!targetIsToday && !targetIsYesterday) return false;
      }
    }

    // 2. Status filter
    if (filterStatus !== "Todos" && sale.status !== filterStatus) return false;

    // 3. Sale Type filter
    if (filterSaleType !== "Todos" && (sale.saleType || "Mesas") !== filterSaleType) return false;

    // 4. Waiter filter
    if (filterWaiter !== "Todos" && sale.waiter !== filterWaiter) return false;

    // 5. Payment filter
    if (filterPayment !== "Todos" && sale.paymentMethod !== filterPayment) return false;

    // 6. Table filter
    if (filterTable !== "Todos" && !sale.table.toLowerCase().includes(filterTable.toLowerCase())) return false;

    return true;
  };

  const activeSales = sales.filter(filterSales);

  // Calculations
  const completedActiveSales = activeSales.filter((s) => s.status === "Completado");
  const totalAmount = completedActiveSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = completedActiveSales.length;
  const totalPersons = completedActiveSales.reduce((sum, s) => sum + (s.guestCount || 1), 0);
  const { avgPerSale: averageSaleValue, avgPerGuest: averagePersonValue } = calculateAverages(
    totalAmount,
    totalSalesCount,
    totalPersons
  );

  const handlePrintSale = (sale: Sale) => {
    const data: ReceiptData = {
      invoiceNumber: sale.id,
      table: sale.table,
      waiter: sale.waiter || "Mesero",
      guestCount: sale.guestCount || 1,
      date: formatSaleDate(sale),
      items:
        sale.items && sale.items.length > 0
          ? sale.items
          : [{ name: `Consumo ${sale.table}`, price: sale.subtotal || sale.total, quantity: 1 }],
      subtotal: sale.subtotal || sale.total,
      tip: sale.tip || 0,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.cashReceived,
      change: sale.change,
    };
    setReceiptData(data);
    setShowReceiptModal(true);
  };

  // Search filter
  const filteredSales = activeSales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      sale.id.toLowerCase().includes(query) ||
      sale.table.toLowerCase().includes(query) ||
      sale.paymentMethod.toLowerCase().includes(query)
    );
  });

  // Range description text
  const getRangeText = () => {
    const formatZero = (n: number) => String(n).padStart(2, "0");
    const dayStr = formatZero(Number(filterDay));
    const monthStr = formatZero(Number(filterMonth) + 1);
    const shortYear = String(filterYear).slice(-2);

    if (filterPeriod === "Diario") {
      return `Del ${dayStr}/${monthStr}/${shortYear} 00:00 hs al ${dayStr}/${monthStr}/${shortYear} 23:59 hs`;
    } else if (filterPeriod === "Mensual") {
      return `Mes de ${MONTH_OPTIONS[Number(filterMonth)]} ${filterYear}`;
    } else {
      return `Año ${filterYear}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Registro de Ventas</h2>
        <p className="text-sm text-zinc-400">
          Consulta de facturación, cierres de caja e ingresos del comercio.
        </p>
      </div>

      {/* Filter Header & Summary Cards */}
      <SalesFilterHeader
        filterHour={filterHour}
        setFilterHour={setFilterHour}
        filterShift={filterShift}
        setFilterShift={setFilterShift}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterDay={filterDay}
        setFilterDay={setFilterDay}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterSaleType={filterSaleType}
        setFilterSaleType={setFilterSaleType}
        filterWaiter={filterWaiter}
        setFilterWaiter={setFilterWaiter}
        filterPayment={filterPayment}
        setFilterPayment={setFilterPayment}
        filterCashRegister={filterCashRegister}
        setFilterCashRegister={setFilterCashRegister}
        filterTable={filterTable}
        setFilterTable={setFilterTable}
        filterInvoiceType={filterInvoiceType}
        setFilterInvoiceType={setFilterInvoiceType}
        rangeText={getRangeText()}
        totalRecords={activeSales.length}
        totalSalesCount={totalSalesCount}
        averageSaleValue={averageSaleValue}
        totalPersons={totalPersons}
        averagePersonValue={averagePersonValue}
        totalAmount={totalAmount}
      />

      {/* Transactions Table */}
      <SalesTable
        sales={filteredSales}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        formatSaleDate={formatSaleDate}
        onCancelSale={handleCancelSale}
        onPrintSale={handlePrintSale}
      />

      {/* ─── MODAL: TICKET TÉRMICO / REIMPRESIÓN (80mm) ─── */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptData={receiptData}
      />
    </div>
  );
}
