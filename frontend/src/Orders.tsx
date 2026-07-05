import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function OrderData() {
  const [orders, setOrders] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    date: "",
    mobile: "",
    paymentStatus: "",
    paymentMethod: "",
    transportId: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const getTotalPaid = (order: any) =>
    (order.payments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    );

  const getLastPayment = (order: any) => {
    if (!order.payments?.length) return null;

    return [...order.payments].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getPaymentCount = (order: any) => order.payments?.length || 0;

  const loadData = async () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const res = await axios.get(
      "http://localhost:5000/api/order-data?" + params.toString(),
      { headers }
    );

    const staffRes = await axios.get("http://localhost:5000/api/staff", {
      headers,
    });

    setOrders(res.data.data || []);
    setTransports(
      (staffRes.data.data || []).filter(
        (s: any) => s.type === "TRANSPORT" && s.active
      )
    );
  };

  const markDelivered = async (orderId: string) => {
    await axios.patch(
      `http://localhost:5000/api/order-data/${orderId}/delivered`,
      {},
      { headers }
    );

    alert("Marked delivered");
    loadData();
  };

  const showPaymentHistory = (order: any) => {
    const history = (order.payments || [])
      .map(
        (p: any) =>
          `${p.paymentNumber || "PMT"} | ${p.paymentMode} | ₹${money(
            p.amount
          )} | ${new Date(p.createdAt).toLocaleDateString()}`
      )
      .join("\n");

    alert(history || "No payments found");
  };

  const exportExcel = () => {
    const rows = [
      [
        "Date",
        "Order ID",
        "Customer Name",
        "Mobile Number",
        "Delivery Address",
        "Invoice Value",
        "Previous Outstanding",
        "Final Payable",
        "Total Paid",
        "Last Payment",
        "Payment Date",
        "Payment Count",
        "Customer Current Outstanding",
        "Payment Method",
        "Payment Status",
        "Transport",
        "Assigned Staff",
        "Order Status",
      ],
      ...orders.map((o) => {
        const lastPayment = getLastPayment(o);

        return [
          new Date(o.createdAt).toLocaleDateString(),
          o.orderNumber || "",
          o.customerRecord?.name || "",
          o.customerRecord?.mobile || "",
          o.deliveryAddressSnapshot || o.customerRecord?.address || "",
          money(o.invoiceValue),
          money(o.previousOutstanding),
          money(o.totalPayable),
          money(getTotalPaid(o)),
          lastPayment ? money(lastPayment.amount) : "",
          lastPayment ? new Date(lastPayment.createdAt).toLocaleDateString() : "",
          getPaymentCount(o),
          money(o.customerRecord?.outstandingAmount || 0),
          lastPayment?.paymentMode || o.paymentMethod || "",
          o.paymentStatus || "",
          o.transport?.name || "",
          o.assignedStaff?.name || "",
          o.status || "",
        ];
      }),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "STRIDE_Order_Data.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

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
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 20px;
        }

        .filters {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(6, minmax(140px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
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
          padding: 11px 13px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
          gap: 16px;
        }

        .order-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .status {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          background: #fef3c7;
          color: #92400e;
          height: fit-content;
        }

        .status.PAID {
          background: #dcfce7;
          color: #166534;
        }

        .status.PARTIAL {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status.PENDING {
          background: #fef3c7;
          color: #92400e;
        }

        .info {
          display: grid;
          gap: 5px;
          color: #374151;
          margin-bottom: 12px;
        }

        .address-card {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 12px;
          color: #1e3a8a;
        }

        .address-card small {
          display: block;
          color: #2563eb;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .address-card p {
          margin: 0;
          line-height: 1.4;
        }

        .amount-box {
          background: #f9fafb;
          border-radius: 12px;
          padding: 10px;
          display: grid;
          gap: 7px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .final-row {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          font-size: 17px;
        }

        .outstanding-row {
          color: #dc2626;
          font-size: 18px;
          font-weight: 900;
        }

        .paid-row {
          color: #16a34a;
          font-weight: 900;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .green { background: #16a34a; }
        .blue { background: #2563eb; }
        .red { background: #dc2626; }

        @media (max-width: 1000px) {
          .filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .filters,
          .cards {
            grid-template-columns: 1fr;
          }

          .actions .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>📊 Order Data</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track invoice value, payment history, delivery and customer current outstanding.
          </p>
        </div>

        <div className="filters">
          <input
            className="input"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />

          <input
            className="input"
            placeholder="Mobile number"
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
          />

          <select
            className="input"
            value={filters.paymentStatus}
            onChange={(e) =>
              setFilters({ ...filters, paymentStatus: e.target.value })
            }
          >
            <option value="">Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>

          <select
            className="input"
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters({ ...filters, paymentMethod: e.target.value })
            }
          >
            <option value="">Payment Mode</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CREDIT">Credit</option>
          </select>

          <select
            className="input"
            value={filters.transportId}
            onChange={(e) =>
              setFilters({ ...filters, transportId: e.target.value })
            }
          >
            <option value="">Transport</option>
            {transports.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button className="btn" onClick={loadData}>
            Apply
          </button>

          <button
            className="btn blue"
            onClick={() => {
              setFilters({
                date: "",
                mobile: "",
                paymentStatus: "",
                paymentMethod: "",
                transportId: "",
              });
              setTimeout(loadData, 100);
            }}
          >
            Clear
          </button>

          <button className="btn green" onClick={exportExcel}>
            Export Excel
          </button>
        </div>

        <div className="cards">
          {orders.map((o) => {
            const lastPayment = getLastPayment(o);

            return (
              <div className="order-card" key={o.id}>
                <div className="top">
                  <div>
                    <h3 style={{ margin: 0 }}>{o.orderNumber}</h3>
                    <p style={{ margin: "4px 0", color: "#6b7280" }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`status ${o.paymentStatus}`}>
                    {o.paymentStatus}
                  </span>
                </div>

                <div className="info">
                  <div><b>Name:</b> {o.customerRecord?.name || "-"}</div>
                  <div><b>Mobile:</b> {o.customerRecord?.mobile || "-"}</div>
                  <div><b>Transport:</b> {o.transport?.name || "-"}</div>
                  <div><b>Staff:</b> {o.assignedStaff?.name || "-"}</div>
                  <div><b>Order Status:</b> {o.status}</div>
                  <div><b>Collection Status:</b> {o.collectionStatus || "PENDING"}</div>

                  {o.collectionRemark && (
                    <div><b>Pay Later Remark:</b> {o.collectionRemark}</div>
                  )}
                </div>

                <div className="address-card">
                  <small>Delivery Address</small>
                  <p>
                    {o.deliveryAddressSnapshot ||
                      o.deliveryLocation ||
                      o.customerRecord?.address ||
                      "-"}
                  </p>
                </div>

                <div className="amount-box">
                  <div className="row">
                    <span>Invoice Value</span>
                    <b>₹{money(o.invoiceValue)}</b>
                  </div>

                  <div className="row">
                    <span>Previous Outstanding</span>
                    <b>₹{money(o.previousOutstanding)}</b>
                  </div>

                  <div className="row final-row">
                    <span>Final Payable</span>
                    <b>₹{money(o.totalPayable)}</b>
                  </div>

                  <div className="row paid-row">
                    <span>Total Paid</span>
                    <b>₹{money(getTotalPaid(o))}</b>
                  </div>

                  <div className="row">
                    <span>Last Payment</span>
                    <b>{lastPayment ? `₹${money(lastPayment.amount)}` : "-"}</b>
                  </div>

                  <div className="row">
                    <span>Payment Date</span>
                    <b>
                      {lastPayment
                        ? new Date(lastPayment.createdAt).toLocaleDateString()
                        : "-"}
                    </b>
                  </div>

                  <div className="row">
                    <span>Payment Count</span>
                    <b>{getPaymentCount(o)}</b>
                  </div>

                  <div className="row outstanding-row">
                    <span>Customer Current Outstanding</span>
                    <span>₹{money(o.customerRecord?.outstandingAmount || 0)}</span>
                  </div>

                  <div className="row">
                    <span>Last Payment Mode</span>
                    <b>{lastPayment?.paymentMode || o.paymentMethod || "-"}</b>
                  </div>

                  <div className="row">
                    <span>Collection Status</span>
                    <b>{o.collectionStatus || "PENDING"}</b>
                  </div>
                </div>

                <div className="actions">
                  {Number(o.customerRecord?.outstandingAmount || 0) > 0 &&
                    o.collectionStatus !== "PAY_LATER" && (
                      <button
                        className="btn"
                        style={{ background: "#f59e0b" }}
                        onClick={() => {
                          const mobile = o.customerRecord?.mobile;

                          if (!mobile) {
                            alert("Customer mobile not found");
                            return;
                          }

                          window.location.href = `/pay-bill?mobile=${mobile}&from=order-data`;
                        }}
                      >
                        Collect Payment
                      </button>
                    )}

                  <button className="btn blue" onClick={() => showPaymentHistory(o)}>
                    Payment History
                  </button>

                  {o.invoice?.id && (
                    <button
                      className="btn blue"
                      onClick={() =>
                        (window.location.href = `/invoice-view/${o.invoice.id}`)
                      }
                    >
                      View Invoice
                    </button>
                  )}

                  {o.status !== "DELIVERED" && (
                    <button className="btn green" onClick={() => markDelivered(o.id)}>
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {orders.length === 0 && <p>No order data found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderData;