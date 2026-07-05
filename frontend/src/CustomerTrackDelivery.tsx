import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerTrackDelivery() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [search, setSearch] = useState("");
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

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://saraskansteel-in.onrender.com/api/customer-portal/my-orders",
        { headers }
      );

      const data = res.data?.data || res.data?.orders || [];

      setOrders(data);

      if (data.length > 0) {
        const active =
          data.find((order: any) => {
            const status = getStatus(order);
            return status !== "DELIVERED" && status !== "CANCELLED";
          }) || data[0];

        setSelectedOrderId(active.id);
      }
    } catch (error) {
      console.log("Track delivery load error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  const getStaffName = (order: any) => {
    return (
      order.assignedStaff?.name ||
      order.staff?.name ||
      order.deliveryStaff?.name ||
      order.assignedTo?.name ||
      "-"
    );
  };

  const getStaffMobile = (order: any) => {
    return (
      order.assignedStaff?.mobile ||
      order.staff?.mobile ||
      order.deliveryStaff?.mobile ||
      order.assignedTo?.mobile ||
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

  const deliverySteps = [
    {
      key: "PENDING",
      title: "Order Placed",
      icon: "📝",
      description: "Your material order has been created.",
    },
    {
      key: "PROCESSING",
      title: "Processing",
      icon: "⚙️",
      description: "SARASKANA STEEL team is checking your order.",
    },
    {
      key: "ASSIGNED",
      title: "Staff Assigned",
      icon: "👷",
      description: "Staff has been assigned for this order.",
    },
    {
      key: "SHIPPED",
      title: "Out for Delivery",
      icon: "🚚",
      description: "Your order is on the way.",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      icon: "✅",
      description: "Your order has been delivered.",
    },
  ];

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED") return -1;

    const index = deliverySteps.findIndex((step) => step.key === status);

    if (index >= 0) return index;

    if (status === "CONFIRMED") return 1;
    if (status === "OUT_FOR_DELIVERY") return 3;

    return 0;
  };

  const statusClass = (status: string) => {
    if (status === "DELIVERED") return "delivered";
    if (status === "CANCELLED") return "cancelled";
    if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return "shipped";
    if (status === "ASSIGNED") return "assigned";
    if (status === "PROCESSING" || status === "CONFIRMED") return "processing";
    return "pending";
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text = `
        ${order.orderNumber || ""}
        ${getStatus(order)}
        ${getDeliveryAddress(order)}
        ${getItems(order)
          .map((item: any) => getItemName(item))
          .join(" ")}
      `.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [orders, search]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) || filteredOrders[0];

  const activeOrders = orders.filter((order) => {
    const status = getStatus(order);
    return status !== "DELIVERED" && status !== "CANCELLED";
  }).length;

  const deliveredOrders = orders.filter(
    (order) => getStatus(order) === "DELIVERED"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => getStatus(order) === "CANCELLED"
  ).length;

  const currentStep = selectedOrder ? getStepIndex(getStatus(selectedOrder)) : 0;

  return (
    <CustomerLayout>
      <style>{`
        .track-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          color: #111827;
        }

        .track-hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80");
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

        .track-hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.22);
        }

        .track-hero-content,
        .track-hero-actions {
          position: relative;
          z-index: 2;
        }

        .track-badge {
          display: inline-flex;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          color: #fde68a;
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 1000;
          margin-bottom: 18px;
        }

        .track-hero h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 1000;
          letter-spacing: -0.5px;
        }

        .track-hero h1 span {
          color: #f59e0b;
        }

        .track-hero p {
          color: #e5e7eb;
          line-height: 1.8;
          margin: 14px 0 0;
          max-width: 760px;
        }

        .track-hero-actions {
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

        .track-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 22px;
        }

        .side-panel,
        .main-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 22px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
        }

        .panel-title {
          margin: 0 0 16px;
          font-size: 25px;
          font-weight: 1000;
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
          margin-bottom: 16px;
        }

        .search:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .order-list {
          display: grid;
          gap: 12px;
          max-height: 720px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .order-tab {
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 20px;
          padding: 15px;
          cursor: pointer;
          text-align: left;
          transition: .2s;
        }

        .order-tab:hover {
          background: #fff7ed;
          border-color: #fdba74;
        }

        .order-tab.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .order-tab h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 1000;
        }

        .order-tab p {
          margin: 6px 0 0;
          color: #64748b;
          font-weight: 800;
          line-height: 1.5;
        }

        .order-tab.active p {
          color: #d1d5db;
        }

        .tab-status {
          display: inline-flex;
          margin-top: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          background: #dbeafe;
          color: #1d4ed8;
        }

        .order-tab.active .tab-status {
          background: #f59e0b;
          color: #111827;
        }

        .selected-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 20px;
        }

        .selected-head h2 {
          margin: 0;
          font-size: 30px;
          font-weight: 1000;
        }

        .selected-head p {
          margin: 6px 0 0;
          color: #64748b;
          font-weight: 800;
        }

        .status-badge {
          padding: 9px 14px;
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

        .tracker-card {
          background:
            linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 28px;
          padding: 26px;
          margin-bottom: 22px;
          overflow: hidden;
          position: relative;
        }

        .tracker-card::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          right: -110px;
          top: -110px;
          background: rgba(245,158,11,.24);
        }

        .tracker-content {
          position: relative;
          z-index: 2;
        }

        .tracker-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 26px;
        }

        .tracker-title h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 1000;
        }

        .progress-line {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .step {
          text-align: center;
          position: relative;
        }

        .step-circle {
          width: 58px;
          height: 58px;
          border-radius: 20px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          margin: 0 auto 12px;
        }

        .step.done .step-circle {
          background: #f59e0b;
          color: #111827;
          border-color: #f59e0b;
        }

        .step.current .step-circle {
          background: white;
          color: #111827;
          border-color: white;
          box-shadow: 0 0 0 6px rgba(255,255,255,.14);
        }

        .step h4 {
          margin: 0;
          font-size: 14px;
          color: white;
          font-weight: 1000;
        }

        .step p {
          margin: 6px 0 0;
          color: #d1d5db;
          line-height: 1.45;
          font-size: 12px;
        }

        .cancel-box {
          background: rgba(220,38,38,.16);
          border: 1px solid rgba(248,113,113,.35);
          border-radius: 20px;
          padding: 20px;
          color: #fecaca;
          font-weight: 900;
          text-align: center;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .detail-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 16px;
        }

        .detail-box small {
          display: block;
          color: #64748b;
          font-weight: 1000;
          margin-bottom: 6px;
        }

        .detail-box b {
          color: #111827;
          font-size: 17px;
          font-weight: 1000;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .info-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 18px;
        }

        .info-card h3 {
          margin: 0 0 14px;
          font-size: 22px;
          font-weight: 1000;
        }

        .info-card p {
          color: #475569;
          line-height: 1.7;
          font-weight: 800;
        }

        .items-list {
          display: grid;
          gap: 10px;
        }

        .item-row {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .item-row b {
          color: #111827;
        }

        .item-row span {
          color: #d97706;
          font-weight: 1000;
          white-space: nowrap;
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
          .track-hero,
          .track-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid,
          .details-grid,
          .lower-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .progress-line {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .step {
            display: grid;
            grid-template-columns: 70px 1fr;
            text-align: left;
            align-items: center;
          }

          .step-circle {
            margin: 0;
          }
        }

        @media(max-width: 700px) {
          .track-page {
            padding: 14px;
          }

          .track-hero {
            padding: 26px;
            border-radius: 26px;
            flex-direction: column;
            align-items: flex-start;
          }

          .track-hero h1 {
            font-size: 34px;
          }

          .track-hero-actions,
          .btn {
            width: 100%;
          }

          .summary-grid,
          .details-grid,
          .lower-grid {
            grid-template-columns: 1fr;
          }

          .selected-head,
          .tracker-title,
          .item-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .side-panel,
          .main-panel {
            padding: 18px;
          }
        }
      `}</style>

      <div className="track-page">
        <div className="track-hero">
          <div className="track-hero-content">
            <div className="track-badge">🚚 Track Delivery</div>

            <h1>
              Follow your <span>material delivery</span>
            </h1>

            <p>
              Track order progress from order placement to final delivery. Check
              assigned staff, delivery address, ordered items and invoice amount.
            </p>
          </div>

          <div className="track-hero-actions">
            <Link className="btn btn-primary" to="/customer-shop">
              🛒 New Order
            </Link>

            <Link className="btn btn-light" to="/customer-orders">
              📦 My Orders
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
            <h2>{orders.length}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🚚</div>
            <h3>Active Deliveries</h3>
            <h2 className="blue">{activeOrders}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <h3>Delivered</h3>
            <h2 className="green">{deliveredOrders}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">❌</div>
            <h3>Cancelled</h3>
            <h2 className="red">{cancelledOrders}</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading delivery tracking...</div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders found for delivery tracking.</div>
        ) : (
          <div className="track-grid">
            <div className="side-panel">
              <h2 className="panel-title">Your Orders</h2>

              <input
                className="search"
                placeholder="Search order, item, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="order-list">
                {filteredOrders.map((order) => {
                  const status = getStatus(order);

                  return (
                    <button
                      key={order.id}
                      className={
                        selectedOrder?.id === order.id
                          ? "order-tab active"
                          : "order-tab"
                      }
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <h3>{order.orderNumber || "Order"}</h3>

                      <p>
                        {formatDate(order.createdAt)}
                        <br />₹{money(getOrderAmount(order))}
                      </p>

                      <span className="tab-status">{status}</span>
                    </button>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="empty">No matching order found.</div>
                )}
              </div>
            </div>

            {selectedOrder && (
              <div className="main-panel">
                <div className="selected-head">
                  <div>
                    <h2>{selectedOrder.orderNumber || "Order Tracking"}</h2>
                    <p>Created on {formatDate(selectedOrder.createdAt)}</p>
                  </div>

                  <span
                    className={`status-badge ${statusClass(
                      getStatus(selectedOrder)
                    )}`}
                  >
                    {getStatus(selectedOrder)}
                  </span>
                </div>

                <div className="tracker-card">
                  <div className="tracker-content">
                    <div className="tracker-title">
                      <h3>Delivery Progress</h3>
                      <span>{getStatus(selectedOrder)}</span>
                    </div>

                    {getStatus(selectedOrder) === "CANCELLED" ? (
                      <div className="cancel-box">
                        This order has been cancelled.
                      </div>
                    ) : (
                      <div className="progress-line">
                        {deliverySteps.map((step, index) => {
                          const done = index < currentStep;
                          const current = index === currentStep;

                          return (
                            <div
                              className={
                                done
                                  ? "step done"
                                  : current
                                  ? "step current"
                                  : "step"
                              }
                              key={step.key}
                            >
                              <div className="step-circle">{step.icon}</div>

                              <div>
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-box">
                    <small>Invoice Amount</small>
                    <b>₹{money(getOrderAmount(selectedOrder))}</b>
                  </div>

                  <div className="detail-box">
                    <small>Assigned Staff</small>
                    <b>{getStaffName(selectedOrder)}</b>
                  </div>

                  <div className="detail-box">
                    <small>Staff Mobile</small>
                    <b>{getStaffMobile(selectedOrder)}</b>
                  </div>
                </div>

                <div className="lower-grid">
                  <div className="info-card">
                    <h3>Delivery Address</h3>

                    <p>{getDeliveryAddress(selectedOrder)}</p>

                    <Link className="btn btn-dark" to="/customer-orders">
                      View Order
                    </Link>
                  </div>

                  <div className="info-card">
                    <h3>Items Ordered</h3>

                    {getItems(selectedOrder).length === 0 ? (
                      <p>No item details found.</p>
                    ) : (
                      <div className="items-list">
                        {getItems(selectedOrder).map(
                          (item: any, index: number) => {
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
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerTrackDelivery;