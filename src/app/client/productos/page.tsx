"use client";

import React, { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: "disponible" | "agotado";
  description: string;
}

interface Category {
  key: string;
  name: string;
  icon: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { name: "Hamburguesas", key: "Hamburguesas", icon: "🍔" },
  { name: "Entradas", key: "Entradas", icon: "🍟" },
  { name: "Bebidas", key: "Bebidas", icon: "🍺" },
  { name: "Postres", key: "Postres", icon: "🍰" },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium de 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa EcoPost especial." },
  { id: 2, name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano, sazonadas con sal marina y pimentón ahumado." },
  { id: 3, name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
  { id: 4, name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
  { id: 5, name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "agotado", description: "Bizcocho tibio de chocolate relleno de fudge derretido, servido con helado de vainilla." },
  { id: 6, name: "Aros de Cebolla Crujientes", category: "Entradas", price: 5.50, stock: "disponible", description: "Aros de cebolla rebozados en panko, servidos con alioli de ajo asado." },
];

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal controls
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState<string | null>(null);

  // Form states for Product
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number | string>("");
  const [stock, setStock] = useState<"disponible" | "agotado">("disponible");
  const [description, setDescription] = useState("");

  // Form states for Category
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🍔");

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("ecopost_products");
    const savedCategories = localStorage.getItem("ecopost_categories");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem("ecopost_products", JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      localStorage.setItem("ecopost_categories", JSON.stringify(INITIAL_CATEGORIES));
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when products change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ecopost_products", JSON.stringify(products));
    }
  }, [products, isLoaded]);

  // Save to localStorage when categories change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ecopost_categories", JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  // Helper: Reset form
  const resetForm = () => {
    setName("");
    setCategory(categories[0]?.key || "Sin Categoría");
    setPrice("");
    setStock("disponible");
    setDescription("");
  };

  // Open form for adding
  const handleAddClick = () => {
    setEditingProduct(null);
    resetForm();
    setShowFormModal(true);
  };

