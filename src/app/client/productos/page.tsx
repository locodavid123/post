"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, UtensilsCrossed } from "lucide-react";
import {
  Product,
  Category,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  ProductCard,
  CategorySidebar,
  CategoryItem,
  ProductFormModal,
  CategoryModal,
  DeleteProductModal,
  DeleteCategoryModal,
} from "@/components/client/productos";

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Modal controls
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | string | null>(null);
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

  // Load from localStorage & sync from PostgreSQL once businessId is resolved
  useEffect(() => {
    if (!businessId) return;

    const prodKey = `ecopost_products_${businessId}`;
    const catKey = `ecopost_categories_${businessId}`;

    const loadData = () => {
      const savedProducts = localStorage.getItem(prodKey);
      const savedCategories = localStorage.getItem(catKey);

      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error("Error cargando productos guardados:", e);
        }
      } else {
        setProducts([]);
      }

      if (savedCategories) {
        try {
          setCategories(JSON.parse(savedCategories));
        } catch (e) {
          console.error("Error cargando categorías guardadas:", e);
        }
      } else {
        localStorage.setItem(catKey, JSON.stringify(INITIAL_CATEGORIES));
        setCategories(INITIAL_CATEGORIES);
      }
    };

    loadData();
    setIsLoaded(true);

    // Sincronizar catálogo desde PostgreSQL
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((dbProducts) => {
        if (Array.isArray(dbProducts)) {
          const mapped: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            description: p.description || "",
            imageUrl: p.imageUrl || undefined,
          }));
          setProducts(mapped);
          localStorage.setItem(prodKey, JSON.stringify(mapped));
        }
      })
      .catch((err) => console.error("Error sincronizando productos con PostgreSQL:", err));

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === prodKey || e.key === catKey) {
        loadData();
      }
    };

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [businessId]);

  // Save to localStorage when products change
  useEffect(() => {
    if (isLoaded && businessId) {
      localStorage.setItem(`ecopost_products_${businessId}`, JSON.stringify(products));
    }
  }, [products, isLoaded, businessId]);

  // Save to localStorage when categories change
  useEffect(() => {
    if (isLoaded && businessId) {
      localStorage.setItem(`ecopost_categories_${businessId}`, JSON.stringify(categories));
    }
  }, [categories, isLoaded, businessId]);

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
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === "") return;

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) return;

    if (editingProduct) {
      // Edit
      const updatedProduct: Product = {
        ...editingProduct,
        name,
        category,
        price: numPrice,
        stock,
        description,
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );

      // Actualizar en PostgreSQL
      fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, price: numPrice, stock, description }),
      }).catch((err) => console.error("Error actualizando en BD:", err));
    } else {
      // Add
      const tempId = `temp-${Date.now()}`;
      const newProduct: Product = {
        id: tempId,
        name,
        category,
        price: numPrice,
        stock,
        description,
      };

      // Guardar en PostgreSQL
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, price: numPrice, stock, description }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((created) => {
          if (created?.id) {
            setProducts((prev) =>
              prev.map((p) => (p.id === tempId ? { ...p, id: created.id } : p))
            );
          }
        })
        .catch((err) => console.error("Error guardando producto en BD:", err));

      setProducts((prev) => [newProduct, ...prev]);
    }

    setShowFormModal(false);
    setEditingProduct(null);
    resetForm();
  };

  // Delete product
  const handleDeleteProduct = (id: number | string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);

    fetch(`/api/products/${id}`, { method: "DELETE" }).catch((err) =>
      console.error("Error eliminando producto de BD:", err)
    );
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

  const categoriesList: CategoryItem[] = [
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
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar plato o bebida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12151e] border border-white/[0.08] text-zinc-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none transition-all placeholder:text-zinc-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap active:scale-95"
          >
            <Plus size={15} />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Main layout: Sidebar categories + grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <CategorySidebar
          categoriesList={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          products={products}
          onOpenNewCategory={() => setShowCategoryModal(true)}
          onDeleteCategoryClick={setShowDeleteCategoryConfirm}
        />

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3 border border-white/[0.06] bg-[#12151e]/40 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <UtensilsCrossed size={28} />
              </div>
              <p className="text-base font-bold text-white">Tu catálogo está vacío</p>
              <p className="text-xs text-zinc-400 max-w-sm text-center">
                Aún no tienes platos o bebidas registrados. Agrega tu primer producto para empezar a comandar en el salón.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setShowFormModal(true);
                }}
                className="mt-2 flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 transition shadow-lg shadow-orange-500/20"
              >
                <Plus size={15} />
                <span>Agregar Primer Producto</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3 border border-white/[0.06] bg-[#12151e]/40 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-500">
                <UtensilsCrossed size={28} />
              </div>
              <p className="text-sm font-medium">No se encontraron productos en esta selección.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory("Todos"); setSearchQuery(""); }}
                className="mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2 hover:bg-orange-500/20 transition"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onEdit={handleEditClick}
                  onDelete={setShowDeleteConfirm}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Product Modal ─── */}
      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        editingProduct={editingProduct}
        name={name}
        setName={setName}
        category={category}
        setCategory={setCategory}
        categories={categories}
        price={price}
        setPrice={setPrice}
        stock={stock}
        setStock={setStock}
        description={description}
        setDescription={setDescription}
        onSubmit={handleSave}
      />

      {/* ─── Add Category Modal ─── */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryIcon={newCategoryIcon}
        setNewCategoryIcon={setNewCategoryIcon}
        onSubmit={handleAddCategory}
      />

      {/* ─── Delete Product Confirm Modal ─── */}
      <DeleteProductModal
        productId={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* ─── Delete Category Confirm Modal ─── */}
      <DeleteCategoryModal
        categoryKey={showDeleteCategoryConfirm}
        onClose={() => setShowDeleteCategoryConfirm(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
