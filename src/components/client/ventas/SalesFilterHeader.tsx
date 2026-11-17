import React from "react";
import {
  Calendar,
  Filter,
  ShoppingBag,
  TrendingUp,
  Users,
  User,
  DollarSign,
} from "lucide-react";
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
    <div className="bg-[#12151e] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Row 1: Date filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider pr-1">
          <Calendar size={15} className="text-orange-400" />
          <span>Fecha:</span>
        </div>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as "Diario" | "Mensual" | "Anual")}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
        >
          <option value="Diario">Diario</option>
          <option value="Mensual">Mensual</option>
          <option value="Anual">Anual</option>
        </select>

        {filterPeriod === "Diario" && (
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
          >
            {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
              <option key={day} value={day}>
                Día {day}
              </option>
            ))}
          </select>
        )}

        {(filterPeriod === "Diario" || filterPeriod === "Mensual") && (
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
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
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all"
        >
          {["2024", "2025", "2026", "2027", "2028"].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filterHour}
          onChange={(e) => setFilterHour(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
        >
          <option value="Todos">Toda hora</option>
          <option value="Mañana">06:00 AM</option>
          <option value="Tarde">12:00 PM</option>
          <option value="Noche">06:00 PM</option>
        </select>

        <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all min-w-[100px]"
        >
          <option value="Todos">Todo turno</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>
      </div>

      {/* Row 2: Secondary filters */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider pr-1">
          <Filter size={15} className="text-orange-400" />
          <span>Filtros:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 transition-all"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          value={filterSaleType}
          onChange={(e) => setFilterSaleType(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 transition-all"
        >
          <option value="Todos">Todos los Tipos</option>
          <option value="Mesas">Mesas</option>
          <option value="Mostrador">Mostrador</option>
          <option value="Domicilio">Domicilio</option>
        </select>

        <select
          value={filterWaiter}
          onChange={(e) => setFilterWaiter(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 transition-all"
        >
          <option value="Todos">Cualquier Mesero</option>
          <option value="Juan M.">Juan M.</option>
          <option value="Sofia G.">Sofia G.</option>
          <option value="Pedro P.">Pedro P.</option>
          <option value="María R.">María R.</option>
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 transition-all"
        >
          <option value="Todos">Cualquier Pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="bg-zinc-950/80 border border-white/[0.08] text-zinc-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-orange-500 transition-all"
        >
          <option value="Todos">Todas las Mesas</option>
          {Array.from({ length: 15 }, (_, i) => String(i + 1)).map((num) => (
            <option key={num} value={`Mesa ${num}`}>
              Mesa {num}
            </option>
          ))}
        </select>
      </div>

      {/* Row 3: Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/[0.06] pt-4 gap-3">
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
          <span className="text-[11px] text-zinc-400 font-medium">{rangeText}</span>
          <span className="text-xs text-orange-400 font-bold mt-0.5">{totalRecords} registros</span>
        </div>

        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            <span>Ventas</span>
            <ShoppingBag size={14} className="text-orange-400" />
          </div>
          <span className="text-xl font-black text-white mt-1">{totalSalesCount}</span>
        </div>

        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            <span>Ticket Prom.</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="text-xl font-black text-white mt-1">
            ${averageSaleValue.toFixed(2)}
          </span>
        </div>

        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            <span>Comensales</span>
            <Users size={14} className="text-blue-400" />
          </div>
          <span className="text-xl font-black text-white mt-1">{totalPersons}</span>
        </div>

        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            <span>Gasto / Pers.</span>
            <User size={14} className="text-purple-400" />
          </div>
          <span className="text-xl font-black text-white mt-1">
            ${averagePersonValue.toFixed(2)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-zinc-950 border border-orange-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-400 text-[11px] uppercase font-bold tracking-wider">
            <span>Total Recaudado</span>
            <DollarSign size={15} />
          </div>
          <span className="text-2xl font-black text-orange-400 mt-1">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