  // Open form for editing
  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price);
    setStock(prod.stock);
    setDescription(prod.description);
    setShowFormModal(true);
  };

  // Save product (Add or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === "") return;

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) return;

    if (editingProduct) {
      // Edit
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, name, category, price: numPrice, stock, description }
            : p
        )
      );
    } else {
      // Add
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: nextId,
        name,
        category,
        price: numPrice,
        stock,
        description,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setShowFormModal(false);
    setEditingProduct(null);
    resetForm();
  };

  // Delete product
  const handleDeleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
  };

  // Add category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    if (
      categories.some((c) => c.key.toLowerCase() === cleanName.toLowerCase()) ||
      cleanName.toLowerCase() === "todos" ||
      cleanName.toLowerCase() === "sin categoría"
    ) {
      alert("Esa categoría ya existe o es un nombre reservado.");
      return;
    }

    const newCat: Category = {
      key: cleanName,
      name: cleanName,
      icon: newCategoryIcon || "🍽️",
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName("");
    setNewCategoryIcon("🍔");
    setShowCategoryModal(false);
  };

  // Delete category
  const handleDeleteCategory = (catKey: string) => {
    setCategories((prev) => prev.filter((c) => c.key !== catKey));
    setProducts((prev) =>
      prev.map((p) => (p.category === catKey ? { ...p, category: "Sin Categoría" } : p))
    );
    if (selectedCategory === catKey) {
      setSelectedCategory("Todos");
    }
    setShowDeleteCategoryConfirm(null);
  };

  // Filtering logic
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === "Todos" || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate counts dynamically
  const uncategorizedCount = products.filter((p) => p.category === "Sin Categoría").length;

  const categoriesList = [
    { name: "Todos los Platos", key: "Todos", icon: "🍽️" },
    ...categories,
    ...(uncategorizedCount > 0 ? [{ name: "Sin Categoría", key: "Sin Categoría", icon: "🏷️" }] : []),
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Menú y Catálogo de Productos</h2>
          <p className="text-sm text-zinc-400">Agrega, edita y gestiona el inventario de platos y bebidas del restaurante.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none w-full sm:w-64 transition-all placeholder:text-zinc-650"
          />
          <button
            onClick={handleAddClick}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 whitespace-nowrap"
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {/* Main layout: Sidebar categories + grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <aside className="w-full md:w-56 flex flex-col gap-2">
          <div className="flex justify-between items-center px-3 mb-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Categorías</span>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[10px] bg-zinc-900 border border-zinc-800 text-orange-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-zinc-800 hover:text-orange-300 transition-all"
            >
              + Nueva
            </button>
          </div>
          {categoriesList.map((cat) => {
            const count = cat.key === "Todos" 
              ? products.length 
              : products.filter((p) => p.category === cat.key).length;
            const active = selectedCategory === cat.key;
            const isDeletable = cat.key !== "Todos" && cat.key !== "Sin Categoría";
            return (
              <div key={cat.key} className="relative group/cat flex items-center w-full">
                <button
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex-1 flex justify-between items-center pl-4 ${isDeletable ? "pr-10" : "pr-4"} py-3 rounded-xl text-left text-xs font-semibold transition-all ${
                    active
                      ? "bg-orange-500 text-white animate-fade-in"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <span className="truncate mr-1">{cat.icon} {cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${active ? "bg-white/20 text-white" : "bg-zinc-950 text-zinc-500"}`}>
                    {count}
                  </span>
                </button>

                {isDeletable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteCategoryConfirm(cat.key);
                    }}
                    title="Eliminar categoría"
                    className="absolute right-2 opacity-0 group-hover/cat:opacity-100 focus:opacity-100 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg w-6 h-6 flex items-center justify-center text-[10px] transition-all shadow-md"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3 border border-zinc-800 bg-zinc-900/40 rounded-2xl">
              <span className="text-5xl">🍔</span>
              <p className="text-sm font-medium">No se encontraron productos en esta selección.</p>
              <button
                onClick={() => { setSelectedCategory("Todos"); setSearchQuery(""); }}
                className="mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 hover:bg-orange-500/20 transition"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs bg-zinc-950 text-orange-400 px-2.5 py-1 rounded-full border border-zinc-850 font-semibold truncate max-w-[120px]">
                        {prod.category}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                          prod.stock === "disponible"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {prod.stock}
                      </span>
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-zinc-550 line-clamp-3 mt-1.5 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex justify-between items-center border-t border-zinc-850 pt-4 mt-4">
                    <span className="text-lg font-bold text-white">${prod.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="text-[10px] bg-zinc-950 hover:bg-zinc-850 text-zinc-355 hover:text-white font-semibold px-3 py-1.5 rounded-lg border border-zinc-800 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(prod.id)}
                        className="text-[10px] bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 font-semibold px-3 py-1.5 rounded-lg border border-rose-900/20 transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Product Modal ─── */}
      {showFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-1">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              {editingProduct ? "Modifica los datos del producto seleccionado." : "Completa la información para registrar un nuevo producto."}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Hamburguesa EcoDouble"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key} className="bg-zinc-950">
                        {c.name}
                      </option>
                    ))}
                    {category === "Sin Categoría" && (
                      <option value="Sin Categoría" className="bg-zinc-950">Sin Categoría</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-white block mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej: 14.99"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-650"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-1">Disponibilidad (Stock)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="stock"
                      value="disponible"
                      checked={stock === "disponible"}
                      onChange={() => setStock("disponible")}
                      className="text-orange-550 focus:ring-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                    />
                    Disponible
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="stock"
                      value="agotado"
                      checked={stock === "agotado"}
                      onChange={() => setStock("agotado")}
                      className="text-orange-550 focus:ring-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                    />
                    Agotado
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalles sobre ingredientes, tamaño, etc..."
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-650"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Category Modal ─── */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-1">Agregar Categoría</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Crea una nueva categoría para clasificar tus platos y bebidas.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Pizzas, Ensaladas..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-650"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white block mb-1">Icono / Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {["🍕", "🥗", "🌮", "🍖", "🍦", "🍹", "☕", "🍣", "🍞", "🍽️"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCategoryIcon(emoji)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                        newCategoryIcon === emoji
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Product Confirm Modal ─── */}
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
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Eliminar Producto</h3>
                <p className="text-xs text-zinc-555">
                  ID: #{showDeleteConfirm}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              ¿Estás seguro de que deseas eliminar este producto del catálogo? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-sm font-semibold transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Category Confirm Modal ─── */}
      {showDeleteCategoryConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowDeleteCategoryConfirm(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Eliminar Categoría</h3>
                <p className="text-xs text-zinc-555">
                  Categoría: {showDeleteCategoryConfirm}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-6 font-medium">
              ¿Estás seguro de que deseas eliminar esta categoría?
              <span className="block mt-2 text-zinc-500 text-xs font-normal leading-relaxed">
                Nota: Todos los productos de esta categoría se cambiarán automáticamente a la sección de <strong>"Sin Categoría"</strong> para evitar su pérdida.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteCategoryConfirm(null)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCategory(showDeleteCategoryConfirm)}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-sm font-semibold transition"
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

