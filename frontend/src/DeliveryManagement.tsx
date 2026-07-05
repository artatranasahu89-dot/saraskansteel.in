import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function DeliveryManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
  };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://saraskansteel-in.onrender.com/api/delivery",
        {
          headers,
        }
      );

      setOrders(res.data.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Unable to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const timer = setInterval(() => {
      loadOrders();
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const text = `
        ${o.orderNumber}
        ${o.customerRecord?.name || ""}
        ${o.customerRecord?.mobile || ""}
        ${o.assignedStaff?.name || ""}
        ${o.transport?.name || ""}
      `.toLowerCase();

      const searchMatch =
        search === "" ||
        text.includes(search.toLowerCase());

      const statusMatch =
        status === "" ||
        o.deliveryStatus === status ||
        o.status === status;

      return searchMatch && statusMatch;
    });
  }, [orders, search, status]);

  const summary = {
    total: orders.length,

    processing: orders.filter(
      (o) =>
        o.deliveryStatus === "PROCESSING"
    ).length,

    out: orders.filter(
      (o) =>
        o.deliveryStatus === "OUT_FOR_DELIVERY"
    ).length,

    delivered: orders.filter(
      (o) =>
        o.deliveryStatus === "DELIVERED"
    ).length,

    failed: orders.filter(
      (o) =>
        o.deliveryStatus === "FAILED"
    ).length,

    payLater: orders.filter(
      (o) =>
        o.collectionStatus === "PAY_LATER"
    ).length,
  };

  const updateStatus = async (
    id: string,
    action: string
  ) => {
    try {
      await axios.patch(
        `https://saraskansteel-in.onrender.com/api/delivery/${id}/${action}`,
        {},
        { headers }
      );

      loadOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

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
          background: linear-gradient(135deg,#111827,#1f2937);
          color: white;
          border-radius: 22px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .mini {
          background: white;
          border-radius: 18px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        .mini h3 {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }

        .mini h2 {
          margin: 8px 0 0;
        }

        .toolbar {
          background: white;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
          display: grid;
          grid-template-columns: 1fr 220px auto;
          gap: 10px;
          margin-bottom: 18px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 11px 13px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .blue { background:#2563eb; }
        .green { background:#16a34a; }
        .red { background:#dc2626; }
        .yellow { background:#f59e0b; }
        .gray { background:#6b7280; }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 16px;
        }

        .delivery-card {
          background: white;
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .badge {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 1000;
          background: #dbeafe;
          color: #1d4ed8;
          height: fit-content;
        }

        .badge.green {
          background: #dcfce7;
          color: #166534;
        }

        .badge.orange {
          background: #fef3c7;
          color: #92400e;
        }

        .badge.red {
          background: #fee2e2;
          color: #991b1b;
        }

        .info {
          display: grid;
          gap: 6px;
          color: #374151;
          margin-bottom: 12px;
        }

        .address {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .amounts {
          background: #f9fafb;
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 6px 0;
        }

        .danger {
          color: #dc2626;
          font-weight: 1000;
        }

        .success {
          color: #16a34a;
          font-weight: 1000;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        @media(max-width: 1100px) {
          .summary {
            grid-template-columns: repeat(3, 1fr);
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width: 650px) {
          .page {
            padding: 12px;
          }

          .summary {
            grid-template-columns: 1fr 1fr;
          }

          .cards {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🚚 Delivery Management</h1>
          <p style={{ margin: "6px 0 0" }}>
            Monitor deliveries, GPS updates, staff, transporter and delivery status.
          </p>
        </div>

        <div className="summary">
          <div className="mini"><h3>Total</h3><h2>{summary.total}</h2></div>
          <div className="mini"><h3>Processing</h3><h2>{summary.processing}</h2></div>
          <div className="mini"><h3>Out For Delivery</h3><h2>{summary.out}</h2></div>
          <div className="mini"><h3>Delivered</h3><h2 className="success">{summary.delivered}</h2></div>
          <div className="mini"><h3>Failed</h3><h2 className="danger">{summary.failed}</h2></div>
          <div className="mini"><h3>Pay Later</h3><h2>{summary.payLater}</h2></div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search order, customer, mobile, staff, transport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PROCESSING">Processing</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>

          <button className="btn blue" onClick={loadOrders}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="cards">
          {filteredOrders.map((o) => {
            const deliveryStatus = o.deliveryStatus || o.status || "PENDING";
            const hasGps = o.deliveryLat && o.deliveryLng;
            const isDelivered = deliveryStatus === "DELIVERED";
            const isOut = deliveryStatus === "OUT_FOR_DELIVERY";
            const isFailed = deliveryStatus === "FAILED";
            const outstanding = Number(
              o.nowOutstanding || o.customerRecord?.outstandingAmount || 0
            );

            const badgeClass =
              isDelivered
                ? "badge green"
                : isOut
                ? "badge orange"
                : isFailed
                ? "badge red"
                : "badge";

            return (
              <div className="delivery-card" key={o.id}>
                <div className="top">
                  <div>
                    <h3 style={{ margin: 0 }}>{o.orderNumber}</h3>
                    <small>{new Date(o.createdAt).toLocaleDateString()}</small>
                  </div>

                  <span className={badgeClass}>
                    {deliveryStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="info">
                  <div><b>Customer:</b> {o.customerRecord?.name || "-"}</div>
                  <div><b>Mobile:</b> {o.customerRecord?.mobile || "-"}</div>
                  <div><b>Staff:</b> {o.assignedStaff?.name || "-"}</div>
                  <div><b>Transporter:</b> {o.transport?.name || "-"}</div>
                  <div>
                    <b>Last GPS:</b>{" "}
                    {hasGps ? `${o.deliveryLat}, ${o.deliveryLng}` : "-"}
                  </div>
                  <div>
                    <b>GPS Updated:</b>{" "}
                    {o.deliveryUpdatedAt
                      ? new Date(o.deliveryUpdatedAt).toLocaleString()
                      : "-"}
                  </div>
                  <div><b>Note:</b> {o.deliveryNote || "-"}</div>
                </div>

                <div className="address">
                  <b>Delivery Address</b>
                  <p style={{ margin: "6px 0 0" }}>
                    {o.deliveryAddressSnapshot ||
                      o.deliveryLocation ||
                      o.customerRecord?.address ||
                      "-"}
                  </p>
                </div>

                <div className="amounts">
                  <div className="row">
                    <span>Invoice</span>
                    <b>₹{money(o.invoiceValue)}</b>
                  </div>
                  <div className="row">
                    <span>Outstanding</span>
                    <b className={outstanding > 0 ? "danger" : "success"}>
                      ₹{money(outstanding)}
                    </b>
                  </div>
                  <div className="row">
                    <span>Collection</span>
                    <b>{o.collectionStatus || "PENDING"}</b>
                  </div>
                </div>

                <div className="actions">
                  {hasGps && (
                    <a
                      className="btn blue"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps?q=${o.deliveryLat},${o.deliveryLng}`}
                    >
                      Open Map
                    </a>
                  )}

                  {!isOut && !isDelivered && (
                    <button
                      className="btn yellow"
                      onClick={() => updateStatus(o.id, "out-for-delivery")}
                    >
                      Start Delivery
                    </button>
                  )}

                  {isOut && (
                    <>
                      <button
                        className="btn green"
                        onClick={() => updateStatus(o.id, "delivered")}
                      >
                        Mark Delivered
                      </button>

                      <button
                        className="btn red"
                        onClick={() => updateStatus(o.id, "failed")}
                      >
                        Mark Failed
                      </button>
                    </>
                  )}

                  {o.invoice?.id && (
                    <a className="btn" href={`/invoice-view/${o.invoice.id}`}>
                      View Invoice
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="delivery-card">No delivery orders found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default DeliveryManagement;