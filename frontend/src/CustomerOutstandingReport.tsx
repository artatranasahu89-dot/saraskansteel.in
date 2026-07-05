import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function CustomerOutstandingReport() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [minOutstanding, setMinOutstanding] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const customerRes = await axios.get("https://saraskansteel-in.onrender.com/api/customers", {
      headers,
    });

    const paymentRes = await axios.get("https://saraskansteel-in.onrender.com/api/payments", {
      headers,
    });

    const orderRes = await axios.get("https://saraskansteel-in.onrender.com/api/order-data", {
      headers,
    });

    setCustomers(customerRes.data.data || []);
    setPayments(paymentRes.data.data || []);
    setOrders(orderRes.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getLastPayment = (customerId: string) => {
    const list = payments
      .filter((p) => p.customerId === customerId || p.customer?.id === customerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return list[0];
  };

  const getLastOrder = (customerId: string) => {
    const list = orders
      .filter(
        (o) =>
          o.customerRecordId === customerId ||
          o.customerRecord?.id === customerId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return list[0];
  };

  const reportRows = customers
    .map((c) => {
      const outstanding = Number(c.outstandingAmount || 0);
      const lastPayment = getLastPayment(c.id);
      const lastOrder = getLastOrder(c.id);

      return {
        ...c,
        outstanding,
        lastPayment,
        lastOrder,
      };
    })
    .filter((c) => {
      const text = `${c.name || ""} ${c.mobile || ""} ${
        c.customerNumber || ""
      }`.toLowerCase();

      const searchOk = text.includes(search.toLowerCase());
      const outstandingOk = minOutstanding
        ? c.outstanding >= Number(minOutstanding)
        : c.outstanding > 0;

      return searchOk && outstandingOk;
    })
    .sort((a, b) => b.outstanding - a.outstanding);

  const totalOutstanding = reportRows.reduce(
    (sum, c) => sum + Number(c.outstanding || 0),
    0
  );

  const highRisk = reportRows.filter((c) => c.outstanding >= 200000).length;

  const exportCSV = () => {
    const rows = [
      [
        "Customer",
        "Mobile",
        "Customer ID",
        "Outstanding",
        "Last Invoice/Order Date",
        "Last Payment Date",
        "Last Payment Amount",
        "Credit Status",
      ],
      ...reportRows.map((c) => [
        c.name || "",
        c.mobile || "",
        c.customerNumber || "",
        money(c.outstanding),
        c.lastOrder
          ? new Date(c.lastOrder.createdAt).toLocaleDateString()
          : "",
        c.lastPayment
          ? new Date(c.lastPayment.createdAt).toLocaleDateString()
          : "",
        c.lastPayment ? money(c.lastPayment.amount) : "",
        c.outstanding >= 200000
          ? "HIGH RISK"
          : c.outstanding > 0
          ? "PENDING"
          : "CLEAR",
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
    a.download = "STRIDE_Customer_Outstanding_Report.csv";
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
          grid-template-columns: 1fr 180px auto auto;
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
        .success { color:#16a34a; font-weight:900; }
        .orange { color:#f59e0b; font-weight:900; }

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

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .badge.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.pending {
          background: #fef3c7;
          color: #92400e;
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
          <h1 style={{ margin: 0 }}>🔴 Customer Outstanding Report</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track customer dues, last invoice, last payment and high-risk credit customers.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Total Customers With Due</h3>
            <h2>{reportRows.length}</h2>
          </div>

          <div className="card">
            <h3>Total Outstanding</h3>
            <h2 className="danger">₹{money(totalOutstanding)}</h2>
          </div>

          <div className="card">
            <h3>High Risk Above ₹2,00,000</h3>
            <h2 className="orange">{highRisk}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search customer, mobile or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Min outstanding"
            value={minOutstanding}
            onChange={(e) => setMinOutstanding(e.target.value)}
          />

          <button className="btn green" onClick={exportCSV}>
            Export Excel
          </button>

          <button
            className="btn red"
            onClick={() => {
              setSearch("");
              setMinOutstanding("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Customer ID</th>
                  <th>Outstanding</th>
                  <th>Last Invoice / Order</th>
                  <th>Last Payment</th>
                  <th>Last Payment Amount</th>
                  <th>Credit Status</th>
                </tr>
              </thead>

              <tbody>
                {reportRows.map((c) => {
                  const high = c.outstanding >= 200000;

                  return (
                    <tr key={c.id}>
                      <td>{c.name || "-"}</td>
                      <td>{c.mobile || "-"}</td>
                      <td>{c.customerNumber || "-"}</td>
                      <td className="danger">₹{money(c.outstanding)}</td>
                      <td>
                        {c.lastOrder
                          ? new Date(c.lastOrder.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {c.lastPayment
                          ? new Date(c.lastPayment.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="success">
                        {c.lastPayment
                          ? `₹${money(c.lastPayment.amount)}`
                          : "-"}
                      </td>
                      <td>
                        <span className={high ? "badge high" : "badge pending"}>
                          {high ? "HIGH RISK" : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {reportRows.length === 0 && (
                  <tr>
                    <td colSpan={8}>No outstanding customers found.</td>
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

export default CustomerOutstandingReport;
