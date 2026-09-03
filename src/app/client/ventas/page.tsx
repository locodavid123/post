"use client";

import React, { useState, useEffect } from "react";

interface Sale {
  id: string;
  table: string;
  total: number;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  time?: string;
  date?: string;
  status: "Completado" | "Cancelado";
  waiter?: string;
  saleType?: string;
  guestCount?: number;
}

const getIsoDate = (daysOffset: number = 0, hour: number = 12, minute: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const INITIAL_SALES: Sale[] = [
  { id: "FAC-1002", table: "Mesa 10", total: 84.00, paymentMethod: "Tarjeta", date: getIsoDate(0, 10, 15), status: "Completado", waiter: "Juan M.", guestCount: 3, saleType: "Mesas" },
  { id: "FAC-1001", table: "Mesa 2", total: 18.50, paymentMethod: "Efectivo", date: getIsoDate(0, 9, 48), status: "Completado", waiter: "Sofia G.", guestCount: 2, saleType: "Mesas" },
  { id: "FAC-1000", table: "Mesa 5", total: 42.00, paymentMethod: "Transferencia", date: getIsoDate(0, 9, 30), status: "Completado", waiter: "Juan M.", guestCount: 4, saleType: "Mesas" },
  { id: "FAC-0999", table: "Mesa 1", total: 65.00, paymentMethod: "Tarjeta", date: getIsoDate(-1, 23, 45), status: "Completado", waiter: "Sofia G.", guestCount: 2, saleType: "Mesas" },
  { id: "FAC-0998", table: "Mesa 3", total: 124.20, paymentMethod: "Tarjeta", date: getIsoDate(-1, 23, 20), status: "Completado", waiter: "Pedro P.", guestCount: 5, saleType: "Mesas" },
  { id: "FAC-0997", table: "Mesa 12", total: 38.00, paymentMethod: "Efectivo", date: getIsoDate(-1, 22, 10), status: "Completado", waiter: "María R.", guestCount: 1, saleType: "Mesas" },
];

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Load sales from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem("ecopost_sales");
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      localStorage.setItem("ecopost_sales", JSON.stringify(INITIAL_SALES));
    }
    setIsLoaded(true);
  }, []);

  // Sync back to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ecopost_sales", JSON.stringify(sales));
    }
  }, [sales, isLoaded]);

  const handleCancelSale = (id: string) => {
    if (window.confirm(`¿Estás seguro de que deseas anular la factura ${id}?`)) {
      setSales(prev => prev.map(s => s.id === id ? { ...s, status: "Cancelado" as const } : s));
    }
  };

  // Helpers for dates
  const isTodayDate = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isYesterdayDate = (d: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() &&
           d.getMonth() === yesterday.getMonth() &&
           d.getFullYear() === yesterday.getFullYear();
  };

  const formatSaleDate = (sale: Sale) => {
    if (sale.date) {
      const d = new Date(sale.date);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      // Fallback for mock data (Ayer vs Hoy)
      const isTodayMock = !sale.time.includes("Ayer");
      const isYesterdayMock = sale.time.includes("Ayer");
      const targetIsToday = Number(filterDay) === todayDate.getDate() && Number(filterMonth) === todayDate.getMonth() && Number(filterYear) === todayDate.getFullYear();
      const targetIsYesterday = Number(filterDay) === (new Date(new Date().setDate(todayDate.getDate() - 1))).getDate() && Number(filterMonth) === todayDate.getMonth() && Number(filterYear) === todayDate.getFullYear();
      
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
  const completedActiveSales = activeSales.filter(s => s.status === "Completado");
  const totalAmount = completedActiveSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = completedActiveSales.length;
  const averageSaleValue = totalSalesCount > 0 ? totalAmount / totalSalesCount : 0;
  const totalPersons = completedActiveSales.reduce((sum, s) => sum + (s.guestCount || 1), 0);
  const averagePersonValue = totalPersons > 0 ? totalAmount / totalPersons : 0;

  // Search filter (on top of all dropdown filters)
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
    const formatZero = (n: number) => String(n).padStart(2, '0');
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
        <p className="text-sm text-zinc-400">Consulta de facturación, cierres de caja e ingresos del comercio.</p>
      </div>

      {/* Unified Filter Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
        {/* Row 1: Date filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-zinc-400 text-lg pr-1">📅</div>
          <select
            value={filterHour}
            onChange={(e) => setFilterHour(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
          >
            <option value="Todos">Hora Inicio</option>
            <option value="Mañana">06:00 AM</option>
            <option value="Tarde">12:00 PM</option>
            <option value="Noche">06:00 PM</option>
          </select>

          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
          >
            <option value="Todos">Turno</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>

          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
          >
            <option value="Diario">Diario</option>
            <option value="Mensual">Mensual</option>
            <option value="Anual">Anual</option>
          </select>

          {filterPeriod === "Diario" && (
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
            >
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}

          {(filterPeriod === "Diario" || filterPeriod === "Mensual") && (
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
            >
              {MONTH_OPTIONS.map((month, idx) => (
                <option key={month} value={String(idx)}>{month}</option>
              ))}
            </select>
          )}

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
          >
            {["2024", "2025", "2026", "2027", "2028"].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Secondary filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800/40">
          <div className="text-zinc-400 text-lg pr-1">⏳</div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
          >
            <option value="Todos">Estado de Venta</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={filterSaleType}
            onChange={(e) => setFilterSaleType(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
          >
            <option value="Todos">Tipo de Venta</option>
            <option value="Mesas">Mesas</option>
            <option value="Mostrador">Mostrador</option>
            <option value="Domicilio">Domicilio</option>
          </select>

          <select
            value={filterWaiter}
            onChange={(e) => setFilterWaiter(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
          >
            <option value="Todos">Cam / Rep</option>
            <option value="Juan M.">Juan M.</option>
            <option value="Sofia G.">Sofia G.</option>
            <option value="Pedro P.">Pedro P.</option>
            <option value="María R.">María R.</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
          >
            <option value="Todos">Medio de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>

          <select
            value={filterCashRegister}
            onChange={(e) => setFilterCashRegister(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
          >
            <option value="Todos">Caja</option>
            <option value="Principal">Caja Principal</option>
          </select>

          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
          >
            <option value="Todos">Mesa</option>
            {Array.from({ length: 15 }, (_, i) => String(i + 1)).map(num => (
              <option key={num} value={`Mesa ${num}`}>Mesa {num}</option>
            ))}
          </select>

          <select
            value={filterInvoiceType}
            onChange={(e) => setFilterInvoiceType(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[120px]"
          >
            <option value="Todos">Facturación</option>
            <option value="Factura">Factura</option>
            <option value="Ticket">Ticket</option>
          </select>
        </div>

        {/* Row 3: Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 border-t border-zinc-800 pt-3 mt-1 text-xs text-zinc-400 gap-4">
          <div className="md:col-span-1 flex flex-col justify-center">
            <span className="italic text-zinc-450 font-medium">{getRangeText()}</span>
            <span className="text-zinc-500 mt-0.5">{activeSales.length} registros</span>
          </div>

          <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Ventas ⓘ</span>
            <span className="text-lg font-bold text-white mt-0.5">{totalSalesCount}</span>
          </div>

          <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Promedio por venta ⓘ</span>
            <span className="text-lg font-bold text-white mt-0.5">${averageSaleValue.toFixed(2)}</span>
          </div>

          <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Personas</span>
            <span className="text-lg font-bold text-white mt-0.5">{totalPersons}</span>
          </div>

          <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Promedio por persona ⓘ</span>
            <span className="text-lg font-bold text-white mt-0.5">${averagePersonValue.toFixed(2)}</span>
          </div>

          <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center bg-orange-500/5 rounded-xl p-2 border border-orange-500/10">
            <span className="text-orange-400/80 uppercase tracking-wider text-[10px] font-bold">Total</span>
            <span className="text-2xl font-extrabold text-orange-400 mt-0.5">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Transacciones Filtradas</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar factura o mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs px-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none w-48 transition-all placeholder:text-zinc-655"
            />
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-3 py-2 rounded-xl transition-all">
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 italic text-sm">
              No se encontraron facturas con ese criterio.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">ID Factura</th>
                  <th className="p-4">Origen</th>
                  <th className="p-4">Hora</th>
                  <th className="p-4">Método de Pago</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 pr-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-900/50 transition-all">
                    <td className="p-4 pl-6 font-semibold text-white">{sale.id}</td>
                    <td className="p-4 text-zinc-300">{sale.table}</td>
                    <td className="p-4 text-xs text-zinc-500">{formatSaleDate(sale)}</td>
                    <td className="p-4 text-xs">
                      <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700/50 font-medium">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`font-semibold ${
                        sale.status === "Completado" ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        ● {sale.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-white">${sale.total.toFixed(2)}</td>
                    <td className="p-4 pr-6 text-center">
                      {sale.status === "Completado" ? (
                        <button
                          onClick={() => handleCancelSale(sale.id)}
                          className="text-xs text-rose-500 hover:text-rose-400 hover:underline font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg transition"
                        >
                          Anular
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-650 italic">Anulada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const MONTH_OPTIONS = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];
