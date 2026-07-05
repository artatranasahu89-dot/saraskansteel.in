import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function TransportPaymentReport() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const res = await axios.get("http://localhost:5000/api/order-data", {
      headers,
    });

    setOrders(res.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const deliveredOrders = orders.filter((o) => {
    const isDelivered =
      o.status === "DELIVERED" || o.deliveryStatus === "DELIVERED";

    const deliveredDate = new Date(o.deliveredAt || o.updatedAt || o.createdAt);

    const fromOk = fromDate ? deliveredDate >= new Date(fromDate) : true;
    const toOk = toDate
      ? deliveredDate <= new Date(toDate + "T23:59:59")
      : true;

    const text = `${o.orderNumber || ""} ${o.customerRecord?.name || ""} ${
      o.customerRecord?.mobile || ""
    } ${o.transport?.name || ""} ${o.deliveryAddressSnapshot || ""}`.toLowerCase();

    return isDelivered && fromOk && toOk && text.includes(search.toLowerCase());
  });

  const transportRows = Object.values(
    deliveredOrders.reduce((acc: any, o: any) => {
      const name = o.transport?.name || "No Transporter";
      const id = o.transport?.id || "NO_TRANSPORTER";
      const charge =
        Number(o.transportCharge || 0) ||
        Number(o.invoice?.transportCharge || 0);

      if (!acc[id]) {
        acc[id] = {
          id,
          name,
          mobile: o.transport?.mobile || "-",
          orders: 0,
          amount: 0,
        };
      }

      acc[id].orders += 1;
      acc[id].amount += charge;

      return acc;
    }, {})
  );

  const totalPayable = transportRows.reduce(
    (sum: number, r: any) => sum + Number(r.amount || 0),
    0
  );

  const exportCSV = () => {
    const rows = [
      [
        "Transporter",
        "Mobile",
        "Delivered Orders",
        "Total Payable",
        "",
        "Order No",
        "Customer",
        "Customer Mobile",
        "Delivered Date",
        "Delivery Address",
        "Transport Charge",
      ],
      ...deliveredOrders.map((o) => [
        o.transport?.name || "No Transporter",
        o.transport?.mobile || "-",
        "",
        "",
        "",
        o.orderNumber || "",
        o.customerRecord?.name || "",
        o.customerRecord?.mobile || "",
        new Date(o.deliveredAt || o.updatedAt || o.createdAt).toLocaleDateString(),
        o.deliveryAddressSnapshot ||
          o.deliveryLocation ||
          o.customerRecord?.address ||
          "",
        money(
          Number(o.transportCharge || 0) ||
            Number(o.invoice?.transportCharge || 0)
        ),
      ]),
    ];

    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "STRIDE_Transport_Payment_Report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .card,
        .toolbar,
        .table-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
          margin-bottom: 20px;
        }

        .card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .card h2 {
          margin: 8px 0 0;
          font-size: 27px;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 170px 170px auto auto;
          gap: 10px;
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
          padding: 11px 14px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .green { background:#16a34a; }
        .red { background:#dc2626; }
        .danger { color:#dc2626; font-weight:900; }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        th {
          background: #f3f4f6;
          text-align: left;
          padding: 12px;
          font-size: 13px;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .address {
          max-width: 320px;
          white-space: normal;
          line-height: 1.4;
        }

        @media(max-width:900px){
          .grid,
          .toolbar {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }

          .page {
            padding: 12px;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🚚 Transport Payment Report</h1>
          <p style={{ margin: "6px 0 0" }}>
            Filter delivered orders and calculate transporter payable with delivery addresses.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Delivered Orders</h3>
            <h2>{deliveredOrders.length}</h2>
          </div>

          <div className="card">
            <h3>Transporters</h3>
            <h2>{transportRows.length}</h2>
          </div>

          <div className="card">
            <h3>Total Transport Payable</h3>
            <h2 className="danger">₹{money(totalPayable)}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search transporter, order, customer, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            className="input"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            className="input"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <button className="btn green" onClick={exportCSV}>
            Export Excel
          </button>

          <button
            className="btn red"
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="table-card">
          <h2>Transporter Summary</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transporter</th>
                  <th>Mobile</th>
                  <th>Delivered Orders</th>
                  <th>Total Payable</th>
                </tr>
              </thead>

              <tbody>
                {transportRows.map((r: any) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.mobile}</td>
                    <td>{r.orders}</td>
                    <td className="danger">₹{money(r.amount)}</td>
                  </tr>
                ))}

                {transportRows.length === 0 && (
                  <tr>
                    <td colSpan={4}>No transport payment found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h2>Delivered Order Details</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Delivered Date</th>
                  <th>Transporter</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Delivery Address</th>
                  <th>Transport Charge</th>
                </tr>
              </thead>

              <tbody>
                {deliveredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>
                      {new Date(
                        o.deliveredAt || o.updatedAt || o.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>{o.transport?.name || "No Transporter"}</td>
                    <td>{o.customerRecord?.name || "-"}</td>
                    <td>{o.customerRecord?.mobile || "-"}</td>
                    <td className="address">
                      {o.deliveryAddressSnapshot ||
                        o.deliveryLocation ||
                        o.customerRecord?.address ||
                        "-"}
                    </td>
                    <td className="danger">
                      ₹
                      {money(
                        Number(o.transportCharge || 0) ||
                          Number(o.invoice?.transportCharge || 0)
                      )}
                    </td>
                  </tr>
                ))}

                {deliveredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7}>No delivered order details found.</td>
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

export default TransportPaymentReport;