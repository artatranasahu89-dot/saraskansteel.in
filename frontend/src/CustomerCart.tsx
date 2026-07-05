import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerCart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any[]>([]);
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

  const getProduct = (item: any) => {
    return item.product || item.productData || item;
  };

  const getItemId = (item: any) => {
    return item.id || item.cartItemId || item.productId || getProduct(item)?.id;
  };

  const getProductId = (item: any) => {
    return item.productId || item.product?.id || item.id;
  };

  const getName = (item: any) => {
    const product = getProduct(item);

    return (
      product?.name ||
      item.productName ||
      item.name ||
      item.itemName ||
      "Product"
    );
  };

  const getCategory = (item: any) => {
    const product = getProduct(item);

    return (
      product?.category?.name ||
      product?.categoryName ||
      item.categoryName ||
      item.category ||
      "Construction Material"
    );
  };

  const getImage = (item: any) => {
    const product = getProduct(item);

    return (
      product?.imageUrl ||
      product?.productImage ||
      product?.image ||
      item.imageUrl ||
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80"
    );
  };

  const getUnit = (item: any) => {
    const product = getProduct(item);

    return product?.unit || item.unit || "";
  };

  const getPrice = (item: any) => {
    const product = getProduct(item);

    return Number(
      item.price ||
        item.unitPrice ||
        product?.price ||
        product?.sellingPrice ||
        0
    );
  };

  const getQuantity = (item: any) => {
    return Number(item.quantity || item.qty || item.bags || 1);
  };

  const getLineTotal = (item: any) => {
    return getPrice(item) * getQuantity(item);
  };

  const extractCartItems = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.cartItems)) return data.cartItems;
    if (Array.isArray(data?.cart?.items)) return data.cart.items;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    if (Array.isArray(data?.data?.cartItems)) return data.data.cartItems;
    if (Array.isArray(data?.data?.cart?.items)) return data.data.cart.items;

    return [];
  };

  const readLocalCart = () => {
    try {
      const local =
        localStorage.getItem("cart") ||
        localStorage.getItem("customerCart") ||
        "[]";

      const parsed = JSON.parse(local);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (items: any[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
    localStorage.setItem("customerCart", JSON.stringify(items));
  };

  const loadCart = async () => {
    try {
      setLoading(true);

      try {
        const res = await axios.get("https://saraskansteel-in.onrender.com/api/cart", {
          headers,
        });

        const items = extractCartItems(res.data);

        setCartItems(items);
        saveLocalCart(items);
      } catch (apiError) {
        console.log("Cart API load skipped, using local cart:", apiError);
        setCartItems(readLocalCart());
      }
    } catch (error) {
      console.log("Cart load error:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (item: any, nextQty: number) => {
    if (nextQty < 1) return;

    const itemId = getItemId(item);

    const updatedItems = cartItems.map((cartItem) =>
      getItemId(cartItem) === itemId
        ? {
            ...cartItem,
            quantity: nextQty,
            qty: nextQty,
          }
        : cartItem
    );

    setCartItems(updatedItems);
    saveLocalCart(updatedItems);

    try {
      await axios.put(
        `https://saraskansteel-in.onrender.com/api/cart/${itemId}`,
        {
          quantity: nextQty,
          qty: nextQty,
          productId: getProductId(item),
        },
        { headers }
      );
    } catch (error) {
      try {
        await axios.patch(
          `https://saraskansteel-in.onrender.com/api/cart/${itemId}`,
          {
            quantity: nextQty,
            qty: nextQty,
            productId: getProductId(item),
          },
          { headers }
        );
      } catch {
        console.log("Cart quantity updated locally");
      }
    }
  };

  const removeItem = async (item: any) => {
    const itemId = getItemId(item);

    const updatedItems = cartItems.filter(
      (cartItem) => getItemId(cartItem) !== itemId
    );

    setCartItems(updatedItems);
    saveLocalCart(updatedItems);

    try {
      await axios.delete(`https://saraskansteel-in.onrender.com/api/cart/${itemId}`, {
        headers,
      });
    } catch {
      console.log("Cart item removed locally");
    }
  };

  const clearCart = async () => {
    if (!confirm("Clear all items from cart?")) return;

    setCartItems([]);
    saveLocalCart([]);

    try {
      await axios.delete("https://saraskansteel-in.onrender.com/api/cart", { headers });
    } catch {
      console.log("Cart cleared locally");
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [cartItems]);

  const totalQty = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getQuantity(item), 0);
  }, [cartItems]);

  const proceedCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    saveLocalCart(cartItems);
    navigate("/customer-checkout");
  };

  return (
    <CustomerLayout>
      <style>{`
        .cart-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
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
          display: flex;
          justify-content: space-between;
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
        .hero-actions {
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

        .btn-red {
          background: #dc2626;
          color: white;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          position: relative;
          overflow: hidden;
        }

        .summary-card::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -52px;
          top: -52px;
          background: rgba(245,158,11,.14);
          border-radius: 50%;
        }

        .summary-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }

        .summary-card h3 {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .summary-card h2 {
          margin: 9px 0 0;
          font-size: 30px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .green { color: #16a34a; }
        .blue { color: #2563eb; }
        .red { color: #dc2626; }
        .orange { color: #d97706; }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 22px;
          align-items: start;
        }

        .cart-list,
        .checkout-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
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
          font-size: 28px;
          font-weight: 1000;
        }

        .item-list {
          display: grid;
          gap: 16px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 18px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 16px;
          transition: .25s;
        }

        .cart-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(15,23,42,.10);
        }

        .item-img {
          width: 120px;
          height: 120px;
          border-radius: 20px;
          background-size: cover;
          background-position: center;
          background-color: #fef3c7;
        }

        .item-info h3 {
          margin: 0;
          font-size: 22px;
          font-weight: 1000;
          color: #111827;
        }

        .category {
          display: inline-flex;
          background: #fef3c7;
          color: #92400e;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          margin: 10px 0;
        }

        .item-desc {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
          font-weight: 800;
        }

        .item-price {
          margin-top: 12px;
          color: #111827;
          font-weight: 1000;
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          min-width: 160px;
        }

        .qty-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 16px;
          overflow: hidden;
        }

        .qty-box button {
          width: 42px;
          height: 42px;
          border: none;
          background: #111827;
          color: white;
          font-weight: 1000;
          cursor: pointer;
          font-size: 18px;
        }

        .qty-box span {
          min-width: 54px;
          text-align: center;
          font-weight: 1000;
          font-size: 16px;
        }

        .line-total {
          font-size: 22px;
          font-weight: 1000;
          color: #16a34a;
        }

        .remove-btn {
          border: none;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 14px;
          padding: 10px 13px;
          font-weight: 1000;
          cursor: pointer;
        }

        .checkout-card {
          position: sticky;
          top: 96px;
        }

        .checkout-card h2 {
          margin: 0 0 18px;
          font-size: 28px;
          font-weight: 1000;
        }

        .bill-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #e5e7eb;
          color: #475569;
          font-weight: 900;
        }

        .bill-row b {
          color: #111827;
        }

        .bill-total {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 0;
          font-size: 22px;
          font-weight: 1000;
        }

        .cart-note {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          border-radius: 18px;
          padding: 14px;
          line-height: 1.6;
          font-weight: 900;
          margin: 16px 0;
        }

        .checkout-actions {
          display: grid;
          gap: 12px;
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

        .empty h2 {
          color: #111827;
          margin: 0 0 10px;
        }

        @media(max-width: 1100px) {
          .hero,
          .cart-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .checkout-card {
            position: static;
          }
        }

        @media(max-width: 700px) {
          .cart-page {
            padding: 14px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
            flex-direction: column;
            align-items: flex-start;
          }

          .hero h1 {
            font-size: 34px;
          }

          .hero-actions,
          .btn {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .cart-item {
            grid-template-columns: 1fr;
          }

          .item-img {
            width: 100%;
            height: 210px;
          }

          .item-actions {
            align-items: stretch;
            min-width: 100%;
          }

          .qty-box {
            justify-content: space-between;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="cart-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">🛒 Customer Cart</div>

            <h1>
              Review your <span>material cart</span>
            </h1>

            <p>
              Check selected products, quantities and estimated value before
              placing your STRIDE order.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/customer-shop">
              Add Products
            </Link>

            <Link className="btn btn-light" to="/customer-dashboard">
              Dashboard
            </Link>

            <Link className="btn btn-light" to="/home">
              Home
            </Link>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <h3>Total Items</h3>
            <h2>{cartItems.length}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🔢</div>
            <h3>Total Quantity</h3>
            <h2 className="blue">{totalQty}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Estimated Value</h3>
            <h2 className="orange">₹{money(subtotal)}</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="empty">
            <h2>Your cart is empty</h2>
            <p>Add products from the customer shop to place an order.</p>

            <div style={{ marginTop: 18 }}>
              <Link className="btn btn-primary" to="/customer-shop">
                Go to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-list">
              <div className="section-head">
                <h2>Cart Items</h2>

                <button className="btn btn-red" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>

              <div className="item-list">
                {cartItems.map((item) => (
                  <div className="cart-item" key={getItemId(item)}>
                    <div
                      className="item-img"
                      style={{
                        backgroundImage: `url("${getImage(item)}")`,
                      }}
                    />

                    <div className="item-info">
                      <h3>{getName(item)}</h3>

                      <div className="category">{getCategory(item)}</div>

                      <p className="item-desc">
                        {getProduct(item)?.description ||
                          item.description ||
                          "Quality construction material available at SARASKANA STEEL."}
                      </p>

                      <div className="item-price">
                        Rate: ₹{money(getPrice(item))}
                        {getUnit(item) ? ` / ${getUnit(item)}` : ""}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="qty-box">
                        <button
                          onClick={() =>
                            updateQuantity(item, getQuantity(item) - 1)
                          }
                        >
                          −
                        </button>

                        <span>{getQuantity(item)}</span>

                        <button
                          onClick={() =>
                            updateQuantity(item, getQuantity(item) + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="line-total">
                        ₹{money(getLineTotal(item))}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <h2>Order Summary</h2>

              <div className="bill-row">
                <span>Items</span>
                <b>{cartItems.length}</b>
              </div>

              <div className="bill-row">
                <span>Total Quantity</span>
                <b>{totalQty}</b>
              </div>

              <div className="bill-row">
                <span>Estimated Subtotal</span>
                <b>₹{money(subtotal)}</b>
              </div>

              <div className="bill-total">
                <span>Total</span>
                <span>₹{money(subtotal)}</span>
              </div>

              <div className="cart-note">
                Final amount, delivery charge, labour charge, discounts and
                billing details will be confirmed during checkout/billing.
              </div>

              <div className="checkout-actions">
                <button className="btn btn-primary" onClick={proceedCheckout}>
                  Proceed to Checkout
                </button>

                <Link className="btn btn-dark" to="/customer-shop">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerCart;