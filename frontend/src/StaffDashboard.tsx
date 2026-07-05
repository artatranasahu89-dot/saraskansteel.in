import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);
  const today = new Date().toLocaleDateString();

  const loadData = async () => {
    const orderRes = await axios.get("http://localhost:5000/api/order-data", {
      headers,
    });

    const myOrders = (orderRes.data.data || []).filter(
      (o: any) =>
        o.assignedStaffId === user.id ||
        o.assignedStaff?.id === user.id ||
        o.assignedStaff?.staffCode === user.staffCode ||
        o.assignedStaff?.name === user.name
    );

    setOrders(myOrders);
  };

  const todayAssignedOrders = orders.filter(
    (o) => new Date(o.createdAt).toLocaleDateString() === today
  );

  const pendingDeliveries = orders.filter(
    (o) =>
      o.status !== "DELIVERED" &&
      o.deliveryStatus !== "DELIVERED" &&
      o.status !== "CANCELLED"
  );

  const outForDelivery = orders.filter(
    (o) => o.deliveryStatus === "OUT_FOR_DELIVERY"
  );

  const deliveredToday = orders.filter(
    (o) =>
      (o.status === "DELIVERED" || o.deliveryStatus === "DELIVERED") &&
      o.deliveredAt &&
      new Date(o.deliveredAt).toLocaleDateString() === today
  );

  const amountToCollect = pendingDeliveries.reduce(
    (sum, o) => sum + Number(o.nowOutstanding || 0),
    0
  );

  const staffPoints = 0;

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <style>{`
        .page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .hero {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }

        .hero h1 {
          margin: 0;
          font-size: 30px;
        }

        .hero p {
          margin: 6px 0 0;
          color: #d1d5db;
        }

        .quick {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .quick a {
          background: #2563eb;
          color: white;
          text-decoration: none;
          padding: 11px 14px;
          border-radius: 12px;
          font-weight: 900;
        }

        .quick a.dark {
          background: #111827;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card,
        .card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .summary-card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-card h2 {
          margin: 8px 0 0;
          font-size: 27px;
        }

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .success {
          color: #16a34a;
          font-weight: 900;
        }

        .orange {
          color: #f59e0b;
          font-weight: 900;
        }

        .blue-text {
          color: #2563eb;
          font-weight: 900;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 13px;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          display: inline-block;
          background: #dbeafe;
          color: #1d4ed8;
        }

        .badge-green {
          background: #dcfce7;
          color: #166534;
        }

        .badge-orange {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-red {
          background: #fee2e2;
          color: #991b1b;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 10px 12px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .blue {
          background: #2563eb;
        }

        .green {
          background: #16a34a;
        }

        .mobile-cards {
          display: none;
        }

        .order-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }

        @media (max-width: 1100px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .hero {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 12px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .quick a,
          .btn {
            width: 100%;
            text-align: center;
          }

          .table-wrap {
            display: none;
          }

          .mobile-cards {
            display: block;
          }
        }
      `}</style>

      <div className="page">
        <div className="hero">
          <div>
            <h1>🚚 Staff Dashboard</h1>
            <p>
              Today's assigned orders, delivery status and staff performance.
            </p>
          </div>

          <div className="quick">
            <a href="/create-order">Create Order</a>
            <a href="/staff-assigned-orders">Assigned Orders</a>
            <a href="/staff-deliveries" className="dark">
              My Deliveries
            </a>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Assigned Today</h3>
            <h2>{todayAssignedOrders.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Pending Deliveries</h3>
            <h2 className="blue-text">{pendingDeliveries.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Out For Delivery</h3>
            <h2 className="orange">{outForDelivery.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Delivered Today</h3>
            <h2 className="success">{deliveredToday.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Amount To Collect</h3>
            <h2 className="danger">₹{money(amountToCollect)}</h2>
          </div>

          <div className="summary-card">
            <h3>Staff Points</h3>
            <h2>{staffPoints}</h2>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Today's Assigned Orders</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Mobile / ID</th>
                  <th>Address</th>
                  <th>Invoice</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Delivery</th>
                </tr>
              </thead>

              <tbody>
                {todayAssignedOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerRecord?.name || "-"}</td>
                    <td>{o.customerRecord?.mobile || "-"}</td>
                   <td>
  {o.deliveryAddressSnapshot ||
    o.deliveryLocation ||
    o.customerRecord?.address ||
    "-"}
</td>
                    <td>₹{money(o.invoiceValue)}</td>
                    <td className="danger">₹{money(o.nowOutstanding)}</td>
                    <td>
                      <span className="badge">
                        {o.deliveryStatus || o.status}
                      </span>
                    </td>
                    <td>
                      <a className="btn blue" href="/staff-deliveries">
                        Open
                      </a>
                    </td>
                  </tr>
                ))}

                {todayAssignedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8}>No orders assigned today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {todayAssignedOrders.map((o) => (
              <div className="order-card" key={o.id}>
                <h3>{o.orderNumber}</h3>
                <p><b>Customer:</b> {o.customerRecord?.name || "-"}</p>
                <p><b>Mobile / ID:</b> {o.customerRecord?.mobile || "-"}</p>
                <p><b>Address:</b> {o.customerRecord?.address || "-"}</p>
                <p><b>Invoice:</b> ₹{money(o.invoiceValue)}</p>
                <p><b>Outstanding:</b> ₹{money(o.nowOutstanding)}</p>
                <p><b>Status:</b> {o.deliveryStatus || o.status}</p>

                <a className="btn blue" href="/staff-deliveries">
                  Open Delivery
                </a>
              </div>
            ))}

            {todayAssignedOrders.length === 0 && <p>No orders assigned today.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default StaffDashboard;