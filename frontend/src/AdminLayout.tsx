import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "";

  const isStaff = role === "STAFF";
  const isAdmin = role === "ADMIN";

  const closeMenu = () => setMenuOpen(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/home");
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    const ONE_HOUR = 60 * 60 * 1000;

    const updateActivity = () => {
      localStorage.setItem("lastActivity", String(Date.now()));
    };

    const checkInactive = () => {
      const last = Number(localStorage.getItem("lastActivity") || Date.now());

      if (Date.now() - last > ONE_HOUR) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    updateActivity();

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    const timer = setInterval(checkInactive, 60 * 1000);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="layout-root">
      <style>{`
        .layout-root {
          min-height: 100vh;
          background: #f3f4f6;
        }

        .topbar {
          height: 72px;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }

        .left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .menu-btn {
          width: 46px;
          height: 46px;
          border: none;
          border-radius: 12px;
          background: #1f2937;
          color: white;
          font-size: 26px;
          cursor: pointer;
        }

        .brand {
          font-size: 28px;
          font-weight: 1000;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .right-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .quick-links {
          display: flex;
          flex-direction: row-reverse;
          gap: 10px;
          align-items: center;
        }

        .quick-links a {
          text-decoration: none;
          color: white;
          background: #2563eb;
          padding: 11px 15px;
          border-radius: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .lang-select {
          height: 42px;
          border: none;
          border-radius: 12px;
          padding: 0 10px;
          font-weight: 900;
          cursor: pointer;
          background: #1f2937;
          color: white;
        }

        .theme-btn {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          font-size: 19px;
          cursor: pointer;
        }

        .profile {
          position: relative;
        }

        .profile-btn {
          border: none;
          border-radius: 999px;
          background: #1f2937;
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px;
          cursor: pointer;
          font-weight: 900;
          width: auto;
          max-width: 260px;
          white-space: nowrap;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 1000;
        }

        .profile-name {
          max-width: 145px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-menu {
          position: absolute;
          right: 0;
          top: 58px;
          width: 240px;
          background: white;
          color: #111827;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.22);
          z-index: 1200;
        }

        .profile-menu p {
          margin: 6px 0;
        }

        .logout {
          width: 100%;
          margin-top: 10px;
          border: none;
          border-radius: 10px;
          background: #dc2626;
          color: white;
          padding: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1001;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 310px;
          max-width: 90vw;
          height: 100vh;
          background: white;
          z-index: 1002;
          padding: 18px;
          box-shadow: 8px 0 26px rgba(0,0,0,0.22);
          overflow-y: auto;
        }

        .sidebar-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 12px;
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }

        .sidebar-head h2 {
          margin: 0;
          font-size: 26px;
        }

        .close {
          border: none;
          border-radius: 10px;
          background: #111827;
          color: white;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 900;
        }

        .group {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }

        .group-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 1000;
          letter-spacing: .8px;
          margin: 10px 0;
        }

        .sidebar a {
          display: block;
          text-decoration: none;
          color: #111827;
          padding: 12px;
          border-radius: 12px;
          font-weight: 800;
        }

        .sidebar a:hover {
          background: #f3f4f6;
        }

        .content {
          min-height: calc(100vh - 72px);
        }

        body[data-theme="dark"] {
          background: #0f172a;
          color: white;
        }

        body[data-theme="dark"] .layout-root,
        body[data-theme="dark"] .page,
        body[data-theme="dark"] .staff-page {
          background: #0f172a !important;
          color: white !important;
        }

        body[data-theme="dark"] .card,
        body[data-theme="dark"] .panel,
        body[data-theme="dark"] .section,
        body[data-theme="dark"] .summary-card,
        body[data-theme="dark"] .table-card,
        body[data-theme="dark"] .payment-card,
        body[data-theme="dark"] .delivery-card,
        body[data-theme="dark"] .person-card {
          background: #1e293b !important;
          color: white !important;
        }

        body[data-theme="dark"] input,
        body[data-theme="dark"] select,
        body[data-theme="dark"] textarea {
          background: #334155 !important;
          color: white !important;
          border: 1px solid #475569 !important;
        }

        body[data-theme="dark"] .sidebar,
        body[data-theme="dark"] .sidebar-head,
        body[data-theme="dark"] .profile-menu {
          background: #1e293b !important;
          color: white !important;
        }

        body[data-theme="dark"] .sidebar a {
          color: white !important;
        }

        body[data-theme="dark"] .sidebar a:hover {
          background: #334155 !important;
        }

        @media (max-width: 1100px) {
          .quick-links {
            display: none;
          }

          .brand {
            font-size: 24px;
          }

          .topbar {
            padding: 0 12px;
          }
        }

        @media (max-width: 700px) {
          .lang-select {
            display: none;
          }

          .profile-name {
            display: none;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="left">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <div
            className="brand"
            onClick={() => {
              if (role === "ADMIN") navigate("/dashboard");
              else if (role === "STAFF") navigate("/staff-dashboard");
              else navigate("/home");
            }}
          >
            STRIDE
          </div>
        </div>

        <div className="right-area">
          <nav className="quick-links">
            {isAdmin && (
              <>
                <Link to="/pay-bill">Pay Bill</Link>
                <Link to="/order-data">Order Data</Link>
                <Link to="/assign-order">Assign Order</Link>
                <Link to="/create-order">Create Order</Link>
              </>
            )}

            {isStaff && (
              <>
                <Link to="/create-order">Create Order</Link>
                <Link to="/staff-assigned-orders">Assigned Orders</Link>
                <Link to="/staff-deliveries">My Deliveries</Link>
              </>
            )}
          </nav>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
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
                {(user.name || "SA").slice(0, 2).toUpperCase()}
              </div>
              <span className="profile-name">{user.name || "Profile"}</span>
              <span>▼</span>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <p><b>{user.name || "STRIDE User"}</b></p>
                <p>Role: {user.role || "-"}</p>
                <p>{user.email || user.mobile || user.staffCode || "-"}</p>
                <button className="logout" onClick={logout}>
                  Logout
                </button>
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
              <h2>STRIDE</h2>
              <button className="close" onClick={closeMenu}>
                X
              </button>
            </div>

            {isAdmin && (
              <>
                <div className="group">
                  <div className="group-title">Main</div>
                  <Link to="/dashboard" onClick={closeMenu}>📊 Dashboard</Link>
                  <Link to="/create-order" onClick={closeMenu}>➕ Create Order</Link>
                  <Link to="/assign-order" onClick={closeMenu}>📋 Assign Order</Link>
                  <Link to="/order-data" onClick={closeMenu}>📊 Order Data</Link>
                </div>

                <div className="group">
                  <div className="group-title">Inventory</div>
                  <Link to="/purchases" onClick={closeMenu}>🛒 Purchase Entry</Link>
                  <Link to="/inventory" onClick={closeMenu}>📦 Inventory</Link>
                  <Link to="/stock-movement-report" onClick={closeMenu}>📊 Stock Movement</Link>
                  <Link to="/suppliers" onClick={closeMenu}>🚚 Suppliers</Link>
                </div>

                <div className="group">
                  <div className="group-title">Billing</div>
                  <Link to="/pay-bill" onClick={closeMenu}>💵 Pay Bill</Link>
                  <Link to="/invoices" onClick={closeMenu}>🧾 Invoices</Link>
                  <Link to="/payment-history" onClick={closeMenu}>💳 Payment History</Link>
                  <Link to="/customer-ledger" onClick={closeMenu}>📒 Customer Ledger</Link>
                  <Link to="/customer-outstanding-report" onClick={closeMenu}>🔴 Customer Outstanding</Link>
                </div>

                <div className="group">
                  <div className="group-title">Master Data</div>
                  <Link to="/categories" onClick={closeMenu}>📂 Categories</Link>
                  <Link to="/products" onClick={closeMenu}>📦 Products</Link>
                  <Link to="/customers" onClick={closeMenu}>👥 Customers</Link>
                  <Link to="/staffs" onClick={closeMenu}>👥 Staffs & Transport</Link>
                </div>

                <div className="group">
                  <div className="group-title">Reports</div>
                  <Link to="/reports" onClick={closeMenu}>📈 Reports</Link>
                  <Link to="/collection-report" onClick={closeMenu}>💰 Collection Report</Link>
                  <Link to="/transport-payment-report" onClick={closeMenu}>🚚 Transport Payment</Link>
                  <Link to="/delivery-management" onClick={closeMenu}>🚚 Delivery Management</Link>
                </div>

                <div className="group">
                  <div className="group-title">Gifts</div>
                  <Link to="/admin-rewards" onClick={closeMenu}>🎁 Rewards</Link>
                  <Link to="/admin-redemptions" onClick={closeMenu}>🏆 Redemption Requests</Link>
                  <Link to="/admin-offers" onClick={closeMenu}>🎉 Offers</Link>
                  <Link to="/admin-website" onClick={closeMenu}>🌐 Website Management</Link>
                </div>
              </>
            )}

            {isStaff && (
              <>
                <div className="group">
                  <div className="group-title">Staff Work</div>
                  <Link to="/staff-dashboard" onClick={closeMenu}>🚚 Staff Dashboard</Link>
                  <Link to="/create-order" onClick={closeMenu}>➕ Create Order</Link>
                  <Link to="/staff-assigned-orders" onClick={closeMenu}>📋 Assigned Orders</Link>
                  <Link to="/staff-deliveries" onClick={closeMenu}>🚛 My Deliveries</Link>
                </div>

                <div className="group">
                  <div className="group-title">Allowed</div>
                  <Link to="/create-order" onClick={closeMenu}>👤 Add Customer During Order</Link>
                  <Link to="/staff-dashboard" onClick={closeMenu}>💰 Delivery Collection</Link>
                </div>
              </>
            )}

            <div className="group">
              <div className="group-title">Account</div>
              {isAdmin && (
                <Link to="/admin-face-management" onClick={closeMenu}>
                  🔐 Face Management
                </Link>
              )}

              <button className="logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="content">{children}</main>
    </div>
  );
}

export default AdminLayout;