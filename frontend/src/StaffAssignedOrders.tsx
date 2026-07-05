import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function StaffAssignedOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadOrders = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/order-data", {
      headers,
    });

    const myOrders = (res.data.data || []).filter(
      (o: any) => o.assignedStaffId === user.id || o.assignedStaff?.id === user.id
    );

    setOrders(myOrders);
  };

  const markProcessing = async (orderId: string) => {
    await axios.patch(
      `https://saraskansteel-in.onrender.com/api/delivery/${orderId}/processing`,
      { deliveryNote: "Staff started processing" },
      { headers }
    );

    alert("Order marked as Processing");
    loadOrders();
  };

  const viewItems = (o: any) => {
    const itemText = (o.items || [])
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.product?.name || item.productName || "Product"} | Qty: ${
            item.quantity
          } ${item.unit || item.product?.unit || ""}`
      )
      .join("\n");

    alert(itemText || "No items found");
  };

  const filteredOrders = orders.filter((o) => {
    const text = `${o.orderNumber || ""} ${o.customerRecord?.name || ""} ${
      o.customerRecord?.mobile || ""
    } ${o.status || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  useEffect(() => {
    loadOrders();
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

        .btn {
          border: none;
          border-radius: 10px;
          padding: 10px 13px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .blue { background: #2563eb; }
        .green { background: #16a34a; }
        .orange { background: #f59e0b; }
        .danger { color: #dc2626; font-weight: 900; }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
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
          background: #dbeafe;
          color: #1d4ed8;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 700px) {
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
          <h1 style={{ margin: 0 }}>📋 My Assigned Orders</h1>
          <p style={{ margin: "6px 0 0" }}>
            Process assigned orders. Out for delivery is allowed only after invoice is ready.
          </p>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search order, customer, mobile or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn blue" onClick={loadOrders}>
            Refresh
          </button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Mobile / ID</th>
                  <th>Address</th>
                  <th>View</th>
                  <th>Invoice</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              

              <tbody>
                {filteredOrders.map((o) => {
                  const invoiceReady = !!o.invoice?.id;
                  const isDelivered =
                    o.deliveryStatus === "DELIVERED" || o.status === "DELIVERED";
                  const isOutForDelivery = o.deliveryStatus === "OUT_FOR_DELIVERY";
                  const isProcessing =
                    o.status === "PROCESSING" || o.deliveryStatus === "PROCESSING";

                  return (
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

                      <td>
                        <button className="btn" onClick={() => viewItems(o)}>
                          View Items
                        </button>
                      </td>

                      <td>₹{money(o.invoiceValue)}</td>

                      <td className="danger">₹{money(o.nowOutstanding)}</td>

                      <td>
                        <span className="badge">
                          {o.deliveryStatus || o.status}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          {!isDelivered && !invoiceReady && !isProcessing && (
                            <button
                              className="btn orange"
                              onClick={() => markProcessing(o.id)}
                            >
                              Process
                            </button>
                          )}

                          {!isDelivered && invoiceReady && (
                            <a className="btn blue" href="/staff-deliveries">
                              Delivery
                            </a>
                          )}

                          {isOutForDelivery && Number(o.nowOutstanding || 0) > 0 && (
                            <a className="btn green" href={`/collect-payment/${o.id}`}>
                              Collect
                            </a>
                          )}

                          {isDelivered && <span>-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9}>No assigned orders found.</td>
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

export default StaffAssignedOrders;