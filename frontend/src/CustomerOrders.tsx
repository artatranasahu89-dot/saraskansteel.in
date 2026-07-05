import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getStatus = (order: any) => {
    return order.deliveryStatus || order.status || "PENDING";
  };

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

  const getOutstanding = (order: any) => {
    return (
      order.nowOutstanding ||
      order.outstandingAmount ||
      order.invoice?.nowOutstanding ||
      0
    );
  };

  const getPaidAmount = (order: any) => {
    return (
      order.amountPaidToday ||
      order.paidAmount ||
      order.invoice?.amountPaidToday ||
      0
    );
  };

  const getDeliveryAddress = (order: any) => {
    return (
      order.deliveryAddressSnapshot ||
      order.deliveryLocation ||
      order.address ||
      order.customerRecord?.address ||
      order.customer?.address ||
      "-"
    );
  };

  const getItems = (order: any) => {
    const items =
      order.items ||
      order.orderItems ||
      order.products ||
      order.cartItems ||
      order.invoice?.items ||
      order.invoiceItems ||
      [];

    if (!Array.isArray(items)) return [];

    return items;
  };

  const getItemName = (item: any) => {
    return (
      item.product?.name ||
      item.productName ||
      item.name ||
      item.itemName ||
      "Item"
    );
  };

  const getItemQty = (item: any) => {
    return (
      item.quantity ||
      item.qty ||
      item.bags ||
      item.weight ||
      item.actualWeight ||
      ""
    );
  };

  const getItemUnit = (item: any) => {
    return item.unit || item.product?.unit || "";
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/customer-portal/my-orders",
        { headers }
      );

      setOrders(res.data?.data || res.data?.orders || []);
    } catch (error) {
      console.log("Customer orders load error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getStatus(order);

      const text = `
        ${order.orderNumber || ""}
        ${status || ""}
        ${getDeliveryAddress(order) || ""}
        ${getItems(order)
          .map((item: any) => getItemName(item))
          .join(" ")}
      `.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;

  const deliveredOrders = orders.filter(
    (order) => getStatus(order) === "DELIVERED"
  ).length;

  const pendingOrders = orders.filter((order) =>
    ["PENDING", "PROCESSING", "ASSIGNED", "SHIPPED"].includes(getStatus(order))
  ).length;

  const totalPurchase = orders.reduce(
    (sum, order) => sum + Number(getOrderAmount(order) || 0),
    0
  );

  const statusClass = (status: string) => {
    if (status === "DELIVERED") return "delivered";
    if (status === "CANCELLED") return "cancelled";
    if (status === "SHIPPED") return "shipped";
    if (status === "PROCESSING") return "processing";
    if (status === "ASSIGNED") return "assigned";
    return "pending";
  };

  return (
    <CustomerLayout>
      <style>{`
        .orders-page {
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
            url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80");
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

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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

        .control-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 20px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 14px;
        }

        .search,
        .select {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
        }

        .search:focus,
        .select:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .orders-list {
          display: grid;
          gap: 18px;
        }

        .order-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 22px;
          transition: .25s;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 55px rgba(15,23,42,.13);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .order-number {
          font-size: 24px;
          font-weight: 1000;
          color: #111827;
          margin: 0;
        }

        .order-date {
          color: #64748b;
          font-weight: 800;
          margin-top: 5px;
        }

        .status-badge {
          padding: 8px 13px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .pending {
          background: #fef3c7;
          color: #92400e;
        }

        .processing,
        .assigned {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .shipped {
          background: #ede9fe;
          color: #6d28d9;
        }

        .delivered {
          background: #dcfce7;
          color: #166534;
        }

        .cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .detail-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 14px;
        }

        .detail-box small {
          display: block;
          color: #64748b;
          font-weight: 1000;
          margin-bottom: 5px;
        }

        .detail-box b {
          font-size: 16px;
          color: #111827;
        }

        .address-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 16px;
          line-height: 1.7;
          color: #475569;
          font-weight: 800;
        }

        .address-box strong {
          color: #111827;
          display: block;
          margin-bottom: 6px;
        }

        .items-panel {
          background: #111827;
          color: white;
          border-radius: 24px;
          padding: 20px;
        }

        .items-panel h3 {
          margin: 0 0 14px;
          font-size: 22px;
          font-weight: 1000;
        }

        .item-list {
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
        }

        .item-row {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          padding: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .item-row b {
          color: white;
        }

        .item-row span {
          color: #fbbf24;
          font-weight: 1000;
          white-space: nowrap;
        }

        .empty-items {
          background: rgba(255,255,255,.08);
          border: 1px dashed rgba(255,255,255,.24);
          border-radius: 16px;
          padding: 18px;
          color: #d1d5db;
          text-align: center;
          margin-bottom: 18px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
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
          .hero,
          .order-card {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 700px) {
          .orders-page {
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

          .summary-grid,
          .control-card,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .order-card {
            padding: 18px;
          }

          .order-top,
          .item-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn {
            width: 100%;
          }

          .card-actions {
            width: 100%;
          }
        }
      `}</style>

      <div className="orders-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">📦 My Orders</div>

            <h1>
              Track your <span>material orders</span>
            </h1>

            <p>
              View your complete order history, ordered items, invoice amount,
              outstanding balance, delivery address and delivery status.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/customer-shop">
              🛒 New Order
            </Link>

            <Link className="btn btn-light" to="/customer-dashboard">
              📊 Dashboard
            </Link>

            <Link className="btn btn-light" to="/home">
              🏠 Home
            </Link>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <h3>Total Orders</h3>
            <h2>{totalOrders}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <h3>Delivered</h3>
            <h2 className="green">{deliveredOrders}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🚚</div>
            <h3>In Progress</h3>
            <h2 className="blue">{pendingOrders}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Total Purchase</h3>
            <h2 className="orange">₹{money(totalPurchase)}</h2>
          </div>
        </div>

        <div className="control-card">
          <input
            className="search"
            placeholder="Search by order number, item, address or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading your orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty">No orders found.</div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const status = getStatus(order);
              const items = getItems(order);

              return (
                <div className="order-card" key={order.id}>
                  <div>
                    <div className="order-top">
                      <div>
                        <h2 className="order-number">
                          {order.orderNumber || "Order"}
                        </h2>

                        <div className="order-date">
                          Date: {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <span className={`status-badge ${statusClass(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="detail-grid">
                      <div className="detail-box">
                        <small>Invoice Amount</small>
                        <b>₹{money(getOrderAmount(order))}</b>
                      </div>

                      <div className="detail-box">
                        <small>Paid</small>
                        <b>₹{money(getPaidAmount(order))}</b>
                      </div>

                      <div className="detail-box">
                        <small>Outstanding</small>
                        <b className="red">₹{money(getOutstanding(order))}</b>
                      </div>
                    </div>

                    <div className="address-box">
                      <strong>Delivery Address</strong>
                      {getDeliveryAddress(order)}
                    </div>
                  </div>

                  <div className="items-panel">
                    <h3>Items Ordered</h3>

                    {items.length === 0 ? (
                      <div className="empty-items">No item details found.</div>
                    ) : (
                      <div className="item-list">
                        {items.map((item: any, index: number) => {
                          const qty = getItemQty(item);
                          const unit = getItemUnit(item);

                          return (
                            <div className="item-row" key={item.id || index}>
                              <b>{getItemName(item)}</b>

                              <span>
                                {qty
                                  ? `× ${qty}${unit ? " " + unit : ""}`
                                  : "Added"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="card-actions">
                      <Link
                        className="btn btn-primary"
                        to="/customer-track-delivery"
                      >
                        🚚 Track Delivery
                      </Link>

                      <Link className="btn btn-light" to="/customer-invoices">
                        🧾 View Bills
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerOrders;