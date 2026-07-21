"use client";

import React, { useState, useEffect } from "react";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  waiter?: string;
  comment?: string;
  guestCount?: number;
  orders?: OrderItem[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: "disponible" | "agotado";
  description: string;
}

const INITIAL_TABLES: Table[] = [
  { 
    id: 1, 
    number: 1, 
    capacity: 4, 
    status: "occupied", 
    waiter: "Juan M.", 
    guestCount: 3,
    orders: [
      { productId: 1, name: "Hamburguesa EcoClassic", price: 12.50, quantity: 2 },
      { productId: 4, name: "Refresco de Cola de la Casa", price: 2.50, quantity: 3 }
    ]
  },
  { id: 2, number: 2, capacity: 2, status: "free" },
  { id: 3, number: 3, capacity: 6, status: "free" },
  { id: 4, number: 4, capacity: 4, status: "free" },
  { id: 5, number: 5, capacity: 4, status: "free" },
  { 
    id: 6, 
    number: 6, 
    capacity: 4, 
    status: "occupied", 
    waiter: "Sofia G.", 
    guestCount: 1,
    orders: [
      { productId: 3, name: "Cerveza Artesanal IPA", price: 5.00, quantity: 2 }
    ]
  },
];

const WAITER_OPTIONS = ["Juan M.", "Sofia G.", "Pedro P.", "María R."];

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [activeTableId, setActiveTableId] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add table modal state
  const [newCapacity, setNewCapacity] = useState(4);

  // Side panel state
  const [guestCount, setGuestCount] = useState(1);
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [comment, setComment] = useState("");

  // Product addition state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProductToOrder, setSelectedProductToOrder] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Checkout checkout state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");

  const currentTable = tables.find((t) => t.id === activeTableId) ?? tables[0];
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

  // Load from localStorage on mount
  useEffect(() => {
    // 1. Load tables
    const savedTables = localStorage.getItem("ecopost_tables");
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      localStorage.setItem("ecopost_tables", JSON.stringify(INITIAL_TABLES));
    }

    // 2. Load available products
    const savedProducts = localStorage.getItem("ecopost_products");
    if (savedProducts) {
      setAvailableProducts(JSON.parse(savedProducts));
    } else {
      const fallbackProducts: Product[] = [
        { id: 1, name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium de 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa EcoPost especial." },
        { id: 2, name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano, sazonadas con sal marina y pimentón ahumado." },
        { id: 3, name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
        { id: 4, name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
        { id: 5, name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "agotado", description: "Bizcocho tibio de chocolate relleno de fudge derretido, servido con helado de vainilla." },
        { id: 6, name: "Aros de Cebolla Crujientes", category: "Entradas", price: 5.50, stock: "disponible", description: "Aros de cebolla rebozados en panko, servidos con alioli de ajo asado." },
      ];
      setAvailableProducts(fallbackProducts);
      localStorage.setItem("ecopost_products", JSON.stringify(fallbackProducts));
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when tables change (after load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ecopost_tables", JSON.stringify(tables));
    }
  }, [tables, isLoaded]);

  // Set default form values when active table changes
  useEffect(() => {
    if (currentTable) {
      setGuestCount(currentTable.guestCount ?? 1);
      setSelectedWaiter(currentTable.waiter ?? "");
      setComment(currentTable.comment ?? "");
    }
  }, [activeTableId, currentTable]);

  // --- Actions ---
  const handleSelectTable = (id: number) => {
    setActiveTableId(id);
  };

  const handleOpenTable = () => {
    if (!selectedWaiter) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? { ...t, status: "occupied", waiter: selectedWaiter, guestCount, comment, orders: [] }
          : t
      )
    );
  };

  // Close/reset table without billing
  const handleCloseTable = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? { ...t, status: "free", waiter: undefined, guestCount: undefined, comment: undefined, orders: undefined }
          : t
      )
    );
    setSelectedWaiter("");
    setGuestCount(1);
    setComment("");
  };

  const handleAddTable = () => {
    const maxNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0;
    const maxId = tables.length > 0 ? Math.max(...tables.map((t) => t.id)) : 0;
    const newTable: Table = {
      id: maxId + 1,
      number: maxNumber + 1,
      capacity: newCapacity,
      status: "free",
    };
    setTables((prev) => [...prev, newTable]);
    setActiveTableId(newTable.id);
    setNewCapacity(4);
    setShowAddModal(false);
  };

  const handleDeleteTable = (id: number) => {
    const remaining = tables.filter((t) => t.id !== id);
    setTables(remaining);
    if (activeTableId === id) {
      setActiveTableId(remaining[0]?.id ?? 0);
    }
    setShowDeleteConfirm(null);
  };

  // Order Items logic
  const handleAddProductToTable = () => {
    if (!selectedProductToOrder) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableId) return t;

        const currentOrders = t.orders || [];
        const existingItem = currentOrders.find((o) => o.productId === selectedProductToOrder.id);

        let updatedOrders;
        if (existingItem) {
          updatedOrders = currentOrders.map((o) =>
            o.productId === selectedProductToOrder.id
              ? { ...o, quantity: o.quantity + orderQuantity }
              : o
          );
        } else {
          updatedOrders = [
            ...currentOrders,
            {
              productId: selectedProductToOrder.id,
              name: selectedProductToOrder.name,
              price: selectedProductToOrder.price,
              quantity: orderQuantity,
            },
          ];
        }

        return { ...t, orders: updatedOrders };
      })
    );

    setShowAddProductModal(false);
    setSelectedProductToOrder(null);
    setOrderQuantity(1);
  };

  const handleUpdateOrderItemQuantity = (productId: number, newQty: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableId) return t;

        const currentOrders = t.orders || [];
        const updatedOrders = currentOrders
          .map((o) => (o.productId === productId ? { ...o, quantity: newQty } : o))
          .filter((o) => o.quantity > 0);

        return { ...t, orders: updatedOrders };
      })
    );
  };

  // Billing (Checkout) logic
  const processCheckout = () => {
    if (!currentTable || !currentTable.orders || currentTable.orders.length === 0) return;

    const totalAmount = currentTable.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Save to localStorage.getItem("ecopost_sales")
    const savedSalesStr = localStorage.getItem("ecopost_sales");
    let salesList = [];
    if (savedSalesStr) {
      salesList = JSON.parse(savedSalesStr);
    } else {
      salesList = [
        { id: "FAC-1002", table: "Mesa 10", total: 84.00, paymentMethod: "Tarjeta", time: "10:15 AM", status: "Completado" },
        { id: "FAC-1001", table: "Mesa 2", total: 18.50, paymentMethod: "Efectivo", time: "09:48 AM", status: "Completado" },
        { id: "FAC-1000", table: "Mesa 5", total: 42.00, paymentMethod: "Transferencia", time: "09:30 AM", status: "Completado" },
      ];
    }

    const nextFacNum = salesList.length > 0
      ? Math.max(...salesList.map((s: any) => {
          const num = parseInt(s.id.replace("FAC-", ""));
          return isNaN(num) ? 1000 : num;
        })) + 1
      : 1000;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSale = {
      id: `FAC-${nextFacNum}`,
      table: `Mesa ${currentTable.number}`,
      total: totalAmount,
      paymentMethod: checkoutPaymentMethod,
      time: timeStr,
      status: "Completado"
    };

    localStorage.setItem("ecopost_sales", JSON.stringify([newSale, ...salesList]));

    // 2. Free the table
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? { ...t, status: "free", waiter: undefined, guestCount: undefined, comment: undefined, orders: undefined }
          : t
      )
    );

    setSelectedWaiter("");
    setGuestCount(1);
    setComment("");
    setShowCheckoutModal(false);
  };

  const tableBillAmount = currentTable?.orders
    ? currentTable.orders.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ─── Top Tab Bar ─── */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["Mesas", "Mostrador", "Domicilio +", "Mostrador express"].map((tab, i) => (
              <button
                key={tab}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  i === 0
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs uppercase tracking-wide text-zinc-400">
              Salón
            </span>
            <span className="rounded-full bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white">
              {occupiedCount}/{tables.length}
            </span>
          </div>
        </div>
      </section>

      {/* ─── Main Grid ─── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* ─── Table Grid ─── */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Mesas del Salón</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {occupiedCount} ocupadas · {tables.length - occupiedCount} disponibles
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-orange-500/20"
            >
              <span className="text-lg leading-none">＋</span>
              Agregar Mesa
            </button>
          </div>

          {/* Grid */}
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3">
              <span className="text-5xl">🪑</span>
              <p className="text-sm font-medium">No hay mesas configuradas</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 hover:bg-orange-500/20 transition"
              >
                Agregar primera mesa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {tables.map((table) => (
                <div key={table.id} className="relative group">
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(table.id); }}
                    title="Eliminar mesa"
                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    ×
                  </button>

                  {/* Table button */}
                  <button
                    onClick={() => handleSelectTable(table.id)}
                    className={`w-full aspect-square rounded-2xl border-2 text-xl font-bold transition-all ${
                      activeTableId === table.id
                        ? "border-orange-500 ring-2 ring-orange-500/30 bg-emerald-500 text-white scale-105 shadow-lg"
                        : table.status === "occupied"
                        ? "border-orange-500/60 bg-orange-500/15 text-orange-300 hover:border-orange-500"
                        : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {table.number}
                  </button>

                  {/* Status dot */}
                  <div className={`mt-1.5 mx-auto w-1.5 h-1.5 rounded-full ${
                    table.status === "occupied" ? "bg-orange-500" : "bg-emerald-500"
                  }`} />
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 mt-6 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/60" />
              Disponible
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500/60" />
              Ocupada
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Seleccionada
            </div>
          </div>
        </section>

        {/* ─── Side Panel ─── */}
        {currentTable && (
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur flex flex-col gap-5">
            {/* Mesa Header */}
            <div className={`rounded-xl px-5 py-4 ${
              currentTable.status === "occupied"
                ? "bg-orange-500/20 border border-orange-500/30"
                : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
            }`}>
              <p className={`text-xs uppercase tracking-widest font-semibold ${
                currentTable.status === "occupied" ? "text-orange-300" : "text-emerald-950/70"
              }`}>
                MESA
              </p>
              <h2 className={`mt-1 text-4xl font-bold ${
                currentTable.status === "occupied" ? "text-orange-300" : "text-emerald-950"
              }`}>
                {currentTable.number}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold ${
                  currentTable.status === "occupied" ? "text-orange-400" : "text-emerald-900/70"
                }`}>
                  {currentTable.status === "occupied" ? "● Ocupada" : "● Disponible"}
                </span>
                <span className={`text-xs ${
                  currentTable.status === "occupied" ? "text-orange-500/60" : "text-emerald-900/50"
                }`}>
                  · Cap. {currentTable.capacity}
                </span>
              </div>
            </div>

            {/* Personas */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Personas</label>
              <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                <button
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition flex items-center justify-center"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-lg font-bold text-white">{guestCount}</span>
                <button
                  onClick={() => setGuestCount(Math.min(currentTable.capacity, guestCount + 1))}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] text-zinc-650">Máx. {currentTable.capacity} personas</p>
            </div>

            {/* Mesero */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Mesero</label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
              >
                <option value="">Seleccionar mesero</option>
                {WAITER_OPTIONS.map((w) => (
                  <option key={w} value={w} className="bg-zinc-950">{w}</option>
                ))}
              </select>
            </div>

            {/* Comentario */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-white">Comentario</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Ej: alergia al maní, cumpleaños…"
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-650"
              />
            </div>

            {/* Consumo de la Mesa */}
            {currentTable.status === "occupied" && (
              <div className="flex flex-col gap-2.5 border-t border-zinc-800 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-white">Consumo de la Mesa</label>
                  <button
                    onClick={() => {
                      const firstAvailable = availableProducts.find(p => p.stock === "disponible") || null;
                      setSelectedProductToOrder(firstAvailable);
                      setOrderQuantity(1);
                      setShowAddProductModal(true);
                    }}
                    className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-all"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                {(!currentTable.orders || currentTable.orders.length === 0) ? (
                  <p className="text-xs text-zinc-500 italic py-2 text-center">No hay consumos registrados aún.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {currentTable.orders.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center p-2 bg-zinc-950/60 rounded-xl border border-zinc-850">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white truncate max-w-[140px]">{item.name}</span>
                          <span className="text-[10px] text-zinc-500">${item.price.toFixed(2)} c/u</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateOrderItemQuantity(item.productId, item.quantity - 1)}
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[10px] font-bold text-zinc-455 hover:text-white transition flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="text-xs font-bold text-white min-w-3 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateOrderItemQuantity(item.productId, item.quantity + 1)}
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[10px] font-bold text-zinc-455 hover:text-white transition flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-orange-400 w-14 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {currentTable.status === "free" ? (
                <button
                  onClick={handleOpenTable}
                  disabled={!selectedWaiter}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition shadow-lg shadow-orange-500/20"
                >
                  Abrir mesa
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCheckoutPaymentMethod("Efectivo");
                      setShowCheckoutModal(true);
                    }}
                    disabled={!currentTable.orders || currentTable.orders.length === 0}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition shadow-lg shadow-emerald-500/20"
                  >
                    Cobrar Cuenta (${tableBillAmount.toFixed(2)})
                  </button>
                  <button
                    onClick={handleCloseTable}
                    className="w-full rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 text-rose-400 px-4 py-2.5 text-xs font-semibold transition"
                  >
                    Liberar (Sin Cobrar)
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDeleteConfirm(currentTable.id)}
                className="w-full rounded-xl bg-zinc-850 hover:bg-zinc-700 text-zinc-500 hover:text-white px-4 py-2 text-[10px] font-semibold transition border border-zinc-800"
              >
                Eliminar mesa {currentTable.number}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Add Table Modal ─── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">Agregar Mesa</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Se agregará como Mesa #{tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Capacidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewCapacity(Math.max(1, newCapacity - 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-bold text-white">{newCapacity}</span>
                  <button
                    onClick={() => setNewCapacity(Math.min(20, newCapacity + 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 text-center mt-1">personas máximo</p>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Presets rápidos</p>
                <div className="flex gap-2 flex-wrap">
                  {[2, 4, 6, 8, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNewCapacity(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        newCapacity === n
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {n} personas
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTable}
                className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                ⚠
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Eliminar mesa</h3>
                <p className="text-xs text-zinc-555">
                  Mesa #{tables.find((t) => t.id === showDeleteConfirm)?.number}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              ¿Estás seguro? Esta acción no se puede deshacer.
              {tables.find((t) => t.id === showDeleteConfirm)?.status === "occupied" && (
                <span className="block mt-2 text-orange-400 font-semibold text-xs">
                  ⚠ Esta mesa está actualmente ocupada.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTable(showDeleteConfirm)}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-3 text-sm font-semibold transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Product to Order Modal ─── */}
      {showAddProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowAddProductModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">Agregar al Pedido</h3>
            <p className="text-xs text-zinc-500 mb-6">Mesa #{currentTable.number}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-1">Seleccionar Producto</label>
                {availableProducts.filter(p => p.stock === "disponible").length === 0 ? (
                  <p className="text-xs text-rose-400 font-medium py-2">No hay productos disponibles en el inventario.</p>
                ) : (
                  <select
                    value={selectedProductToOrder?.id || ""}
                    onChange={(e) => {
                      const prod = availableProducts.find((p) => p.id === Number(e.target.value));
                      setSelectedProductToOrder(prod || null);
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
                  >
                    {availableProducts
                      .filter((p) => p.stock === "disponible")
                      .map((prod) => (
                        <option key={prod.id} value={prod.id} className="bg-zinc-950">
                          {prod.name} (${prod.price.toFixed(2)})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-bold text-white">{orderQuantity}</span>
                  <button
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProductToTable}
                disabled={!selectedProductToOrder}
                className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 text-sm font-semibold transition disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Checkout (Billing) Modal ─── */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg font-bold">
                💵
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Facturar Mesa {currentTable.number}</h3>
                <p className="text-xs text-zinc-500">
                  Mesero: {currentTable.waiter}
                </p>
              </div>
            </div>

            {/* List of items summary */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-850 p-4 max-h-36 overflow-y-auto mb-4 space-y-2">
              {(currentTable.orders || []).map((item) => (
                <div key={item.productId} className="flex justify-between text-xs text-zinc-400">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-semibold text-zinc-200">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center py-3 border-t border-b border-zinc-800 mb-4">
              <span className="text-xs font-semibold text-zinc-400">Total a Pagar</span>
              <span className="text-2xl font-extrabold text-white">
                ${tableBillAmount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-white block mb-1">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Efectivo", "Tarjeta", "Transferencia"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setCheckoutPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      checkoutPaymentMethod === method
                        ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-550/10"
                        : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={processCheckout}
                className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
