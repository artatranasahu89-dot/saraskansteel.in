import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";
import OfferCarousel from "./OfferCarousel";

function CustomerDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const headers = {
    Authorization: "Bearer " + token,
  };

  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const summaryRes = await axios.get(
        "http://localhost:5000/api/customer-portal/summary",
        { headers }
      );

      const orderRes = await axios.get(
        "http://localhost:5000/api/customer-portal/my-orders",
        { headers }
      );

      setSummary(summaryRes.data?.data || summaryRes.data || {});
      setOrders(orderRes.data?.data || orderRes.data?.orders || []);
    } catch (error) {
      console.log("Customer dashboard load error:", error);
      setSummary({});
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const customer = summary?.customer || user || {};

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "DELIVERED" || order.deliveryStatus === "DELIVERED"
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.deliveryStatus === "PENDING" ||
      order.status === "PROCESSING" ||
      order.deliveryStatus === "PROCESSING"
  );

  const recentOrders = orders.slice(0, 5);

  const getOrderAmount = (order: any) => {
    return (
      order.invoiceValue ||
      order.finalAmount ||
      order.totalAmount ||
      order.grandTotal ||
      order.invoice?.finalAmount ||
      0
    );
  };

  const getCustomerId = () => {
    return (
      customer.customerNumber ||
      customer.customerId ||
      customer.customerCode ||
      user.customerNumber ||
      user.customerId ||
      user.id ||
      "-"
    );
  };

  return (
    <CustomerLayout>
      <style>{`
        .customer-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          color: #111827;
        }

        .hero {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 36px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 28px;
          margin-bottom: 26px;
          box-shadow: 0 24px 60px rgba(15,23,42,.24);
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.22);
        }

        .hero-main,
        .hero-side {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
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
          line-height: 1.1;
          font-weight: 1000;
          letter-spacing: -0.5px;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          margin: 16px 0 0;
          line-height: 1.8;
          max-width: 760px;
          font-size: 16px;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
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

        .hero-side {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          padding: 22px;
        }

        .customer-mini {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 18px;
        }

        .avatar {
          width: 62px;
          height: 62px;
          border-radius: 20px;
          background: linear-gradient(135deg, #f59e0b, #92400e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 1000;
          color: white;
          flex-shrink: 0;
        }

        .customer-mini h3 {
          margin: 0;
          font-size: 22px;
        }

        .customer-mini p {
          margin: 4px 0 0;
          color: #d1d5db;
          font-size: 14px;
        }

        .hero-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.16);
        }

        .hero-row:last-child {
          border-bottom: none;
        }

        .hero-row span {
          color: #d1d5db;
          font-weight: 800;
        }

        .hero-row b {
          color: white;
          font-weight: 1000;
        }

        .offer-wrap {
          margin-bottom: 26px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 26px;
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

        .green {
          color: #16a34a;
        }

        .blue {
          color: #2563eb;
        }

        .red {
          color: #dc2626;
        }

        .orange {
          color: #d97706;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 26px;
        }

        .quick-card {
          text-decoration: none;
          color: #111827;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 26px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          transition: .25s;
          min-height: 170px;
          position: relative;
          overflow: hidden;
        }

        .quick-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 26px 55px rgba(15,23,42,.15);
        }

        .quick-card::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -48px;
          top: -48px;
          background: rgba(15,23,42,.06);
          border-radius: 50%;
        }

        .quick-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .quick-card h3 {
          margin: 0;
          font-size: 21px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .quick-card p {
          margin: 9px 0 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
          position: relative;
          z-index: 2;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.25fr .75fr;
          gap: 22px;
        }

        .section {
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
          font-size: 26px;
          font-weight: 1000;
        }

        .order-list {
          display: grid;
          gap: 14px;
        }

        .order-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 14px;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 16px;
        }

        .order-main b {
          font-size: 16px;
          color: #111827;
        }

        .order-main small {
          color: #64748b;
          font-weight: 800;
        }

        .badge {
          padding: 8px 12px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 1000;
          font-size: 12px;
          white-space: nowrap;
        }

        .empty {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 22px;
          padding: 28px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
        }

        .support-card {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.92)),
            url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 30px;
          padding: 26px;
          box-shadow: 0 16px 36px rgba(15,23,42,.12);
        }

        .support-card h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .support-card p {
          color: #e5e7eb;
          line-height: 1.7;
        }

        .support-list {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .support-list div {
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          padding: 13px;
          border-radius: 16px;
          font-weight: 900;
        }

        @media(max-width: 1100px) {
          .hero,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid,
          .quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 650px) {
          .customer-page {
            padding: 14px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .summary-grid,
          .quick-grid {
            grid-template-columns: 1fr;
          }

          .order-item {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
            text-align: center;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="customer-page">
        <div className="hero">
          <div className="hero-main">
            <div className="hero-badge">👋 Customer Dashboard</div>

            <h1>
              Welcome,{" "}
              <span>{customer?.name || user?.name || "Customer"}</span>
            </h1>

            <p>
              Manage your STRIDE orders, delivery tracking, invoices,
              outstanding balance, reward points and customer profile from one
              professional dashboard.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/customer-shop">
                🛒 Shop Products
              </Link>

              <Link className="btn btn-light" to="/home">
                🏠 Home Website
              </Link>

              <Link className="btn btn-light" to="/customer-orders">
                📦 My Orders
              </Link>
            </div>
          </div>

          <div className="hero-side">
            <div className="customer-mini">
              <div className="avatar">
                {(customer?.name || user?.name || "C").charAt(0)}
              </div>

              <div>
                <h3>{customer?.name || user?.name || "Customer"}</h3>
                <p>Customer ID: {getCustomerId()}</p>
              </div>
            </div>

            <div className="hero-row">
              <span>Outstanding</span>
              <b>₹{money(summary?.outstanding)}</b>
            </div>

            <div className="hero-row">
              <span>Reward Points</span>
              <b>{summary?.points || 0}</b>
            </div>

            <div className="hero-row">
              <span>Total Orders</span>
              <b>{summary?.totalOrders || orders.length || 0}</b>
            </div>
          </div>
        </div>

        <div className="offer-wrap">
          <OfferCarousel />
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <h3>Total Orders</h3>
            <h2>{summary?.totalOrders || orders.length || 0}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <h3>Delivered Orders</h3>
            <h2 className="green">{deliveredOrders.length}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Total Purchase</h3>
            <h2>₹{money(summary?.totalPurchased)}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <h3>Reward Points</h3>
            <h2 className="blue">{summary?.points || 0}</h2>
          </div>
        </div>

        <div className="quick-grid">
          <Link className="quick-card" to="/customer-shop">
            <div className="quick-icon">🛒</div>
            <h3>Shop Products</h3>
            <p>Browse available materials and add products to cart.</p>
          </Link>

          <Link className="quick-card" to="/customer-orders">
            <div className="quick-icon">📦</div>
            <h3>My Orders</h3>
            <p>View all orders, invoice values and delivery status.</p>
          </Link>

          <Link className="quick-card" to="/customer-track-delivery">
            <div className="quick-icon">🚚</div>
            <h3>Track Delivery</h3>
            <p>Track delivery progress and current order status.</p>
          </Link>

          <Link className="quick-card" to="/customer-points">
            <div className="quick-icon">🎁</div>
            <h3>Reward Points</h3>
            <p>Check earned points and redemption details.</p>
          </Link>
        </div>

        <div className="content-grid">
          <div className="section">
            <div className="section-head">
              <h2>Recent Orders</h2>

              <Link className="btn btn-dark" to="/customer-orders">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="empty">Loading recent orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="empty">No orders found.</div>
            ) : (
              <div className="order-list">
                {recentOrders.map((order) => (
                  <div className="order-item" key={order.id}>
                    <div className="order-main">
                      <b>{order.orderNumber || "Order"}</b>
                      <br />
                      <small>
                        {formatDate(order.createdAt)} | ₹
                        {money(getOrderAmount(order))}
                      </small>
                    </div>

                    <span className="badge">
                      {order.deliveryStatus || order.status || "PENDING"}
                    </span>

                    <Link className="btn btn-dark" to="/customer-track-delivery">
                      Track
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="support-card">
            <h2>Need support?</h2>

            <p>
              Contact SARASKANA STEEL for billing help, order issues, delivery
              tracking or product enquiry.
            </p>

            <div className="support-list">
              <div>📞 9438085096</div>
              <div>✉️ SARSKANASTEEL@GMAIL.COM</div>
              <div>📍 Saraskana</div>
              <div>🧾 STRIDE Customer Portal</div>
            </div>

            <div style={{ marginTop: 18 }}>
              <Link className="btn btn-primary" to="/contact">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerDashboard;