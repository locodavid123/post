"use client";

import React, { useState, useEffect } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import {
  Table,
  Product,
  OrderItem,
  OrderRound,
  INITIAL_TABLES,
  TableCard,
  TableDetailPane,
  AddProductModal,
  CheckoutModal,
  AddTableModal,
  DeleteTableModal,
  ReceiptModal,
  ReceiptData,
  TableQRModal,
} from "@/components/client/mesas";
import {
  calculateSubtotal,
  calculateTip,
  calculateTotal,
  validateCashPayment,
} from "@/utils/billing";

// Helper para parsear comandas y órdenes de la base de datos dividiéndolas en Rondas y Consolidado
function parseActiveOrders(ordersData: any[]): { activeItems: OrderItem[]; activeRounds: OrderRound[] } {
  const activeRounds: OrderRound[] = [];
  const activeItems: OrderItem[] = [];

  if (Array.isArray(ordersData)) {
    ordersData.forEach((ord: any, index: number) => {
      const roundItems: OrderItem[] = [];
      if (Array.isArray(ord.items)) {
        ord.items.forEach((i: any) => {
          const pId = i.productId || i.id;
          const itemObj: OrderItem = {
            id: i.id,
            orderId: ord.id,
            productId: pId,
            name: i.productName,
            price: Number(i.unitPrice) || 0,
            quantity: Number(i.quantity) || 1,
            createdAt: ord.createdAt,
          };
          roundItems.push(itemObj);

          const existing = activeItems.find(
            (x) => String(x.productId) === String(pId) || x.name === i.productName
          );
          if (existing) {
            existing.quantity += Number(i.quantity) || 1;
          } else {
            activeItems.push({
              id: i.id,
              productId: pId,
              name: i.productName,
              price: Number(i.unitPrice) || 0,
              quantity: Number(i.quantity) || 1,
            });
          }
        });
      }

      if (roundItems.length > 0) {
        activeRounds.push({
          id: ord.id,
          orderNumber: ord.orderNumber || index + 1,
          createdAt: ord.createdAt,
          status: ord.status,
          total: ord.total || roundItems.reduce((s, it) => s + it.price * it.quantity, 0),
          items: roundItems,
        });
      }
    });
  }

  return { activeItems, activeRounds };
}

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [activeTableId, setActiveTableId] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Estados para sincronización de pedidos con la base de datos
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSyncError, setOrderSyncError] = useState<string | null>(null);

  // Add table modal state
  const [newCapacity, setNewCapacity] = useState(4);

  // Form state for opening table
  const [guestCount, setGuestCount] = useState(1);
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [comment, setComment] = useState("");

  // Product addition modal state (multi-product selection)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productQuantities, setProductQuantities] = useState<Record<string | number, number>>({});
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [includeTip, setIncludeTip] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number | "custom">(10);
  const [customTipAmount, setCustomTipAmount] = useState<string>("0");

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Table QR modal state
  const [showQRModal, setShowQRModal] = useState(false);

  const currentTable = tables.find((t) => t.id === activeTableId) ?? tables[0];
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

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

  // Load tables and products on mount (once businessId is available)
  useEffect(() => {
    if (!businessId) return;

    // Helper to get storage key with businessId prefix
    const key = (base: string) => `ecopost_${base}_${businessId}`;

    const savedTables = localStorage.getItem(key("tables"));
    if (savedTables) {
      try {
        const parsed: Table[] = JSON.parse(savedTables);
        const uniqueNumeric = parsed
          .filter((t) => typeof t.number === "number" && !isNaN(t.number) && t.number > 0)
          .filter((t, index, self) => index === self.findIndex((x) => x.number === t.number))
          .sort((a, b) => a.number - b.number);

        setTables(uniqueNumeric);
      } catch (e) {
        console.error("Error cargando mesas guardadas:", e);
      }
    } else {
      localStorage.setItem(key("tables"), JSON.stringify(INITIAL_TABLES));
    }

    const savedProducts = localStorage.getItem(key("products"));
    if (savedProducts) {
      try {
        setAvailableProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Error cargando productos:", e);
      }
    } else {
      setAvailableProducts([]);
    }

    setIsLoaded(true);

    // Sincronizar mesas y pedidos activos desde PostgreSQL
    fetch("/api/tables")
      .then((res) => (res.ok ? res.json() : null))
      .then((dbTables) => {
        if (Array.isArray(dbTables) && dbTables.length > 0) {
          const salonTables = dbTables.filter((t: any) => {
            const num = parseInt(t.tableId, 10);
            return !isNaN(num) && num > 0 && t.tableId !== "admin";
          });

          const mappedTables: Table[] = salonTables.map((t: any) => {
            // Reconstruir consumos activos y rondas desde todas las órdenes no pagadas ni canceladas
            const { activeItems, activeRounds } = parseActiveOrders(t.orders);
            const hasActiveOrders = activeItems.length > 0;
            const status = (hasActiveOrders || t.status === "occupied" ? "occupied" : "free") as "free" | "occupied";

            return {
              id: Number(t.tableId),
              number: Number(t.tableId),
              capacity: t.capacity || 4,
              status,
              waiter: t.waiter || (hasActiveOrders ? "Mesero" : undefined),
              guestCount: t.guestCount || undefined,
              comment: t.comment || undefined,
              orders: activeItems,
              rounds: activeRounds,
            };
          });

          // Evitar duplicados por número de mesa
          const uniqueTables = mappedTables.filter(
            (t, index, self) => index === self.findIndex((x) => x.number === t.number)
          );

          // Orden numérico exacto: 1, 2, 3, ..., 10, 11, 12
          uniqueTables.sort((a, b) => a.number - b.number);

          setTables(uniqueTables);
          localStorage.setItem(key("tables"), JSON.stringify(uniqueTables));
        }
      })
      .catch((err) => console.error("Error cargando mesas desde BD:", err));

    // Sincronizar catálogo real desde PostgreSQL
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((dbProducts) => {
        if (Array.isArray(dbProducts)) {
          setAvailableProducts(dbProducts);
          localStorage.setItem(key("products"), JSON.stringify(dbProducts));
        }
      })
      .catch((err) => console.error("Error cargando productos desde BD:", err));

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key("products") && e.newValue) {
        try {
          setAvailableProducts(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === key("tables") && e.newValue) {
        try {
          setTables(JSON.parse(e.newValue));
        } catch {}
      }
    };

    const handleFocus = () => {
      const savedProds = localStorage.getItem(key("products"));
      if (savedProds) {
        try {
          setAvailableProducts(JSON.parse(savedProds));
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [businessId]);

  // Save to localStorage when tables change
  useEffect(() => {
    if (isLoaded && businessId) {
      localStorage.setItem(`ecopost_tables_${businessId}`, JSON.stringify(tables));
    }
  }, [tables, isLoaded, businessId]);

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

  // Abrir Mesa con persistencia en backend
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

    // Persistir estado de la mesa en PostgreSQL
    if (currentTable) {
      fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: String(currentTable.number),
          status: "occupied",
          waiter: selectedWaiter,
          guestCount,
          comment: comment.trim() || null,
        }),
      }).catch((err) => console.error("Error persistiendo mesa en BD:", err));
    }
  };

  // Liberar / Cerrar mesa sin cobrar
  const handleCloseTable = () => {
    const tableNum = currentTable ? String(currentTable.number) : undefined;

    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? {
              ...t,
              status: "free",
              waiter: undefined,
              guestCount: undefined,
              comment: undefined,
              orders: [],
              rounds: [],
            }
          : t
      )
    );

    if (tableNum) {
      // 1. Cancelar órdenes activas de la mesa en PostgreSQL
      fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableNum,
          action: "cancel",
        }),
      }).catch((err) => console.error("Error cancelando órdenes en BD:", err));

      // 2. Liberar mesa en PostgreSQL
      fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableNum,
          status: "free",
          waiter: null,
          guestCount: 1,
          comment: null,
        }),
      }).catch((err) => console.error("Error liberando mesa en BD:", err));
    }

    setSelectedWaiter("");
    setGuestCount(1);
    setComment("");
    setOrderSyncError(null);
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

    // Persistir mesa creada en PostgreSQL
    fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: String(newTable.number),
        capacity: newCapacity,
        status: "free",
      }),
    }).catch((err) => console.error("Error creando mesa en PostgreSQL:", err));
  };

  const handleDeleteTable = (id: number) => {
    const tableToDelete = tables.find((t) => t.id === id);
    const remaining = tables.filter((t) => t.id !== id);
    setTables(remaining);
    if (activeTableId === id) {
      setActiveTableId(remaining[0]?.id ?? 0);
    }
    setShowDeleteConfirm(null);

    // Eliminar mesa en PostgreSQL
    if (tableToDelete) {
      fetch(`/api/tables?tableId=${encodeURIComponent(String(tableToDelete.number))}`, {
        method: "DELETE",
      }).catch((err) => console.error("Error eliminando mesa en PostgreSQL:", err));
    }
  };

  // Gestión de Modal de Agregar Productos
  const openAddProductsModal = () => {
    if (businessId) {
      const savedProducts = localStorage.getItem(`ecopost_products_${businessId}`);
      if (savedProducts) {
        try {
          setAvailableProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error("Error recargando productos al abrir modal:", e);
        }
      }
    }
    setProductQuantities({});
    setProductSearch("");
    setSelectedCategory("Todas");
    setShowAddProductModal(true);
  };

  const handleQuantityChange = (productId: number | string, delta: number) => {
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

  const syncTableWithActiveOrders = (tableNumOrId: number | string, ordersData: any[]) => {
    const { activeItems, activeRounds } = parseActiveOrders(ordersData);
    setTables((prev) =>
      prev.map((t) => {
        if (t.number !== Number(tableNumOrId) && t.id !== Number(tableNumOrId)) return t;
        const hasActiveOrders = activeItems.length > 0;
        return {
          ...t,
          status: hasActiveOrders || t.status === "occupied" ? "occupied" : "free",
          orders: activeItems,
          rounds: activeRounds,
        };
      })
    );
  };

  const handleSaveProductsToTable = async () => {
    const entries = Object.entries(productQuantities).filter(([, qty]) => qty > 0);
    if (entries.length === 0 || !currentTable) return;

    const itemsToPersist: Array<{
      productId: string | number;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    entries.forEach(([prodIdStr, qty]) => {
      const product = availableProducts.find((p) => String(p.id) === String(prodIdStr));
      if (!product) return;
      itemsToPersist.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
    });

    if (itemsToPersist.length === 0) return;

    // Actualización optimista en React creando una nueva comanda/ronda temporal
    const tempRoundId = `temp-${Date.now()}`;
    const newRoundItems: OrderItem[] = itemsToPersist.map((item) => ({
      id: `item-${Date.now()}-${item.productId}`,
      orderId: tempRoundId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      createdAt: new Date().toISOString(),
    }));

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableId) return t;

        // Actualizar pedidos consolidados
        const currentOrders = t.orders ? [...t.orders] : [];
        itemsToPersist.forEach((item) => {
          const existingIndex = currentOrders.findIndex(
            (o) => String(o.productId) === String(item.productId) || o.name === item.name
          );
          if (existingIndex >= 0) {
            currentOrders[existingIndex] = {
              ...currentOrders[existingIndex],
              quantity: currentOrders[existingIndex].quantity + item.quantity,
            };
          } else {
            currentOrders.push(item);
          }
        });

        // Registrar la nueva ronda temporal
        const currentRounds = t.rounds ? [...t.rounds] : [];
        currentRounds.push({
          id: tempRoundId,
          orderNumber: currentRounds.length + 1,
          createdAt: new Date().toISOString(),
          status: "PENDING",
          total: itemsToPersist.reduce((s, it) => s + it.price * it.quantity, 0),
          items: newRoundItems,
        });

        return { ...t, orders: currentOrders, rounds: currentRounds, status: "occupied" };
      })
    );

    setShowAddProductModal(false);
    setProductQuantities({});

    // Persistencia inmediata en PostgreSQL vía POST /api/orders (registra comanda con su createdAt)
    setIsSavingOrder(true);
    setOrderSyncError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: String(currentTable.number),
          items: itemsToPersist,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al sincronizar comanda con la base de datos");
      }

      const data = await res.json();
      if (data.activeOrders && Array.isArray(data.activeOrders)) {
        syncTableWithActiveOrders(currentTable.number, data.activeOrders);
      }
    } catch (err: any) {
      console.error("Error persistiendo comanda en BD:", err);
      setOrderSyncError(err.message || "Error al guardar el pedido en la base de datos");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleUpdateOrderItemQuantity = async (
    productId: number | string,
    newQty: number,
    orderItemId?: string,
    orderId?: string
  ) => {
    if (!currentTable) return;

    // Actualización optimista en React tanto en rounds como en orders
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableId) return t;

        // Actualizar en rounds
        const currentRounds = (t.rounds || []).map((rnd) => {
          if (orderId && rnd.id !== orderId) return rnd;
          const updatedItems = rnd.items
            .map((it) => {
              const matches = orderItemId
                ? it.id === orderItemId
                : String(it.productId) === String(productId);
              return matches ? { ...it, quantity: newQty } : it;
            })
            .filter((it) => it.quantity > 0);

          return {
            ...rnd,
            items: updatedItems,
            total: updatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0),
          };
        }).filter((rnd) => rnd.items.length > 0);

        // Reconstruir lista consolidada
        const consolidatedMap: Record<string, OrderItem> = {};
        currentRounds.forEach((rnd) => {
          rnd.items.forEach((it) => {
            const key = String(it.productId || it.name);
            if (consolidatedMap[key]) {
              consolidatedMap[key].quantity += it.quantity;
            } else {
              consolidatedMap[key] = { ...it };
            }
          });
        });

        const updatedOrders =
          currentRounds.length > 0
            ? Object.values(consolidatedMap)
            : (t.orders || [])
                .map((o) => (String(o.productId) === String(productId) ? { ...o, quantity: newQty } : o))
                .filter((o) => o.quantity > 0);

        return { ...t, orders: updatedOrders, rounds: currentRounds };
      })
    );

    // Persistencia inmediata en PostgreSQL vía PATCH /api/orders
    setIsSavingOrder(true);
    setOrderSyncError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: String(currentTable.number),
          productId: String(productId),
          orderItemId,
          orderId,
          quantity: newQty,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar cantidad en la base de datos");
      }

      const data = await res.json();
      if (data.activeOrders && Array.isArray(data.activeOrders)) {
        syncTableWithActiveOrders(currentTable.number, data.activeOrders);
      }
    } catch (err: any) {
      console.error("Error actualizando cantidad en BD:", err);
      setOrderSyncError(err.message || "Error al actualizar consumo en la base de datos");
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Cálculos de cuenta usando utilidades de facturación
  const tableBillSubtotal = currentTable?.orders
    ? calculateSubtotal(currentTable.orders)
    : 0;

  const tipAmount = calculateTip(tableBillSubtotal, includeTip, tipPercentage, customTipAmount);
  const totalWithTip = calculateTotal(tableBillSubtotal, tipAmount);

  // Cálculos para pago en Efectivo (Devuelta / Cambio y Validación)
  const { numCash, isInsufficient: isCashInsufficient, change: changeAmount } = validateCashPayment(
    totalWithTip,
    cashReceived
  );

  // Facturar / Cobrar y Cerrar Mesa
  const processCheckout = () => {
    if (!currentTable || !currentTable.orders || currentTable.orders.length === 0) return;
    if (isCashInsufficient) return;

    const salesKey = `ecopost_sales_${businessId}`;
    const savedSalesStr = localStorage.getItem(salesKey);
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

    // Preparar ticket térmico
    const generatedReceipt: ReceiptData = {
      invoiceNumber: `FAC-${nextFacNum}`,
      table: `Mesa ${currentTable.number}`,
      waiter: currentTable.waiter || "Mesero",
      guestCount: currentTable.guestCount || 1,
      date: now.toLocaleString(),
      items: currentTable.orders.map((o) => ({
        name: o.name,
        price: o.price,
        quantity: o.quantity,
      })),
      subtotal: tableBillSubtotal,
      tip: tipAmount,
      total: totalWithTip,
      paymentMethod: checkoutPaymentMethod,
      cashReceived: checkoutPaymentMethod === "Efectivo" ? numCash : undefined,
      change: checkoutPaymentMethod === "Efectivo" ? changeAmount : undefined,
    };

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

    localStorage.setItem(salesKey, JSON.stringify([newSale, ...salesList]));

    // Guardar venta y liberar mesa en PostgreSQL
    fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: `FAC-${nextFacNum}`,
        table: `Mesa ${currentTable.number}`,
        subtotal: tableBillSubtotal,
        tip: tipAmount,
        total: totalWithTip,
        paymentMethod: checkoutPaymentMethod,
        cashReceived: checkoutPaymentMethod === "Efectivo" ? numCash : undefined,
        change: checkoutPaymentMethod === "Efectivo" ? changeAmount : undefined,
        waiter: currentTable.waiter,
        guestCount: currentTable.guestCount || 1,
        saleType: "Mesas",
        itemsCount: currentTable.orders.reduce((sum, i) => sum + i.quantity, 0),
      }),
    }).catch((err) => console.error("Error guardando venta en PostgreSQL:", err));

    fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: String(currentTable.number),
        status: "free",
        waiter: null,
        guestCount: 1,
        comment: null,
      }),
    }).catch((err) => console.error("Error liberando mesa en PostgreSQL:", err));

    // Marcar órdenes como pagadas en PostgreSQL
    fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: String(currentTable.number),
        action: "paid",
      }),
    }).catch((err) => console.error("Error marcando órdenes como pagadas en PostgreSQL:", err));

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
              rounds: undefined,
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

    // Abrir vista previa del ticket para imprimir
    setReceiptData(generatedReceipt);
    setShowReceiptModal(true);
  };

  // Categorías de productos disponibles
  const categories = ["Todas", ...Array.from(new Set(availableProducts.map((p) => p.category)))];

  const selectedProductsTotalItems = Object.values(productQuantities).reduce((a, b) => a + b, 0);
  const selectedProductsTotalPrice = Object.entries(productQuantities).reduce((sum, [id, qty]) => {
    const p = availableProducts.find((item) => String(item.id) === String(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ─── Top Tab Bar ─── */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#12151e]/90 p-4 backdrop-blur-xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["Mesas", "Mostrador", "Domicilio +", "Mostrador express"].map((tab, i) => (
              <button
                key={tab}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  i === 0
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-zinc-950/70 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-white/[0.06]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/[0.08] bg-zinc-950 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Salón Principal
            </span>
            <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-black text-orange-400">
              {occupiedCount}/{tables.length} ocupadas
            </span>
          </div>
        </div>
      </section>

      {/* ─── Main Grid ─── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* ─── Table Grid ─── */}
        <section className="rounded-3xl border border-white/[0.08] bg-[#12151e]/90 p-6 backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutGrid size={18} className="text-orange-400" />
                <span>Mesas del Salón</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {occupiedCount} ocupadas · {tables.length - occupiedCount} disponibles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <Plus size={16} />
              <span>Agregar Mesa</span>
            </button>
          </div>

          {/* Grid */}
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3 border border-dashed border-white/[0.08] rounded-2xl bg-zinc-950/40">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-500">
                <LayoutGrid size={28} />
              </div>
              <p className="text-sm font-medium">No hay mesas configuradas</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2 hover:bg-orange-500/20 transition"
              >
                Agregar primera mesa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  isSelected={activeTableId === table.id}
                  onSelect={handleSelectTable}
                  onDeleteClick={setShowDeleteConfirm}
                />
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
          <TableDetailPane
            currentTable={currentTable}
            tableBillSubtotal={tableBillSubtotal}
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            selectedWaiter={selectedWaiter}
            setSelectedWaiter={setSelectedWaiter}
            comment={comment}
            setComment={setComment}
            handleOpenTable={handleOpenTable}
            handleCloseTable={handleCloseTable}
            onDeleteClick={setShowDeleteConfirm}
            openAddProductsModal={openAddProductsModal}
            handleUpdateOrderItemQuantity={handleUpdateOrderItemQuantity}
            openCheckoutModal={() => setShowCheckoutModal(true)}
            onOpenQRModal={() => setShowQRModal(true)}
            isSavingOrder={isSavingOrder}
            orderSyncError={orderSyncError}
            onClearOrderSyncError={() => setOrderSyncError(null)}
          />
        )}
      </div>

      {/* ─── MODAL FLOTANTE: AGREGAR PRODUCTOS ─── */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        tableNumber={currentTable?.number}
        availableProducts={availableProducts}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        productQuantities={productQuantities}
        handleQuantityChange={handleQuantityChange}
        handleSaveProductsToTable={handleSaveProductsToTable}
        selectedProductsTotalItems={selectedProductsTotalItems}
        selectedProductsTotalPrice={selectedProductsTotalPrice}
        existingTableOrders={currentTable?.orders}
        isSaving={isSavingOrder}
      />

      {/* ─── MODAL FLOTANTE: CIERRE DE MESA O PAGAR ─── */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        currentTable={currentTable}
        tableBillSubtotal={tableBillSubtotal}
        checkoutPaymentMethod={checkoutPaymentMethod}
        setCheckoutPaymentMethod={setCheckoutPaymentMethod}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        includeTip={includeTip}
        setIncludeTip={setIncludeTip}
        tipPercentage={tipPercentage}
        setTipPercentage={setTipPercentage}
        customTipAmount={customTipAmount}
        setCustomTipAmount={setCustomTipAmount}
        tipAmount={tipAmount}
        totalWithTip={totalWithTip}
        changeAmount={changeAmount}
        numCash={numCash}
        isCashInsufficient={isCashInsufficient}
        processCheckout={processCheckout}
      />

      {/* ─── Add Table Modal ─── */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCapacity={newCapacity}
        setNewCapacity={setNewCapacity}
        handleAddTable={handleAddTable}
        nextTableNumber={tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1}
      />

      {/* ─── Delete Confirm Modal ─── */}
      <DeleteTableModal
        tableToDelete={tables.find((t) => t.id === showDeleteConfirm) || null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirmDelete={handleDeleteTable}
      />

      {/* ─── MODAL: TICKET TÉRMICO / IMPRESIÓN (80mm) ─── */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptData={receiptData}
      />

      {/* ─── MODAL: CÓDIGO QR DE MESA (Imprimible & Descargable) ─── */}
      {currentTable && (
        <TableQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          tableNumber={currentTable.number}
          businessCode={businessId || "demo"}
        />
      )}
    </div>
  );
}
