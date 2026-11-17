import React from "react";
import { MONTH_OPTIONS } from "./types";

interface SalesFilterHeaderProps {
  filterHour: string;
  setFilterHour: (val: string) => void;
  filterShift: string;
  setFilterShift: (val: string) => void;
  filterPeriod: "Diario" | "Mensual" | "Anual";
  setFilterPeriod: (val: "Diario" | "Mensual" | "Anual") => void;
  filterDay: string;
  setFilterDay: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterYear: string;
  setFilterYear: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterSaleType: string;
  setFilterSaleType: (val: string) => void;
  filterWaiter: string;
  setFilterWaiter: (val: string) => void;
  filterPayment: string;
  setFilterPayment: (val: string) => void;
  filterCashRegister: string;
  setFilterCashRegister: (val: string) => void;
  filterTable: string;
  setFilterTable: (val: string) => void;
  filterInvoiceType: string;
  setFilterInvoiceType: (val: string) => void;
  rangeText: string;
  totalRecords: number;
  totalSalesCount: number;
  averageSaleValue: number;
  totalPersons: number;
  averagePersonValue: number;
  totalAmount: number;
}

export default function SalesFilterHeader({
  filterHour,
  setFilterHour,
  filterShift,
  setFilterShift,
  filterPeriod,
  setFilterPeriod,
  filterDay,
  setFilterDay,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterStatus,
  setFilterStatus,
  filterSaleType,
  setFilterSaleType,
  filterWaiter,
  setFilterWaiter,
  filterPayment,
  setFilterPayment,
  filterCashRegister,
  setFilterCashRegister,
  filterTable,
  setFilterTable,
  filterInvoiceType,
  setFilterInvoiceType,
  rangeText,
  totalRecords,
  totalSalesCount,
  averageSaleValue,
  totalPersons,
  averagePersonValue,
  totalAmount,
}: SalesFilterHeaderProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Row 1: Date filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-zinc-400 text-lg pr-1">📅</div>
        <select
          value={filterHour}
          onChange={(e) => setFilterHour(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
        >
          <option value="Todos">Hora Inicio</option>
          <option value="Mañana">06:00 AM</option>
          <option value="Tarde">12:00 PM</option>
          <option value="Noche">06:00 PM</option>
        </select>

        <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
        >
          <option value="Todos">Turno</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as "Diario" | "Mensual" | "Anual")}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[110px]"
        >
          <option value="Diario">Diario</option>
          <option value="Mensual">Mensual</option>
          <option value="Anual">Anual</option>
        </select>

        {filterPeriod === "Diario" && (
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
          >
            {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        )}

        {(filterPeriod === "Diario" || filterPeriod === "Mensual") && (
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
          >
            {MONTH_OPTIONS.map((month, idx) => (
              <option key={month} value={String(idx)}>
                {month}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
        >
          {["2024", "2025", "2026", "2027", "2028"].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: Secondary filters */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800/40">
        <div className="text-zinc-400 text-lg pr-1">⏳</div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
        >
          <option value="Todos">Estado de Venta</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          value={filterSaleType}
          onChange={(e) => setFilterSaleType(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
        >
          <option value="Todos">Tipo de Venta</option>
          <option value="Mesas">Mesas</option>
          <option value="Mostrador">Mostrador</option>
          <option value="Domicilio">Domicilio</option>
        </select>

        <select
          value={filterWaiter}
          onChange={(e) => setFilterWaiter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
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
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[125px]"
        >
          <option value="Todos">Medio de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        <select
          value={filterCashRegister}
          onChange={(e) => setFilterCashRegister(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
        >
          <option value="Todos">Caja</option>
          <option value="Principal">Caja Principal</option>
        </select>

        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
        >
          <option value="Todos">Mesa</option>
          {Array.from({ length: 15 }, (_, i) => String(i + 1)).map((num) => (
            <option key={num} value={`Mesa ${num}`}>
              Mesa {num}
            </option>
          ))}
        </select>

        <select
          value={filterInvoiceType}
          onChange={(e) => setFilterInvoiceType(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[120px]"
        >
          <option value="Todos">Facturación</option>
          <option value="Factura">Factura</option>
          <option value="Ticket">Ticket</option>
        </select>
      </div>

      {/* Row 3: Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 border-t border-zinc-800 pt-3 mt-1 text-xs text-zinc-400 gap-4">
        <div className="md:col-span-1 flex flex-col justify-center">
          <span className="italic text-zinc-300 font-medium">{rangeText}</span>
          <span className="text-zinc-500 mt-0.5">{totalRecords} registros</span>
        </div>

        <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Ventas ⓘ
          </span>
          <span className="text-lg font-bold text-white mt-0.5">{totalSalesCount}</span>
        </div>

        <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Promedio por venta ⓘ
          </span>
          <span className="text-lg font-bold text-white mt-0.5">
            ${averageSaleValue.toFixed(2)}
          </span>
        </div>

        <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Personas
          </span>
          <span className="text-lg font-bold text-white mt-0.5">{totalPersons}</span>
        </div>

        <div className="border-l border-zinc-800/80 pl-4 flex flex-col justify-center">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Promedio por persona ⓘ
          </span>
          <span className="text-lg font-bold text-white mt-0.5">
            ${averagePersonValue.toFixed(2)}
          </span>
        </div>

        <div className="md:col-span-5 flex flex-col justify-center bg-orange-500/5 rounded-xl p-3 border border-orange-500/10 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-orange-400 uppercase tracking-wider text-xs font-bold">
              Total Facturado en Período
            </span>
            <span className="text-2xl font-black text-orange-400">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
