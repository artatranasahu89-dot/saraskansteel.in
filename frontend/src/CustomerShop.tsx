import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerShop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [qtyMap, setQtyMap] = useState<any>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: "Bearer " + token,
  };

  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getProductCategoryName = (product: any) => {
    return (
      product.category?.name ||
      product.categoryName ||
      product.type ||
      "Construction Material"
    );
  };

  const getProductCategoryId = (product: any) => {
    return (
      product.categoryId ||
      product.category?.id ||
      product.categoryName ||
      product.category?.name ||
      "OTHER"
    );
  };

  const getProductImage = (product: any) => {
    return (
      product.imageUrl ||
      product.productImage ||
      product.image ||
      product.photo ||
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80"
    );
  };

  const getProductUnit = (product: any) => {
    return product.unit || product.unitName || "PCS";
  };

  const getProductPrice = (product: any) => {
    return Number(product.price || product.sellingPrice || product.rate || 0);
  };

  const getProductStock = (product: any) => {
    return product.stock ?? product.availableStock ?? product.quantity ?? null;
  };

  const isAvailable = (product: any) => {
    const stock = getProductStock(product);

    if (stock === null || stock === undefined || stock === "") return true;

    return Number(stock) > 0;
  };

  const getCategoryIcon = (name: string) => {
    const lower = String(name || "").toLowerCase();

    if (lower.includes("cement")) return "🧱";
    if (lower.includes("tmt") || lower.includes("sariya") || lower.includes("bar")) return "🔩";
    if (lower.includes("sheet")) return "🏠";
    if (lower.includes("pipe")) return "🧵";
    if (lower.includes("chemical")) return "🧪";

    return "📦";
  };

  const readCart = () => {
    try {
      const cartText =
        localStorage.getItem("customerCart") ||
        localStorage.getItem("cart") ||
        "[]";

      const parsed = JSON.parse(cartText);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveCart = (items: any[]) => {
    localStorage.setItem("customerCart", JSON.stringify(items));
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const syncCart = () => {
    const cart = readCart();
    const map: any = {};

    cart.forEach((item: any) => {
      map[item.productId || item.id] = item.quantity || item.qty || 0;
    });

    const totalQty = cart.reduce(
      (sum: number, item: any) => sum + Number(item.quantity || item.qty || 0),
      0
    );

    const totalValue = cart.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price || item.unitPrice || 0) * Number(item.quantity || item.qty || 0),
      0
    );

    setQtyMap(map);
    setCartCount(totalQty);
    setCartValue(totalValue);
  };

  const buildCategoriesFromProducts = (items: any[]) => {
    const map = new Map();

    items.forEach((product) => {
      const id = getProductCategoryId(product);
      const name = getProductCategoryName(product);

      if (!map.has(id)) {
        map.set(id, {
          id,
          name,
          icon: getCategoryIcon(name),
        });
      }
    });

    return Array.from(map.values());
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const productRes = await axios.get("http://localhost:5000/api/products", {
        headers,
      });

      const productList = (productRes.data?.data || productRes.data?.products || []).filter(
        (product: any) => product.isActive !== false
      );

      setProducts(productList);

      try {
        const categoryRes = await axios.get("http://localhost:5000/api/categories", {
          headers,
        });

        const categoryList = categoryRes.data?.data || categoryRes.data?.categories || [];

        if (categoryList.length > 0) {
          setCategories(
            categoryList.map((category: any) => ({
              ...category,
              id: category.id || category.name,
              name: category.name || "Category",
              icon: getCategoryIcon(category.name),
            }))
          );
        } else {
          setCategories(buildCategoriesFromProducts(productList));
        }
      } catch {
        setCategories(buildCategoriesFromProducts(productList));
      }
    } catch (error) {
      console.log("Customer shop load error:", error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
      syncCart();
    }
  };

  useEffect(() => {
    loadData();
    syncCart();

    const onCartUpdate = () => syncCart();
    window.addEventListener("cartUpdated", onCartUpdate);

    return () => window.removeEventListener("cartUpdated", onCartUpdate);
  }, []);

  const updateCartAuto = (product: any, value: any) => {
    const qty = Math.max(0, Number(value || 0));

    setQtyMap((prev: any) => ({
      ...prev,
      [product.id]: qty === 0 ? "" : qty,
    }));

    let cart = readCart();

    if (qty <= 0) {
      cart = cart.filter((item: any) => item.productId !== product.id && item.id !== product.id);
    } else {
      const existing = cart.find(
        (item: any) => item.productId === product.id || item.id === product.id
      );

      const cartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        productName: product.name,
        price: getProductPrice(product),
        unitPrice: getProductPrice(product),
        unit: getProductUnit(product),
        categoryName: getProductCategoryName(product),
        imageUrl: getProductImage(product),
        description: product.description || "",
        quantity: qty,
        qty,
        product,
      };

      if (existing) {
        cart = cart.map((item: any) =>
          item.productId === product.id || item.id === product.id
            ? {
                ...item,
                ...cartItem,
              }
            : item
        );
      } else {
        cart.push(cartItem);
      }
    }

    saveCart(cart);
    syncCart();
  };

  const changeQty = (product: any, diff: number) => {
    const current = Number(qtyMap[product.id] || 0);
    const next = Math.max(0, current + diff);

    updateCartAuto(product, next);
  };

  const clearSearch = () => {
    setSearch("");
    setSelectedCategory("ALL");
  };

  const categoryList = [
    {
      id: "ALL",
      name: "All Products",
      icon: "🏗️",
    },
    ...categories,
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryId = getProductCategoryId(product);

      const categoryMatch =
        selectedCategory === "ALL" ||
        categoryId === selectedCategory ||
        getProductCategoryName(product) === selectedCategory;

      const text = `
        ${product.name || ""}
        ${product.sku || ""}
        ${product.description || ""}
        ${getProductCategoryName(product)}
      `.toLowerCase();

      const searchMatch = text.includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [products, search, selectedCategory]);

  const featuredProducts = products.slice(0, 3);

  return (
    <CustomerLayout>
      <style>{`
        .shop-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          padding-bottom: 110px;
          color: #111827;
        }

        .hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 36px;
          margin-bottom: 24px;
          box-shadow: 0 24px 60px rgba(15,23,42,.24);
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.22);
        }

        .hero-content,
        .cart-panel {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          color: #fde68a;
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 1000;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 1000;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          line-height: 1.8;
          margin: 14px 0 0;
          max-width: 760px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .btn {
          border: none;
          border-radius: 16px;
          padding: 13px 18px;
          font-weight: 1000;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          white-space: nowrap;
        }

        .btn-primary {
          background: #f59e0b;
          color: #111827;
          box-shadow: 0 14px 26px rgba(245,158,11,.25);
        }

        .btn-dark {
          background: #111827;
          color: white;
        }

        .btn-light {
          background: rgba(255,255,255,.12);
          color: white;
          border: 1px solid rgba(255,255,255,.22);
        }

        .cart-panel {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          padding: 22px;
        }

        .cart-panel h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 1000;
        }

        .cart-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,.16);
          padding: 14px 0;
          color: #e5e7eb;
          font-weight: 900;
        }

        .cart-row:last-child {
          border-bottom: none;
        }

        .cart-row b {
          color: white;
        }

        .filter-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 22px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          margin-bottom: 24px;
        }

        .search-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          margin-bottom: 18px;
        }

        .search {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
        }

        .search:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
          gap: 12px;
        }

        .category-card {
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 20px;
          padding: 16px 10px;
          min-height: 102px;
          text-align: center;
          font-weight: 1000;
          cursor: pointer;
          transition: .25s;
          color: #111827;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 28px rgba(15,23,42,.10);
        }

        .category-card span {
          display: block;
          font-size: 30px;
          margin-bottom: 8px;
        }

        .category-card.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .featured-card {
          background:
            linear-gradient(135deg, rgba(17,24,39,.92), rgba(41,37,36,.86)),
            var(--img);
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 28px;
          padding: 24px;
          min-height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(15,23,42,.12);
        }

        .featured-card small {
          color: #fbbf24;
          font-weight: 1000;
          margin-bottom: 6px;
        }

        .featured-card h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 1000;
        }

        .featured-card p {
          margin: 8px 0 0;
          color: #e5e7eb;
          font-weight: 800;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          margin-bottom: 18px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 30px;
          font-weight: 1000;
        }

        .section-head small {
          color: #64748b;
          font-weight: 1000;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 18px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          display: flex;
          flex-direction: column;
          min-height: 430px;
          transition: .25s;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 26px 55px rgba(15,23,42,.14);
        }

        .image-box {
          height: 180px;
          border-radius: 24px;
          background-size: cover;
          background-position: center;
          background-color: #fef3c7;
          margin-bottom: 15px;
          position: relative;
          overflow: hidden;
        }

        .image-box::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.28), transparent 55%);
        }

        .stock-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 2;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          background: #dcfce7;
          color: #166534;
        }

        .stock-badge.out {
          background: #fee2e2;
          color: #991b1b;
        }

        .product-name {
          font-size: 21px;
          font-weight: 1000;
          margin: 0;
          line-height: 1.25;
          min-height: 52px;
        }

        .cat-name {
          display: inline-flex;
          width: fit-content;
          color: #92400e;
          background: #fef3c7;
          font-size: 12px;
          font-weight: 1000;
          margin: 10px 0;
          padding: 6px 11px;
          border-radius: 999px;
        }

        .description {
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 12px;
          min-height: 44px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }

        .price {
          color: #16a34a;
          font-size: 22px;
          font-weight: 1000;
        }

        .unit {
          color: #64748b;
          font-size: 13px;
          font-weight: 1000;
        }

        .cart-status {
          min-height: 24px;
          font-size: 13px;
          font-weight: 1000;
          color: #d97706;
          margin-bottom: 12px;
        }

        .qty-control {
          margin-top: auto;
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          gap: 10px;
          align-items: center;
        }

        .qty-control button {
          height: 48px;
          border: none;
          border-radius: 16px;
          background: #111827;
          color: white;
          font-size: 22px;
          font-weight: 1000;
          cursor: pointer;
        }

        .qty-control button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .qty-input-wrap {
          display: grid;
          grid-template-columns: 1fr 64px;
          border: 1px solid #d1d5db;
          border-radius: 16px;
          overflow: hidden;
          height: 48px;
          background: white;
        }

        .qty-input {
          border: none;
          padding: 0 12px;
          font-weight: 1000;
          width: 100%;
          outline: none;
          font-size: 15px;
        }

        .unit-label {
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 1000;
          color: #374151;
          padding: 0 6px;
        }

        .sticky-cart {
          position: fixed;
          left: 22px;
          right: 22px;
          bottom: 18px;
          background:
            linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 24px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 18px 46px rgba(0,0,0,.35);
          z-index: 999;
          border: 1px solid rgba(255,255,255,.12);
        }

        .sticky-cart b {
          font-size: 16px;
        }

        .sticky-cart small {
          display: block;
          color: #d1d5db;
          margin-top: 3px;
          font-weight: 800;
        }

        .sticky-actions {
          display: flex;
          gap: 10px;
        }

        .empty {
          background: white;
          border: 2px dashed #cbd5e1;
          border-radius: 28px;
          padding: 42px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
          box-shadow: 0 16px 36px rgba(15,23,42,.06);
        }

        @media(max-width: 1100px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .featured-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width: 700px) {
          .shop-page {
            padding: 14px;
            padding-bottom: 125px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .hero-actions,
          .btn {
            width: 100%;
          }

          .search-row {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .products {
            grid-template-columns: 1fr;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .sticky-cart {
            left: 12px;
            right: 12px;
            bottom: 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .sticky-actions {
            display: grid;
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="shop-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">🛒 Customer Shop</div>

            <h1>
              Order quality <span>construction materials</span>
            </h1>

            <p>
              Select cement, sariya, sheets, pipes and construction products.
              Enter quantity and your cart updates automatically.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/customer-cart">
                🧺 View Cart
              </Link>

              <Link className="btn btn-light" to="/customer-dashboard">
                📊 Dashboard
              </Link>

              <Link className="btn btn-light" to="/home">
                🏠 Home
              </Link>
            </div>
          </div>

          <div className="cart-panel">
            <h2>Cart Summary</h2>

            <div className="cart-row">
              <span>Total Quantity</span>
              <b>{cartCount}</b>
            </div>

            <div className="cart-row">
              <span>Estimated Value</span>
              <b>₹{money(cartValue)}</b>
            </div>

            <div className="cart-row">
              <span>Selected Products</span>
              <b>{Object.values(qtyMap).filter((qty: any) => Number(qty || 0) > 0).length}</b>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/customer-cart")}
              >
                Proceed to Cart
              </button>
            </div>
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <div
                className="featured-card"
                key={product.id}
                style={{
                  ["--img" as any]: `url("${getProductImage(product)}")`,
                }}
              >
                <small>{getProductCategoryName(product)}</small>
                <h3>{product.name}</h3>
                <p>
                  ₹{money(getProductPrice(product))} / {getProductUnit(product)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="filter-card">
          <div className="search-row">
            <input
              className="search"
              placeholder="Search cement, TMT, sariya, pipe, sheet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn btn-dark" onClick={clearSearch}>
              Reset
            </button>
          </div>

          <div className="category-grid">
            {categoryList.map((category: any) => (
              <button
                key={category.id}
                className={
                  selectedCategory === category.id
                    ? "category-card active"
                    : "category-card"
                }
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{category.icon || getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="section-head">
          <h2>Products</h2>
          <small>{filteredProducts.length} items found</small>
        </div>

        {loading ? (
          <div className="empty">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">
            No products found. Try another search or category.
          </div>
        ) : (
          <div className="products">
            {filteredProducts.map((product) => {
              const available = isAvailable(product);
              const qty = qtyMap[product.id] || "";
              const stock = getProductStock(product);

              return (
                <div className="product-card" key={product.id}>
                  <div
                    className="image-box"
                    style={{
                      backgroundImage: `url("${getProductImage(product)}")`,
                    }}
                  >
                   
                  </div>

                  <h3 className="product-name">{product.name}</h3>

                  <div className="cat-name">
                    {getCategoryIcon(getProductCategoryName(product))}{" "}
                    {getProductCategoryName(product)}
                  </div>

                  <p className="description">
                    {product.description ||
                      "Quality construction material available at SARASKANA STEEL."}
                  </p>

                  <div className="price-row">
                    <div>
                      <div className="price">₹{money(getProductPrice(product))}</div>
                      <div className="unit">per {getProductUnit(product)}</div>
                    </div>
                  </div>

                  <div className="cart-status">
                    {Number(qty || 0) > 0
                      ? `In Cart: ${qty} ${getProductUnit(product)}`
                      : available
                      ? "Enter quantity to add"
                      : "Currently unavailable"}
                  </div>

                  <div className="qty-control">
                    <button
                      disabled={!available}
                      onClick={() => changeQty(product, -1)}
                    >
                      −
                    </button>

                    <div className="qty-input-wrap">
                      <input
                        className="qty-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={qty}
                        disabled={!available}
                        onChange={(e) => updateCartAuto(product, e.target.value)}
                      />

                      <div className="unit-label">{getProductUnit(product)}</div>
                    </div>

                    <button
                      disabled={!available}
                      onClick={() => changeQty(product, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cartCount > 0 && (
          <div className="sticky-cart">
            <div>
              <b>{cartCount} total quantity selected</b>
              <small>Estimated value: ₹{money(cartValue)}</small>
            </div>

            <div className="sticky-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/customer-cart")}
              >
                Go To Cart
              </button>

              <button
                className="btn btn-light"
                onClick={() => navigate("/customer-checkout")}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerShop;