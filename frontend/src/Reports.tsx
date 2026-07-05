import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [summary, setSummary] = useState<any>({});
  const [productWise, setProductWise] = useState<any[]>([]);
  const [staffWise, setStaffWise] = useState<any[]>([]);
  const [transportWise, setTransportWise] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const query = () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    return params.toString();
  };

  const loadReports = async () => {
    const q = query();

    const [
      summaryRes,
      productRes,
      staffRes,
      transportRes,
      paymentRes,
      outstandingRes,
      lowStockRes,
    ] = await Promise.all([
      axios.get("https://saraskansteel-in.onrender.com/api/reports/summary?" + q, { headers }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/product-wise?" + q, {
        headers,
      }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/staff-wise?" + q, {
        headers,
      }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/transport-wise?" + q, {
        headers,
      }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/payment-mode?" + q, {
        headers,
      }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/outstanding", { headers }),
      axios.get("https://saraskansteel-in.onrender.com/api/reports/low-stock", { headers }),
    ]);

    setSummary(summaryRes.data.data);
    setProductWise(productRes.data.data);
    setStaffWise(staffRes.data.data);
    setTransportWise(transportRes.data.data);
    setPaymentMode(paymentRes.data.data);
    setOutstanding(outstandingRes.data.data);
    setLowStock(lowStockRes.data.data);
  };

  const exportCSV = (filename: string, rows: any[][]) => {
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    const rows: any[][] = [];

    rows.push(["STRIDE REPORTS"]);
    rows.push(["From", from || "All"]);
    rows.push(["To", to || "All"]);
    rows.push([]);

    rows.push(["SUMMARY"]);
    rows.push(["Total Orders", summary.totalOrders || 0]);
    rows.push(["Total Invoices", summary.totalInvoices || 0]);
    rows.push(["Invoice Value", money(summary.totalInvoiceValue)]);
    rows.push(["Total Collection", money(summary.totalCollection)]);
    rows.push(["Cash", money(summary.cashCollection)]);
    rows.push(["UPI", money(summary.upiCollection)]);
    rows.push(["Bank", money(summary.bankCollection)]);
    rows.push(["Cheque", money(summary.chequeCollection)]);
    rows.push(["Outstanding", money(summary.totalOutstanding)]);
    rows.push([]);

    rows.push(["PRODUCT WISE SALES"]);
    rows.push(["Product", "Quantity", "Amount"]);
    productWise.forEach((p) =>
      rows.push([p.productName, p.quantity, money(p.amount)])
    );
    rows.push([]);

    rows.push(["STAFF WISE REPORT"]);
    rows.push(["Staff", "Orders", "Delivered", "Invoice Value", "Collection"]);
    staffWise.forEach((s) =>
      rows.push([
        s.staffName,
        s.orders,
        s.delivered,
        money(s.invoiceValue),
        money(s.collection),
      ])
    );
    rows.push([]);

    rows.push(["TRANSPORT WISE REPORT"]);
    rows.push([
      "Transport",
      "Orders",
      "Delivered",
      "Transport Charge",
      "Invoice Value",
      "Collection",
      "Outstanding",
    ]);
    transportWise.forEach((t) =>
      rows.push([
        t.transportName,
        t.totalOrders,
        t.deliveredOrders,
        money(t.transportCharge),
        money(t.invoiceValue),
        money(t.collection),
        money(t.outstanding),
      ])
    );
    rows.push([]);

    rows.push(["PAYMENT MODE REPORT"]);
    rows.push(["Mode", "Count", "Amount"]);
    paymentMode.forEach((p) =>
      rows.push([p.paymentMode, p.count, money(p.totalAmount)])
    );

    exportCSV("STRIDE_Reports.csv", rows);
  };

  useEffect(() => {
    loadReports();
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
          padding: 24px;
          margin-bottom: 20px;
        }

        .filter-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: 1fr 1fr auto auto;
          gap: 12px;
          margin-bottom: 20px;
          align-items: end;
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
          padding: 12px 15px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .green {
          background: #16a34a;
        }

        .red {
          background: #dc2626;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .summary-card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-card h2 {
          margin: 8px 0 0;
          font-size: 26px;
        }

        .section {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .section h2 {
          margin-top: 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
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
        }

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .success {
          color: #16a34a;
          font-weight: 900;
        }

        .two-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .two-grid {
            grid-template-columns: 1fr;
          }

          .filter-card {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .summary-grid,
          .filter-card {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>📈 Reports</h1>
          <p style={{ margin: "6px 0 0" }}>
            Sales, collection, staff, transport, outstanding and inventory reports.
          </p>
        </div>

        <div className="filter-card">
          <div>
            <label>From Date</label>
            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label>To Date</label>
            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button className="btn" onClick={loadReports}>
            Apply
          </button>

          <button
            className="btn red"
            onClick={() => {
              setFrom("");
              setTo("");
              setTimeout(loadReports, 100);
            }}
          >
            Clear
          </button>

          <button className="btn green" onClick={exportAllReports}>
            Export Excel
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Orders</h3>
            <h2>{summary.totalOrders || 0}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Invoices</h3>
            <h2>{summary.totalInvoices || 0}</h2>
          </div>

          <div className="summary-card">
            <h3>Invoice Value</h3>
            <h2>₹{money(summary.totalInvoiceValue)}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Collection</h3>
            <h2 className="success">₹{money(summary.totalCollection)}</h2>
          </div>

          <div className="summary-card">
            <h3>Cash Collection</h3>
            <h2>₹{money(summary.cashCollection)}</h2>
          </div>

          <div className="summary-card">
            <h3>UPI Collection</h3>
            <h2>₹{money(summary.upiCollection)}</h2>
          </div>

          <div className="summary-card">
            <h3>Bank Collection</h3>
            <h2>₹{money(summary.bankCollection)}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Outstanding</h3>
            <h2 className="danger">₹{money(summary.totalOutstanding)}</h2>
          </div>
        </div>

        <div className="section">
          <h2>Product Wise Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {productWise.map((p, index) => (
                <tr key={index}>
                  <td>{p.productName}</td>
                  <td>{p.quantity}</td>
                  <td>₹{money(p.amount)}</td>
                </tr>
              ))}

              {productWise.length === 0 && (
                <tr>
                  <td colSpan={3}>No product sales found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="two-grid">
          <div className="section">
            <h2>Staff Wise Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Orders</th>
                  <th>Delivered</th>
                  <th>Invoice Value</th>
                  <th>Collection</th>
                </tr>
              </thead>

              <tbody>
                {staffWise.map((s, index) => (
                  <tr key={index}>
                    <td>{s.staffName}</td>
                    <td>{s.orders}</td>
                    <td>{s.delivered}</td>
                    <td>₹{money(s.invoiceValue)}</td>
                    <td>₹{money(s.collection)}</td>
                  </tr>
                ))}

                {staffWise.length === 0 && (
                  <tr>
                    <td colSpan={5}>No staff report found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2>Transport Wise Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Transport</th>
                  <th>Orders</th>
                  <th>Delivered</th>
                  <th>Transport Charge</th>
                  <th>Revenue</th>
                  <th>Outstanding</th>
                </tr>
              </thead>

              <tbody>
                {transportWise.map((t, index) => (
                  <tr key={index}>
                    <td>{t.transportName}</td>
                    <td>{t.totalOrders}</td>
                    <td>{t.deliveredOrders}</td>
                    <td>₹{money(t.transportCharge)}</td>
                    <td>₹{money(t.invoiceValue)}</td>
                    <td>₹{money(t.outstanding)}</td>
                  </tr>
                ))}

                {transportWise.length === 0 && (
                  <tr>
                    <td colSpan={6}>No transport report found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="two-grid">
          <div className="section">
            <h2>Payment Mode Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Payment Mode</th>
                  <th>Count</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {paymentMode.map((p, index) => (
                  <tr key={index}>
                    <td>{p.paymentMode}</td>
                    <td>{p.count}</td>
                    <td>₹{money(p.totalAmount)}</td>
                  </tr>
                ))}

                {paymentMode.length === 0 && (
                  <tr>
                    <td colSpan={3}>No payment data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2>Low Stock Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Unit</th>
                </tr>
              </thead>

              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="danger">{p.stock}</td>
                    <td>{p.unit}</td>
                  </tr>
                ))}

                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={3}>No low stock products.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2>Customer Outstanding Report</h2>

          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Customer ID</th>
                <th>Outstanding</th>
              </tr>
            </thead>

            <tbody>
              {outstanding.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.customerNumber || c.id}</td>
                  <td className="danger">₹{money(c.outstandingAmount)}</td>
                </tr>
              ))}

              {outstanding.length === 0 && (
                <tr>
                  <td colSpan={4}>No outstanding customers.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Reports;