import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const closeMenu = () => setMenuOpen(false);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("customerCart") ||
          localStorage.getItem("cart") ||
          "[]"
      );

      const totalQty = Array.isArray(cart)
        ? cart.reduce(
            (sum: number, item: any) =>
              sum + Number(item.quantity || item.qty || 0),
            0
          )
        : 0;

      setCartCount(totalQty);
    } catch {
      setCartCount(0);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/home");
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const customerId =
    user.customerNumber ||
    user.customerId ||
    user.customerCode ||
    user.id ||
    "-";

  return (
    <div className="customer-root">
      <style>{`
        .customer-root {
          min-height: 100vh;
          background: #f8fafc;
        }

        .customer-topbar {
          height: 78px;
          background:
            linear-gradient(135deg, rgba(17,24,39,.98), rgba(41,37,36,.96));
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 14px 34px rgba(15,23,42,.28);
          border-bottom: 1px solid rgba(255,255,255,.10);
        }

        .customer-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .menu-btn {
          width: 48px;
          height: 48px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          background: rgba(255,255,255,.08);
          color: white;
          font-size: 25px;
          cursor: pointer;
        }

        .brand {
          text-decoration: none;
          color: white;
          font-size: 26px;
          font-weight: 1000;
          letter-spacing: .8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .brand span {
          color: #f59e0b;
        }

        .customer-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav a {
          color: white;
          text-decoration: none;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          padding: 11px 14px;
          border-radius: 999px;
          font-weight: 1000;
          white-space: nowrap;
          transition: .2s;
        }

        .nav a:hover {
          background: #f59e0b;
          color: #111827;
          transform: translateY(-2px);
        }

        .cart-link {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -9px;
          right: -7px;
          min-width: 23px;
          height: 23px;
          border-radius: 999px;
          background: #16a34a;
          color: white;
          font-size: 12px;
          font-weight: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #111827;
        }

        .lang-select {
          height: 44px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 14px;
          padding: 0 10px;
          font-weight: 1000;
          background: rgba(255,255,255,.08);
          color: white;
          cursor: pointer;
        }

        .lang-select option {
          color: #111827;
        }

        .theme-btn {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 50%;
          background: rgba(255,255,255,.08);
          color: white;
          font-size: 19px;
          cursor: pointer;
        }

        .profile {
          position: relative;
        }

        .profile-btn {
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 7px 12px 7px 7px;
          cursor: pointer;
          font-weight: 1000;
          white-space: nowrap;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #92400e);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 1000;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-name {
          max-width: 145px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-menu {
          position: absolute;
          right: 0;
          top: 60px;
          width: 280px;
          background: white;
          color: #111827;
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 24px 55px rgba(0,0,0,.22);
          z-index: 1200;
          border: 1px solid #e5e7eb;
        }

        .profile-menu h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 1000;
        }

        .profile-menu p {
          margin: 7px 0;
          color: #64748b;
          font-weight: 800;
        }

        .profile-actions {
          display: grid;
          gap: 9px;
          margin-top: 14px;
        }

        .profile-actions a,
        .logout {
          border: none;
          border-radius: 14px;
          padding: 12px;
          font-weight: 1000;
          text-decoration: none;
          cursor: pointer;
          text-align: center;
        }

        .profile-actions a {
          background: #111827;
          color: white;
        }

        .logout {
          background: #dc2626;
          color: white;
          width: 100%;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.42);
          z-index: 1001;
          backdrop-filter: blur(3px);
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 330px;
          max-width: 90vw;
          height: 100vh;
          background: white;
          z-index: 1002;
          box-shadow: 14px 0 40px rgba(0,0,0,.24);
          overflow-y: auto;
        }

        .sidebar-head {
          background:
            linear-gradient(135deg, rgba(17,24,39,.98), rgba(41,37,36,.96));
          color: white;
          padding: 22px;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sidebar-head h2 {
          margin: 0;
          font-size: 27px;
          font-weight: 1000;
        }

        .sidebar-head h2 span {
          color: #f59e0b;
        }

        .sidebar-head p {
          margin: 8px 0 0;
          color: #d1d5db;
          font-weight: 800;
        }

        .close {
          border: none;
          border-radius: 12px;
          background: rgba(255,255,255,.14);
          color: white;
          padding: 9px 12px;
          cursor: pointer;
          font-weight: 1000;
        }

        .sidebar-body {
          padding: 16px;
        }

        .group {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .group-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 1000;
          letter-spacing: .9px;
          margin: 8px 0 10px;
        }

        .sidebar a {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #111827;
          padding: 13px;
          border-radius: 16px;
          font-weight: 1000;
          transition: .18s;
        }

        .sidebar a:hover {
          background: #fef3c7;
          color: #92400e;
          transform: translateX(4px);
        }

        .sidebar-select {
          width: 100%;
          height: 46px;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          padding: 0 12px;
          font-weight: 1000;
          background: #f8fafc;
          margin-bottom: 10px;
        }

        .sidebar-btn {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 12px;
          background: #111827;
          color: white;
          font-weight: 1000;
          cursor: pointer;
          margin-bottom: 10px;
        }

        .content {
          min-height: calc(100vh - 78px);
        }

        body[data-theme="dark"] {
          background: #0f172a;
          color: white;
        }

        body[data-theme="dark"] .customer-root,
        body[data-theme="dark"] .customer-page,
        body[data-theme="dark"] .orders-page,
        body[data-theme="dark"] .profile-page,
        body[data-theme="dark"] .invoice-page,
        body[data-theme="dark"] .points-page,
        body[data-theme="dark"] .track-page,
        body[data-theme="dark"] .cart-page,
        body[data-theme="dark"] .shop-page,
        body[data-theme="dark"] .checkout-page {
          background: #0f172a !important;
          color: white !important;
        }

        body[data-theme="dark"] .section,
        body[data-theme="dark"] .summary-card,
        body[data-theme="dark"] .quick-card,
        body[data-theme="dark"] .control-card,
        body[data-theme="dark"] .order-card,
        body[data-theme="dark"] .invoice-card,
        body[data-theme="dark"] .rules-card,
        body[data-theme="dark"] .history-section,
        body[data-theme="dark"] .side-panel,
        body[data-theme="dark"] .main-panel,
        body[data-theme="dark"] .cart-list,
        body[data-theme="dark"] .checkout-card,
        body[data-theme="dark"] .filter-card,
        body[data-theme="dark"] .product-card,
        body[data-theme="dark"] .order-summary,
        body[data-theme="dark"] .profile-menu,
        body[data-theme="dark"] .sidebar {
          background: #1e293b !important;
          color: white !important;
          border-color: #334155 !important;
        }

        body[data-theme="dark"] input,
        body[data-theme="dark"] select,
        body[data-theme="dark"] textarea {
          background: #334155 !important;
          color: white !important;
          border-color: #475569 !important;
        }

        body[data-theme="dark"] .sidebar a {
          color: white !important;
        }

        @media(max-width: 1150px) {
          .nav {
            display: none;
          }

          .customer-topbar {
            padding: 0 14px;
          }
        }

        @media(max-width: 700px) {
          .brand {
            font-size: 22px;
          }

          .lang-select {
            display: none;
          }

          .profile-name {
            display: none;
          }

          .customer-topbar {
            height: 72px;
          }

          .content {
            min-height: calc(100vh - 72px);
          }
        }
      `}</style>

      <header className="customer-topbar">
        <div className="customer-left">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <Link className="brand" to="/home">
            SARASKANA <span>STEEL</span>
          </Link>
        </div>

        <div className="customer-right">
          <nav className="nav">
            <Link to="/home">Home</Link>
            <Link to="/customer-dashboard">Dashboard</Link>
            <Link to="/customer-shop">Shop</Link>
            <Link to="/customer-orders">Orders</Link>
            <Link to="/customer-cart" className="cart-link">
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>

          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="od">ଓଡ଼ିଆ</option>
          </select>

          <button
            className="theme-btn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <div className="profile">
            <button
              className="profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name || "Customer"} />
                ) : (
                  (user.name || "C").slice(0, 1).toUpperCase()
                )}
              </div>

              <span className="profile-name">{user.name || "Customer"}</span>
              <span>▼</span>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <h3>{user.name || "Customer"}</h3>
                <p>Customer ID: {customerId}</p>
                <p>{user.mobile || user.email || "-"}</p>

                <div className="profile-actions">
                  <Link to="/customer-profile" onClick={() => setProfileOpen(false)}>
                    My Profile
                  </Link>

                  <button className="logout" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="overlay" onClick={closeMenu} />

          <aside className="sidebar">
            <div className="sidebar-head">
              <div className="sidebar-top">
                <h2>
                  SARASKANA <span>STEEL</span>
                </h2>

                <button className="close" onClick={closeMenu}>
                  ✕
                </button>
              </div>

              <p>STRIDE Customer Portal</p>
            </div>

            <div className="sidebar-body">
              

              <div className="group">
                <div className="group-title">Customer</div>
                <Link to="/customer-dashboard" onClick={closeMenu}>📊 Dashboard</Link>
                <Link to="/customer-shop" onClick={closeMenu}>🛒 Shop Materials</Link>
                <Link to="/customer-cart" onClick={closeMenu}>🧺 Cart ({cartCount})</Link>
                <Link to="/customer-checkout" onClick={closeMenu}>✅ Checkout</Link>
                <Link to="/customer-orders" onClick={closeMenu}>📦 My Orders</Link>
                <Link to="/customer-track-delivery" onClick={closeMenu}>🚚 Track Delivery</Link>
                <Link to="/customer-invoices" onClick={closeMenu}>🧾 My Bills</Link>
                <Link to="/customer-points" onClick={closeMenu}>🎁 Reward Points</Link>
                <Link to="/customer-profile" onClick={closeMenu}>👤 My Profile</Link>
              </div>

              <div className="group">
                <div className="group-title">Website</div>
                <Link to="/home" onClick={closeMenu}>🏠 Home Website</Link>
                <Link to="/about" onClick={closeMenu}>ℹ️ About</Link>
                <Link to="/contact" onClick={closeMenu}>☎️ Contact</Link>
              </div>

              <div className="group">
                <div className="group-title">Settings</div>

                <select
                  className="sidebar-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="od">ଓଡ଼ିଆ</option>
                </select>

                <button
                  className="sidebar-btn"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </button>

                <button className="logout" onClick={logout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <main className="content">{children}</main>
    </div>
  );
}

export default CustomerLayout;