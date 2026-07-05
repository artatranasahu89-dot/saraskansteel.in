import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminCollectionReport() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mode, setMode] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/payments", {
      headers,
    });

    setPayments(res.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = payments.filter((p) => {
    const date = new Date(p.createdAt);

    const fromOk = fromDate ? date >= new Date(fromDate) : true;
    const toOk = toDate ? date <= new Date(toDate + "T23:59:59") : true;
    const modeOk = mode ? p.paymentMode === mode : true;

    const text = `${p.paymentNumber || ""} ${p.customer?.name || ""} ${
      p.customer?.mobile || ""
    } ${p.order?.orderNumber || ""} ${p.collectedByName || ""} ${
      p.source || ""
    }`.toLowerCase();

    return fromOk && toOk && modeOk && text.includes(search.toLowerCase());
  });

  const totalCollected = filtered.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const adminCollected = filtered
    .filter((p) => p.source === "ADMIN")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const staffCollected = filtered
    .filter((p) => p.source === "DELIVERY" || p.source === "STAFF")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const cashCollected = filtered
    .filter((p) => p.paymentMode === "CASH")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Payment No",
        "Customer",
        "Mobile",
        "Order",
        "Amount",
        "Mode",
        "Source",
        "Collected By",
        "Note",
      ],
      ...filtered.map((p) => [
        new Date(p.createdAt).toLocaleDateString(),
        p.paymentNumber || "",
        p.customer?.name || "",
        p.customer?.mobile || "",
        p.order?.orderNumber || "",
        money(p.amount),
        p.paymentMode || "",
        p.source || "",
        p.collectedByName || "",
        p.note || "",
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
    a.download = "STRIDE_Collection_Report.csv";
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
          grid-template-columns: repeat(4,1fr);
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
          grid-template-columns: 1fr 160px 160px 150px auto auto;
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
        .blue { color:#2563eb; font-weight:900; }
        .success { color:#16a34a; font-weight:900; }
        .danger { color:#dc2626; font-weight:900; }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1150px;
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
          background: #dbeafe;
          color: #1d4ed8;
        }

        @media(max-width:1000px){
          .grid {
            grid-template-columns: 1fr 1fr;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }

        @media(max-width:600px){
          .page {
            padding: 12px;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>💰 Collection Report</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track admin collections, delivery collections, payment modes and customer payments.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Total Collected</h3>
            <h2 className="success">₹{money(totalCollected)}</h2>
          </div>

          <div className="card">
            <h3>Admin Collection</h3>
            <h2>₹{money(adminCollected)}</h2>
          </div>

          <div className="card">
            <h3>Staff Collection</h3>
            <h2 className="blue">₹{money(staffCollected)}</h2>
          </div>

          <div className="card">
            <h3>Cash Collection</h3>
            <h2 className="danger">₹{money(cashCollected)}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search customer, mobile, order, collector..."
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

          <select
            className="input"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CREDIT">Credit</option>
          </select>

          <button className="btn green" onClick={exportCSV}>
            Export Excel
          </button>

          <button
            className="btn red"
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
              setMode("");
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
                  <th>Date</th>
                  <th>Payment No</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Source</th>
                  <th>Collected By</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.paymentNumber || "-"}</td>
                    <td>{p.customer?.name || "-"}</td>
                    <td>{p.customer?.mobile || "-"}</td>
                    <td>{p.order?.orderNumber || "-"}</td>
                    <td className="success">₹{money(p.amount)}</td>
                    <td>{p.paymentMode || "-"}</td>
                    <td>
                      <span className="badge">{p.source || "-"}</span>
                    </td>
                    <td>{p.collectedByName || "-"}</td>
                    <td>{p.note || "-"}</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10}>No collection records found.</td>
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

export default AdminCollectionReport;