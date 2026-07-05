import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AssignOrder() {
  const [orders, setOrders] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const orderRes = await axios.get("https://saraskansteel-in.onrender.com/api/order-data", {
      headers,
    });

    const staffRes = await axios.get("https://saraskansteel-in.onrender.com/api/staff", {
      headers,
    });

    const allPeople = staffRes.data.data || [];

    setOrders(orderRes.data.data || []);

    setStaffs(
      allPeople.filter(
        (s: any) => String(s.type || s.role).toUpperCase() === "STAFF"
      )
    );

    setTransports(
      allPeople.filter(
        (s: any) => String(s.type || s.role).toUpperCase() === "TRANSPORT"
      )
    );
  };

  const acceptOrder = async (orderId: string) => {
    try {
      await axios.patch(
        `https://saraskansteel-in.onrender.com/api/order-data/${orderId}/accept`,
        {},
        { headers }
      );

      alert("Order accepted");
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Accept failed");
    }
  };

  const assignStaff = async (orderId: string, staffId: string) => {
    try {
      if (!staffId) return;

      await axios.patch(
        `https://saraskansteel-in.onrender.com/api/order-data/${orderId}/assign-staff`,
        { staffId },
        { headers }
      );

      alert("Staff assigned");
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Staff assign failed");
    }
  };

  const assignTransport = async (orderId: string, transportId: string) => {
    try {
      if (!transportId) return;

      await axios.patch(
        `https://saraskansteel-in.onrender.com/api/order-data/${orderId}/assign-transport`,
        { transportId },
        { headers }
      );

      alert("Transporter assigned");
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Transport assign failed");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      if (!confirm("Cancel this order?")) return;

      await axios.patch(
        `https://saraskansteel-in.onrender.com/api/order-data/${orderId}/cancel`,
        {},
        { headers }
      );

      alert("Order cancelled");
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Cancel failed");
    }
  };
  const getOrderItemsText = (order: any) => {
  const items =
    order.items ||
    order.orderItems ||
    order.products ||
    order.cartItems ||
    order.invoice?.items ||
    order.invoiceItems ||
    [];

  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  return items
    .map((item: any) => {
      const name =
        item.product?.name ||
        item.productName ||
        item.name ||
        item.itemName ||
        "Item";

      const qty =
        item.quantity ||
        item.qty ||
        item.bags ||
        item.weight ||
        item.actualWeight ||
        "";

      const unit = item.unit || item.product?.unit || "";

      if (qty) {
        return `${name} × ${qty}${unit ? " " + unit : ""}`;
      }

      return name;
    })
    .join(", ");
};

const getCustomerId = (order: any) => {
  return (
    order.customerRecord?.customerNumber ||
    order.customerRecord?.customerId ||
    order.customerId ||
    order.customerRecordId ||
    "-"
  );
};

  const filteredOrders = orders.filter((o) => {
    const text = `${o.orderNumber || ""} ${o.customerRecord?.name || ""} ${
      o.customerRecord?.mobile || ""
    } ${o.deliveryAddressSnapshot || ""} ${o.status || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

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

        .header {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .toolbar,
        .table-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1500px;
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

        .address-cell {
          max-width: 280px;
          white-space: normal;
          line-height: 1.4;
          color: #374151;
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

        .green { background: #16a34a; }
        .blue { background: #2563eb; }
        .red { background: #dc2626; }
        .orange { background: #f59e0b; }

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          background: #dbeafe;
          color: #1d4ed8;
          display: inline-block;
        }

        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge.cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.delivered {
          background: #dcfce7;
          color: #166534;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
          .customer-cell {
  min-width: 210px;
  line-height: 1.6;
}

.customer-cell b {
  color: #111827;
  font-size: 15px;
}

.customer-cell small {
  display: block;
  color: #64748b;
  font-weight: 800;
}

.items-cell {
  min-width: 260px;
  max-width: 340px;
  line-height: 1.6;
  color: #374151;
  font-weight: 800;
}

        @media (max-width: 800px) {
          .page {
            padding: 12px;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>📋 Assign Orders</h1>
          <p style={{ margin: "6px 0 0" }}>
            Accept order, assign staff, assign transporter, then create invoice.
          </p>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search order, customer, mobile, address or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn blue" onClick={loadData}>
            Refresh
          </button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No</th>
<th>Customer Details</th>
<th>Items Ordered</th>
<th>Delivery Address</th>
<th>Amount</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Assign Staff</th>
                  <th>Transporter</th>
                  <th>Assign Transporter</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((o) => {
                  const isPending = o.status === "PENDING";
                  const isCancelled = o.status === "CANCELLED";
                  const isDelivered = o.status === "DELIVERED";
                  const invoiceReady = !!o.invoice?.id;

                  const canCreateInvoice =
                    !isPending && !isCancelled && !invoiceReady;

                  return (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>

                    <td className="customer-cell">
  <b>{o.customerRecord?.name || "-"}</b>
  <small>📞 {o.customerRecord?.mobile || "-"}</small>
  <small>🆔 {getCustomerId(o)}</small>
</td>

<td className="items-cell">
  {getOrderItemsText(o)}
</td>

                      <td className="address-cell">
                        {o.deliveryAddressSnapshot ||
                          o.deliveryLocation ||
                          o.customerRecord?.address ||
                          "-"}
                      </td>

                      <td>₹{money(o.invoiceValue || o.totalAmount)}</td>

                      <td>
                        <span
                          className={
                            isCancelled
                              ? "badge cancelled"
                              : isDelivered
                              ? "badge delivered"
                              : isPending
                              ? "badge pending"
                              : "badge"
                          }
                        >
                          {o.status}
                        </span>
                      </td>

                      <td>{o.assignedStaff?.name || "-"}</td>

                      <td>
                        <select
                          className="input"
                          value={o.assignedStaffId || ""}
                          disabled={isCancelled}
                          onChange={(e) => assignStaff(o.id, e.target.value)}
                        >
                          <option value="">Select Staff</option>

                          {staffs.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.staffCode || s.mobile || "STAFF"})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>{o.transport?.name || "-"}</td>

                      <td>
                        <select
                          className="input"
                          value={o.transportId || ""}
                          disabled={isCancelled}
                          onChange={(e) =>
                            assignTransport(o.id, e.target.value)
                          }
                        >
                          <option value="">Select Transporter</option>

                          {transports.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.staffCode || t.mobile || "TRANSPORT"})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <div className="actions">
                          {isPending && !isCancelled && (
                            <button
                              className="btn green"
                              onClick={() => acceptOrder(o.id)}
                            >
                              Accept
                            </button>
                          )}

                          {canCreateInvoice && (
                            <a
                              className="btn blue"
                              href={`/create-invoice/${o.id}`}
                            >
                              Create Invoice
                            </a>
                          )}

                          {invoiceReady && (
                            <a
                              className="btn"
                              href={`/invoice-view/${o.invoice.id}`}
                            >
                              View Invoice
                            </a>
                          )}

                          {!isCancelled && !isDelivered && (
                            <button
                              className="btn red"
                              onClick={() => cancelOrder(o.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={11}>No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AssignOrder;