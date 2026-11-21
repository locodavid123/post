import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingBag,
  Utensils,
  Check,
  History,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Product, OrderItem } from "./types";

function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "$0";
  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `$${formatted}`;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: number;
  availableProducts: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  productSearch: string;
  setProductSearch: (search: string) => void;
  productQuantities: Record<string | number, number>;
  handleQuantityChange: (productId: number | string, delta: number) => void;
  handleSaveProductsToTable: () => void;
  selectedProductsTotalItems: number;
  selectedProductsTotalPrice: number;
  existingTableOrders?: OrderItem[];
  isSaving?: boolean;
}

export default function AddProductModal({
  isOpen,
  onClose,
  tableNumber,
  availableProducts,
  categories,
  selectedCategory,
  setSelectedCategory,
  productSearch,
  setProductSearch,
  productQuantities,
  handleQuantityChange,
  handleSaveProductsToTable,
  selectedProductsTotalItems,
  selectedProductsTotalPrice,
  existingTableOrders = [],
  isSaving = false,
}: AddProductModalProps) {
  // Feedback táctil inmediato (destello visual y toast)
  const [flashingProductId, setFlashingProductId] = useState<string | number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pestaña activa en el modal: "catalogo", "nueva_ronda", "ya_en_mesa"
  const [activeTab, setActiveTab] = useState<"catalogo" | "nueva_ronda" | "ya_en_mesa">("catalogo");

  // Limpiar estados temporales al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setActiveTab("catalogo");
      setFlashingProductId(null);
      setToastMessage(null);
    }
  }, [isOpen]);

  // Auto-desvanecer el toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Mapa de productos que ya se encuentran en la mesa en rondas anteriores
  const existingQuantitiesMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (Array.isArray(existingTableOrders)) {
      existingTableOrders.forEach((item) => {
        const pKey = String(item.productId || item.name);
        map[pKey] = (map[pKey] || 0) + item.quantity;
        if (item.name) {
          const nameKey = item.name.toLowerCase().trim();
          map[nameKey] = (map[nameKey] || 0) + item.quantity;
        }
      });
    }
    return map;
  }, [existingTableOrders]);

  const priorItemsCount = useMemo(() => {
    return existingTableOrders.reduce((sum, item) => sum + item.quantity, 0);
  }, [existingTableOrders]);

  if (!isOpen) return null;

  // Filtrado de productos en catálogo
  const filteredProducts = availableProducts.filter((p) => {
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Lista de productos seleccionados en la ronda actual
  const currentRoundEntries = Object.entries(productQuantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = availableProducts.find((p) => String(p.id) === String(id));
      return {
        product: prod,
        id,
        quantity: qty,
        price: prod ? prod.price : 0,
        subtotal: prod ? prod.price * qty : 0,
      };
    })
    .filter((entry) => entry.product !== undefined);

  // Manejo de interacción táctil con feedback visual y toast
  const handleAdd = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleQuantityChange(prod.id, 1);

    // Destello visual en el producto
    setFlashingProductId(prod.id);
    setTimeout(() => {
      setFlashingProductId((curr) => (curr === prod.id ? null : curr));
    }, 450);

    // Toast de confirmación inmediata
    setToastMessage(`+1 ${prod.name} en la ronda actual`);
  };

  const handleMinus = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = productQuantities[prod.id] || 0;
    if (current > 0) {
      handleQuantityChange(prod.id, -1);
      setFlashingProductId(prod.id);
      setTimeout(() => {
        setFlashingProductId((curr) => (curr === prod.id ? null : curr));
      }, 300);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#10131b] border border-white/[0.08] rounded-3xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast flotante con destello de confirmación táctil */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
            <div className="flex items-center gap-2 bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-bounce">
              <Check size={14} className="stroke-[3]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header del Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Tomar Pedido · Mesa #{tableNumber}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  Nueva Ronda
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Separa los nuevos ítems por confirmar de lo que ya se encuentra servido.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Barra de Pestañas / Segmentación: Catálogo vs Nueva Ronda vs Ya en mesa */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950/80 rounded-2xl border border-white/[0.06] mt-3">
          <button
            type="button"
            onClick={() => setActiveTab("catalogo")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "catalogo"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers size={13} className={activeTab === "catalogo" ? "text-orange-400" : "text-zinc-500"} />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nueva_ronda")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "nueva_ronda"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} className={activeTab === "nueva_ronda" ? "text-emerald-400" : "text-zinc-500"} />
            <span className="truncate">Por confirmar</span>
            {selectedProductsTotalItems > 0 && (
              <span className="ml-0.5 text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
                {selectedProductsTotalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ya_en_mesa")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ya_en_mesa"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <History size={13} className={activeTab === "ya_en_mesa" ? "text-orange-400" : "text-zinc-500"} />
            <span className="truncate">Ya en mesa</span>
            {priorItemsCount > 0 && (
              <span className="ml-0.5 text-[10px] font-bold bg-zinc-700 text-zinc-300 px-1.5 py-0.2 rounded-full">
                {priorItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── VISTA 1: CATÁLOGO DE PRODUCTOS CON INSIGNIAS Y FEEDBACK TÁCTIL ─── */}
        {activeTab === "catalogo" && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Buscador y Categorías */}
            <div className="pt-3 pb-2 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Categorías */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-zinc-950/70 border border-white/[0.06] text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Productos con Insignias (Ya en mesa / +Y ahora) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-sm font-medium">No se encontraron productos coincidentes.</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const qtyNow = productQuantities[prod.id] || 0;
                  const isAgotado = prod.stock === "agotado";

                  // Cantidad que ya está en la mesa en rondas anteriores
                  const existingInTable =
                    existingQuantitiesMap[String(prod.id)] ||
                    existingQuantitiesMap[prod.name.toLowerCase().trim()] ||
                    0;

                  const isFlashing = flashingProductId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isAgotado && handleAdd(prod)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                        isFlashing
                          ? "ring-2 ring-emerald-400 bg-emerald-500/20 scale-[1.01] shadow-lg shadow-emerald-500/20 border-emerald-400/50"
                          : qtyNow > 0
                          ? "bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-400"
                          : "bg-zinc-950/70 border-white/[0.06] hover:border-zinc-700 hover:bg-zinc-900/60"
                      } ${isAgotado ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{prod.name}</h4>

                          {/* Insignia 1: Ya en mesa: X (discreta) */}
                          {existingInTable > 0 && (
                            <span
                              title="Unidades ordenadas en rondas anteriores"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-300 bg-zinc-800/90 px-2 py-0.5 rounded-md border border-white/[0.08]"
                            >
                              <Utensils size={10} className="text-zinc-400" />
                              <span>Ya en mesa: {existingInTable}</span>
                            </span>
                          )}

                          {/* Insignia 2: +Y ahora (resaltada en verde para la ronda actual) */}
                          {qtyNow > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-500/25 px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-sm shadow-emerald-500/20 animate-pulse">
                              +{qtyNow} ahora
                            </span>
                          )}

                          {isAgotado && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-semibold">
                              Agotado
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{prod.description}</p>
                        <p className="text-xs font-extrabold text-orange-400 mt-1 tabular-nums">
                          {formatCurrency(prod.price)}
                        </p>
                      </div>

                      {/* Selector táctil de cantidad */}
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isAgotado ? (
                          <span className="text-xs text-zinc-500 italic">No disponible</span>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/[0.08] rounded-xl p-1">
                            <button
                              type="button"
                              onClick={(e) => handleMinus(prod, e)}
                              disabled={qtyNow === 0}
                              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-white font-bold transition flex items-center justify-center text-sm active:scale-95"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-white tabular-nums">
                              {qtyNow}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleAdd(prod, e)}
                              className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition flex items-center justify-center text-sm active:scale-95 shadow-md shadow-emerald-500/20"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── VISTA 2: NUEVA RONDA (POR CONFIRMAR) ─── */}
        {activeTab === "nueva_ronda" && (
          <div className="flex flex-col flex-1 min-h-0 my-2">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  Nueva Ronda por confirmar
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Estos productos se guardarán como una nueva comanda con su hora exacta.
                </p>
              </div>
              <span className="text-sm font-black text-emerald-300 tabular-nums">
                {formatCurrency(selectedProductsTotalPrice)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {currentRoundEntries.length === 0 ? (
                <div className="text-center py-14 text-zinc-500">
                  <Sparkles size={28} className="mx-auto mb-2 text-zinc-600" />
                  <p className="text-sm font-semibold">No has seleccionado ítems para esta ronda.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("catalogo")}
                    className="mt-3 text-xs text-orange-400 hover:underline font-bold"
                  >
                    Ir al catálogo para seleccionar
                  </button>
                </div>
              ) : (
                currentRoundEntries.map(({ product, id, quantity, price, subtotal }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/[0.08]"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="text-sm font-bold text-white truncate">{product?.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
                        {formatCurrency(price)} × {quantity} ={" "}
                        <span className="text-emerald-400 font-bold">{formatCurrency(subtotal)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/[0.08] rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => product && handleMinus(product)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-sm"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-white tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => product && handleAdd(product)}
                        className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition flex items-center justify-center text-sm"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── VISTA 3: YA PEDIDO EN LA MESA (RONDAS ANTERIORES) ─── */}
        {activeTab === "ya_en_mesa" && (
          <div className="flex flex-col flex-1 min-h-0 my-2">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.08] mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Productos ya pedidos en la mesa
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Consolidado de comandas previas servidas en esta mesa.
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-400">
                {priorItemsCount} unidades en total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {existingTableOrders.length === 0 ? (
                <div className="text-center py-14 text-zinc-500">
                  <Utensils size={28} className="mx-auto mb-2 text-zinc-600" />
                  <p className="text-sm font-semibold">Esta mesa aún no tiene consumos previos.</p>
                </div>
              ) : (
                existingTableOrders.map((item, idx) => (
                  <div
                    key={item.id || `${item.productId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.05]"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-200 truncate">{item.name}</h4>
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                        {formatCurrency(item.price)} c/u · Total:{" "}
                        <span className="text-zinc-300 font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-xl border border-white/[0.06]">
                      En atención
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer de Confirmación */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            {selectedProductsTotalItems > 0 ? (
              <span>
                Nueva ronda: <strong className="text-emerald-400">{selectedProductsTotalItems} productos</strong> por{" "}
                <strong className="text-white text-sm tabular-nums">
                  {formatCurrency(selectedProductsTotalPrice)}
                </strong>
              </span>
            ) : (
              <span className="text-zinc-500">
                Selecciona productos del catálogo para agregar a esta ronda
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-initial rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 px-4 py-2.5 text-xs font-bold transition disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveProductsToTable}
              disabled={selectedProductsTotalItems === 0 || isSaving}
              className="flex-1 sm:flex-initial rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 text-xs font-black transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Enviando comanda...</span>
                </>
              ) : (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>Confirmar y agregar a la mesa ({selectedProductsTotalItems})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
