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
    comment: "Cumpleaños - cliente frecuente",
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

  // Form state for opening table
  const [guestCount, setGuestCount] = useState(1);
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [comment, setComment] = useState("");

  // Product addition modal state (multi-product selection)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [includeTip, setIncludeTip] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number | "custom">(10);
  const [customTipAmount, setCustomTipAmount] = useState<string>("0");

  const currentTable = tables.find((t) => t.id === activeTableId) ?? tables[0];
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

  // Load tables and products on mount
  useEffect(() => {
    const savedTables = localStorage.getItem("ecopost_tables");
    if (savedTables) {
      try {
        setTables(JSON.parse(savedTables));
      } catch (e) {
        console.error("Error cargando mesas guardadas:", e);
      }
    } else {
      localStorage.setItem("ecopost_tables", JSON.stringify(INITIAL_TABLES));
    }

    const savedProducts = localStorage.getItem("ecopost_products");
    if (savedProducts) {
      try {
        setAvailableProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Error cargando productos:", e);
      }
    } else {
      const fallbackProducts: Product[] = [
        { id: 1, name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa especial." },
        { id: 2, name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano con sal marina y pimentón ahumado." },
        { id: 3, name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
        { id: 4, name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
        { id: 5, name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "disponible", description: "Bizcocho tibio de chocolate relleno de fudge derretido con helado de vainilla." },
        { id: 6, name: "Aros de Cebolla Crujientes", category: "Entradas", price: 5.50, stock: "disponible", description: "Aros de cebolla rebozados en panko con alioli de ajo asado." },
        { id: 7, name: "Alitas BBQ Glaseadas", category: "Entradas", price: 8.00, stock: "disponible", description: "6 alitas bañadas en salsa BBQ artesanal ahumada." },
        { id: 8, name: "Agua Mineral sin Gas", category: "Bebidas", price: 2.00, stock: "disponible", description: "Agua purificada de manantial 500ml." },
      ];
      setAvailableProducts(fallbackProducts);
      localStorage.setItem("ecopost_products", JSON.stringify(fallbackProducts));
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when tables change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ecopost_tables", JSON.stringify(tables));
    }
  }, [tables, isLoaded]);

  // Set form fields when active table changes
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

  // Abrir Mesa con transición
  const handleOpenTable = () => {
    if (!selectedWaiter) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? {
              ...t,
              status: "occupied",
              waiter: selectedWaiter,
              guestCount,
              comment: comment.trim() || undefined,
              orders: [],
            }
          : t
      )
    );
  };

  // Liberar / Cerrar mesa sin cobrar
  const handleCloseTable = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? {
              ...t,
              status: "free",
              waiter: undefined,
              guestCount: undefined,
              comment: undefined,
              orders: undefined,
            }
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

  // Gestión de Modal de Agregar Productos
  const openAddProductsModal = () => {
    setProductQuantities({});
    setProductSearch("");
    setSelectedCategory("Todas");
    setShowAddProductModal(true);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setProductQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleSaveProductsToTable = () => {
    const entries = Object.entries(productQuantities).filter(([, qty]) => qty > 0);
    if (entries.length === 0) return;

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableId) return t;

        const currentOrders = t.orders ? [...t.orders] : [];

        entries.forEach(([prodIdStr, qty]) => {
          const prodId = Number(prodIdStr);
          const product = availableProducts.find((p) => p.id === prodId);
          if (!product) return;

          const existingIndex = currentOrders.findIndex((o) => o.productId === prodId);
          if (existingIndex >= 0) {
            currentOrders[existingIndex] = {
              ...currentOrders[existingIndex],
              quantity: currentOrders[existingIndex].quantity + qty,
            };
          } else {
            currentOrders.push({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty,
            });
          }
        });

        return { ...t, orders: currentOrders };
      })
    );

    setShowAddProductModal(false);
    setProductQuantities({});
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

  // Cálculos de cuenta
  const tableBillSubtotal = currentTable?.orders
    ? currentTable.orders.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const calculateTipAmount = () => {
    if (!includeTip) return 0;
    if (tipPercentage === "custom") {
      const parsed = parseFloat(customTipAmount);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    return (tableBillSubtotal * tipPercentage) / 100;
  };

  const tipAmount = calculateTipAmount();
  const totalWithTip = tableBillSubtotal + tipAmount;

  // Cálculos para pago en Efectivo (Devuelta / Cambio y Validación)
  const parsedCash = parseFloat(cashReceived);
  const numCash = isNaN(parsedCash) ? 0 : parsedCash;
  const isCashInsufficient =
    checkoutPaymentMethod === "Efectivo" &&
    (cashReceived.trim() === "" || numCash < totalWithTip - 0.001);
  const changeAmount = Math.max(0, numCash - totalWithTip);

  // Facturar / Cobrar y Cerrar Mesa
  const processCheckout = () => {
    if (!currentTable || !currentTable.orders || currentTable.orders.length === 0) return;
    if (isCashInsufficient) return;

    const savedSalesStr = localStorage.getItem("ecopost_sales");
    let salesList: any[] = [];
    if (savedSalesStr) {
      try {
        salesList = JSON.parse(savedSalesStr);
      } catch (e) {
        console.error("Error parsing sales:", e);
      }
    }

    const nextFacNum =
      salesList.length > 0
        ? Math.max(
            ...salesList.map((s: any) => {
              const num = parseInt(String(s.id).replace("FAC-", ""));
              return isNaN(num) ? 1000 : num;
            })
          ) + 1
        : 1000;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newSale = {
      id: `FAC-${nextFacNum}`,
      table: `Mesa ${currentTable.number}`,
      subtotal: tableBillSubtotal,
      tip: tipAmount,
      total: totalWithTip,
      paymentMethod: checkoutPaymentMethod,
      cashReceived: checkoutPaymentMethod === "Efectivo" ? numCash : undefined,
      change: checkoutPaymentMethod === "Efectivo" ? changeAmount : undefined,
      time: timeStr,
      date: now.toISOString(),
      status: "Completado",
      waiter: currentTable.waiter,
      guestCount: currentTable.guestCount || 1,
      saleType: "Mesas",
      itemsCount: currentTable.orders.reduce((sum, i) => sum + i.quantity, 0),
    };

    localStorage.setItem("ecopost_sales", JSON.stringify([newSale, ...salesList]));

    // Liberar la mesa
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? {
              ...t,
              status: "free",
              waiter: undefined,
              guestCount: undefined,
              comment: undefined,
              orders: undefined,
            }
          : t
      )
    );

    setSelectedWaiter("");
    setGuestCount(1);
    setComment("");
    setShowCheckoutModal(false);
    setCashReceived("");
    setIncludeTip(false);
    setTipPercentage(10);
    setCustomTipAmount("0");
  };

  // Categorías de productos disponibles
  const categories = ["Todas", ...Array.from(new Set(availableProducts.map((p) => p.category)))];

  const filteredProducts = availableProducts.filter((p) => {
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedProductsTotalItems = Object.values(productQuantities).reduce((a, b) => a + b, 0);
  const selectedProductsTotalPrice = Object.entries(productQuantities).reduce((sum, [id, qty]) => {
    const p = availableProducts.find((item) => item.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

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
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(table.id);
                    }}
                    title="Eliminar mesa"
                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    ×
                  </button>

                  {/* Table button */}
                  <button
                    onClick={() => handleSelectTable(table.id)}
                    className={`w-full aspect-square rounded-2xl border-2 text-xl font-bold transition-all ${
                      table.status === "occupied"
                        ? activeTableId === table.id
                          ? "border-blue-500 bg-orange-500 text-white ring-4 ring-blue-500/35 scale-105 shadow-xl shadow-blue-500/20"
                          : "border-orange-500/60 bg-orange-500/15 text-orange-300 hover:border-orange-400 hover:bg-orange-500/25"
                        : activeTableId === table.id
                        ? "border-blue-500 bg-emerald-500 text-white ring-4 ring-blue-500/35 scale-105 shadow-xl shadow-blue-500/20"
                        : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {table.number}
                  </button>

                  {/* Status dot */}
                  <div
                    className={`mt-1.5 mx-auto w-1.5 h-1.5 rounded-full ${
                      table.status === "occupied" ? "bg-orange-500 shadow-sm shadow-orange-500" : "bg-emerald-500"
                    }`}
                  />
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
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/50 shadow-sm shadow-blue-500/50" />
              Seleccionada (Borde)
            </div>
          </div>
        </section>

        {/* ─── Side Panel with Smooth View Transition ─── */}
        {currentTable && (
          <aside className="relative rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300">
            {/* Background glowing gradient accents */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
                currentTable.status === "occupied" ? "bg-orange-500/15" : "bg-emerald-500/15"
              }`}
            />

            {/* VISTA 1: MESA LIBRE (Formulario para Abrir Mesa) */}
            {currentTable.status === "free" ? (
              <div key="free-panel" className="flex flex-col gap-5 animate-fade-in">
                {/* Mesa Header */}
                <div className="rounded-2xl p-4 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-950/70">
                      MESA DISPONIBLE
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-900/20 px-2.5 py-0.5 rounded-full text-emerald-950">
                      Cap. {currentTable.capacity} pers.
                    </span>
                  </div>
                  <h2 className="mt-1 text-4xl font-black tracking-tight">{currentTable.number}</h2>
                  <p className="text-xs font-semibold text-emerald-900/80 mt-1">
                    Lista para recibir comensales
                  </p>
                </div>

                {/* Cantidad de personas */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Número de Personas
                  </label>
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-2">
                    <button
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg"
                    >
                      −
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-extrabold text-white">{guestCount}</span>
                      <span className="text-xs text-zinc-500">comensales</span>
                    </div>
                    <button
                      onClick={() => setGuestCount(Math.min(currentTable.capacity, guestCount + 1))}
                      className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Capacidad máxima sugerida: {currentTable.capacity} personas
                  </p>
                </div>

                {/* Selección de Mesero */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Mesero Asignado <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={selectedWaiter}
                    onChange={(e) => setSelectedWaiter(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                  >
                    <option value="">Seleccionar mesero...</option>
                    {WAITER_OPTIONS.map((w) => (
                      <option key={w} value={w} className="bg-zinc-950">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comentario Opcional */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Comentario <span className="text-[11px] font-normal text-zinc-500">(opcional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    placeholder="Ej: Cumpleaños, alergias, mesa preferencial…"
                    className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                  />
                </div>

                {/* Botón Abrir Mesa */}
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={handleOpenTable}
                    disabled={!selectedWaiter}
                    className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-sm font-bold text-white transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <span>Abrir mesa</span>
                    <span>➔</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(currentTable.id)}
                    className="w-full rounded-xl py-2 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition"
                  >
                    Eliminar mesa {currentTable.number}
                  </button>
                </div>
              </div>
            ) : (
              /* VISTA 2: PANEL DE MESA ACTIVA */
              <div key="occupied-panel" className="flex flex-col gap-4 animate-fade-in">
                {/* Header Mesa Activa */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500/25 via-orange-500/15 to-zinc-900 border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      MESA ACTIVA
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      👥 {currentTable.guestCount || 1} comensales
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">Número de mesa</p>
                      <h2 className="text-3xl font-extrabold text-white">Mesa #{currentTable.number}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Consumo actual</p>
                      <p className="text-2xl font-black text-orange-400">
                        ${tableBillSubtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mesero Asignado */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-sm">
                      🧑‍🍳
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Mesero asignado</p>
                      <p className="text-xs font-bold text-zinc-200">{currentTable.waiter}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    En atención
                  </span>
                </div>

                {/* Comentarios de la mesa (Condicional: sólo se muestra si existe y no está vacío) */}
                {currentTable.comment && currentTable.comment.trim().length > 0 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                    <span className="text-base shrink-0">📝</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Nota de la mesa:
                      </p>
                      <p className="mt-0.5 text-xs text-amber-100 font-medium break-words">
                        {currentTable.comment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Listado de Productos en la Cuenta */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Consumos ({(currentTable.orders || []).reduce((sum, o) => sum + o.quantity, 0)})
                    </span>
                    <span className="text-xs font-semibold text-orange-400">
                      ${tableBillSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {(!currentTable.orders || currentTable.orders.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-zinc-800 text-center gap-2 bg-zinc-950/40">
                      <span className="text-2xl">🍽️</span>
                      <p className="text-xs text-zinc-400 font-medium">Aún no hay productos en la cuenta.</p>
                      <p className="text-[11px] text-zinc-600">Presiona el botón de abajo para registrar el pedido.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                      {currentTable.orders.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-zinc-400">
                              ${item.price.toFixed(2)} × {item.quantity} ={" "}
                              <span className="font-semibold text-orange-400">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                            <button
                              onClick={() =>
                                handleUpdateOrderItemQuantity(item.productId, item.quantity - 1)
                              }
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition flex items-center justify-center"
                              title="Restar o eliminar"
                            >
                              −
                            </button>
                            <span className="text-xs font-bold text-white min-w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateOrderItemQuantity(item.productId, item.quantity + 1)
                              }
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition flex items-center justify-center"
                              title="Sumar"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN DE MESA ACTIVA */}
                <div className="mt-2 flex flex-col gap-2.5">
                  {/* Botón Agregar Productos */}
                  <button
                    onClick={openAddProductsModal}
                    className="w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-3 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:border-orange-500/50"
                  >
                    <span className="text-base leading-none text-orange-400">＋</span>
                    <span>Agregar productos</span>
                  </button>

                  {/* Botón Cierre de mesa o pagar */}
                  <button
                    onClick={() => {
                      setCheckoutPaymentMethod("Efectivo");
                      setCashReceived("");
                      setIncludeTip(false);
                      setTipPercentage(10);
                      setCustomTipAmount("0");
                      setShowCheckoutModal(true);
                    }}
                    disabled={!currentTable.orders || currentTable.orders.length === 0}
                    className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-xs font-extrabold text-white transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>💳</span>
                    <span>Cierre de mesa o pagar (${tableBillSubtotal.toFixed(2)})</span>
                  </button>

                  {/* Liberar mesa sin cobrar */}
                  <button
                    onClick={handleCloseTable}
                    className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition"
                  >
                    Liberar mesa (Sin cobrar)
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ─── MODAL FLOTANTE: AGREGAR PRODUCTOS ─── */}
      {showAddProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowAddProductModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Agregar Productos a Mesa #{currentTable?.number}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ajusta las cantidades de los productos deseados y confirma el pedido.
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="py-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Categorías */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Productos con Ajuste de Cantidad */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-sm font-medium">No se encontraron productos coincidentes.</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const qty = productQuantities[prod.id] || 0;
                  const isAgotado = prod.stock === "agotado";

                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        qty > 0
                          ? "bg-orange-500/10 border-orange-500/40"
                          : "bg-zinc-950/70 border-zinc-850 hover:border-zinc-700"
                      } ${isAgotado ? "opacity-50" : ""}`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{prod.name}</h4>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-medium">
                            {prod.category}
                          </span>
                          {isAgotado && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-semibold">
                              Agotado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{prod.description}</p>
                        <p className="text-xs font-extrabold text-orange-400 mt-1">
                          ${prod.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Selector de Cantidad */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isAgotado ? (
                          <span className="text-xs text-zinc-500 italic">No disponible</span>
                        ) : (
                          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, -1)}
                              disabled={qty === 0}
                              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white font-bold transition flex items-center justify-center text-sm"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-extrabold text-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, 1)}
                              className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer de Confirmación */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 text-center sm:text-left">
                {selectedProductsTotalItems > 0 ? (
                  <span>
                    Seleccionados: <strong className="text-white">{selectedProductsTotalItems} productos</strong> por{" "}
                    <strong className="text-orange-400 text-sm">${selectedProductsTotalPrice.toFixed(2)}</strong>
                  </span>
                ) : (
                  <span>Selecciona uno o más productos para agregar a la cuenta</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 sm:flex-initial rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductsToTable}
                  disabled={selectedProductsTotalItems === 0}
                  className="flex-1 sm:flex-initial rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold transition shadow-lg shadow-orange-500/20"
                >
                  Confirmar y Guardar ({selectedProductsTotalItems})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL FLOTANTE: CIERRE DE MESA O PAGAR ─── */}
      {showCheckoutModal && currentTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
                  💳
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cierre de Mesa #{currentTable.number}</h3>
                  <p className="text-xs text-zinc-400">Atendido por: {currentTable.waiter || "Mesero"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Resumen de Consumos */}
            <div className="mt-4 bg-zinc-950 rounded-2xl border border-zinc-850 p-3.5 max-h-36 overflow-y-auto space-y-1.5">
              {(currentTable.orders || []).map((item) => (
                <div key={item.productId} className="flex justify-between text-xs text-zinc-400">
                  <span className="truncate pr-2">
                    {item.name} <strong className="text-zinc-300">×{item.quantity}</strong>
                  </span>
                  <span className="font-semibold text-zinc-200 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* SELECCIÓN DE MÉTODO DE PAGO (Efectivo, Tarjeta, Transferencia) */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Efectivo", icon: "💵" },
                  { label: "Tarjeta", icon: "💳" },
                  { label: "Transferencia", icon: "📱" },
                ].map((item) => {
                  const isSelected = checkoutPaymentMethod === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setCheckoutPaymentMethod(item.label as "Efectivo" | "Tarjeta" | "Transferencia");
                        if (item.label !== "Efectivo") {
                          setCashReceived("");
                        }
                      }}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-102"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CÁLCULO DE CAMBIO / DEVUELTA (Condicional: solo cuando es Efectivo) */}
            {checkoutPaymentMethod === "Efectivo" && (
              <div className="mt-4 p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <span>💵 Dinero recibido</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCashReceived(totalWithTip.toFixed(2))}
                    className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg transition"
                  >
                    Monto exacto
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className={`w-full rounded-xl border bg-zinc-900 pl-8 pr-4 py-2.5 text-sm font-bold text-white outline-none transition ${
                      cashReceived.trim() !== "" && isCashInsufficient
                        ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                        : "border-zinc-700 focus:border-orange-500"
                    }`}
                  />
                </div>

                {/* Accesos directos a billetes frecuentes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold mr-1">
                    Billetes:
                  </span>
                  {[20, 50, 100].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setCashReceived(String(bill))}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                        cashReceived === String(bill)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ${bill}
                    </button>
                  ))}
                </div>

                {/* Visualización en tiempo real del Cambio o Advertencia */}
                {cashReceived.trim() !== "" ? (
                  isCashInsufficient ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs animate-fade-in">
                      <span>⚠️</span>
                      <span className="font-medium">
                        Monto insuficiente. Faltan{" "}
                        <strong className="font-bold text-rose-200">
                          ${(totalWithTip - numCash).toFixed(2)}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪙</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Cambio / Devuelta:
                        </span>
                      </div>
                      <span className="text-xl font-black text-emerald-400">
                        ${changeAmount.toFixed(2)}
                      </span>
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">
                    Ingresa con cuánto dinero paga el cliente para calcular el cambio.
                  </p>
                )}
              </div>
            )}

            {/* CAMPO DE PROPINA */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>🪙 ¿Desea incluir propina?</span>
                </label>
                <input
                  type="checkbox"
                  checked={includeTip}
                  onChange={(e) => setIncludeTip(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {includeTip && (
                <div className="space-y-3 pt-2 border-t border-zinc-850 animate-fade-in">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercentage(pct)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                          tipPercentage === pct
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTipPercentage("custom")}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                        tipPercentage === "custom"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      Otro
                    </button>
                  </div>

                  {tipPercentage === "custom" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Monto ($):</span>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Propina calculada ({tipPercentage}%):</span>
                      <span className="font-bold text-emerald-400">${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desglose de Totales */}
            <div className="mt-4 py-3 border-t border-b border-zinc-800 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Subtotal consumos:</span>
                <span>${tableBillSubtotal.toFixed(2)}</span>
              </div>
              {includeTip && (
                <div className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>Propina:</span>
                  <span>+${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Total Final a Cobrar:
                </span>
                <span className="text-2xl font-black text-white">${totalWithTip.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={processCheckout}
                disabled={isCashInsufficient}
                className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 text-xs font-bold transition shadow-xl shadow-emerald-500/20"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Table Modal ─── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                ⚠
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Eliminar mesa</h3>
                <p className="text-xs text-zinc-500">
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
    </div>
  );
}
